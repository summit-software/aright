import {
  firebaseAuth,
  firebaseOnAuthStateChanged,
  firebaseSignOut,
  firebaseUpdateProfile,
  firebaseStorage,
  firebaseActionCodeSettings,
  firebaseSendSignInLink,
  firebaseIsSignInWithLink,
  firebaseSignInWithLink,
  firebaseGoogleAuthProvider,
  firebaseSignInWithPopup,
  firebaseAppleOAuthProvider,
  firebaseFacebookAuthProvider
} from '../../boot/firebase';
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { Notify, Dark } from 'quasar'
import { i18n } from '../../boot/i18n';
import md5 from 'md5'
import { userStore } from '../user/index.js'
import { bookStore } from '../book/index.js'

const $t = i18n.global.t;

export default {
  async login (payload) {
    this.user.loading = true
    switch (payload.type) {
      case 'google':
        await this.signInWithPopup(firebaseGoogleAuthProvider)
        break;
      case 'apple':
        await this.signInWithPopup(firebaseAppleOAuthProvider)
        break;
      case 'facebook':
        await this.signInWithPopup(firebaseFacebookAuthProvider)
        break;
      case 'link':
        await this.sendSignInLink(payload)
        break;
      default:
        this.user.loading = false
        break;
    }
    this.user.loading = false
  },
  async signInWithPopup (provider) {
    await firebaseSignInWithPopup(firebaseAuth, provider).then((result) => {
      this.user = result.user
      this.redirectToBook()
      // Apple credential
      // const credential = OAuthProvider.credentialFromResult(result);
      // const accessToken = credential.accessToken;
      // const idToken = credential.idToken;

      // This gives you a Facebook Access Token. You can use it to access the Facebook API.
      // const credential = FacebookAuthProvider.credentialFromResult(result);
      // const accessToken = credential.accessToken;

      // This gives you a Google Access Token. You can use it to access the Google API.
      // const credential = GoogleAuthProvider.credentialFromResult(result);
      // const token = credential.accessToken;
    }).catch((error) => {
      const errorCode = error.code;
      console.error(error)
      const message = errorCode === 'auth/account-exists-with-different-credential' ? $t('auth.accountExistsWithDifferentCredential') : $t('auth.problemTryingToLogin')
      const type = errorCode === 'auth/account-exists-with-different-credential' ? 'warning' : 'negative'
      const timeout = errorCode === 'auth/account-exists-with-different-credential' ? 20000 : 5000
      Notify.create({
        message,
        type,
        timeout
      })
    });
  },
  async sendSignInLink (payload) {
    await firebaseSendSignInLink(firebaseAuth, payload.email, firebaseActionCodeSettings).then(() => {
      window.localStorage.setItem('emailForSignIn', payload.email);
      Notify.create({
        message: $t('auth.checkYourEmail'),
        type: 'positive',
        timeout: 20000
      })
    }).catch((error) => {
      const errorCode = error.code;
      console.error(error)
      Notify.create({
        message: $t('auth.problemTryingToLogin') + ' | ' + errorCode,
        type: 'negative'
      })
    });
  },
  async checkLinkLogin () {
    let email = window.localStorage.getItem('emailForSignIn');
    if (!email) {
      return
    }
    if (firebaseIsSignInWithLink(firebaseAuth, window.location.href)) {
      await firebaseSignInWithLink(firebaseAuth, email, window.location.href).then((result) => {
        window.localStorage.removeItem('emailForSignIn');
        this.user = result.user
        this.redirectToBook()
        // You can access the new user via result.user
        // Additional user info profile not available via:
        // result.additionalUserInfo.profile == null
        // You can check if the user is new or existing:
        // result.additionalUserInfo.isNewUser
      }).catch((error) => {
        const errorCode = error.code;
        console.error(error)
        Notify.create({
          message: $t('auth.problemTryingToLogin') + ' | ' + errorCode,
          type: 'negative'
        })
      });
    }
  },
  logout () {
    firebaseSignOut(firebaseAuth).then(() => {
      const storedUser = userStore()
      const storedBook = bookStore()
      storedUser.$reset()
      storedBook.$reset()
      this.$reset()
      this.user = { loading: false }
    }).catch((error) => {
      console.error(error)
    });
  },
  handleAuthStateChange () {
    firebaseOnAuthStateChanged(firebaseAuth, (user) => {
      this.user = { ...user, loading: false }
      Dark.set(this.darkMode)
      const currentRoute = this.router.currentRoute.value
      if (!this.user?.uid && currentRoute.meta.requiresAuth) {
        this.router.push({ name: 'Auth' })
      } else if (this.user?.uid && currentRoute.name === 'Auth') {
        const bookId = currentRoute.params?.bookId || null
        this.router.push({ name: 'Book', params: { bookId } })
      }
    });
  },
  updateProfile (payload) {
    this.user.loading = true
    firebaseUpdateProfile(firebaseAuth.currentUser, payload).then(() => {
      this.user.loading = false
      Notify.create({
        message: $t('auth.profileUpdated'),
        type: 'positive'
      })
    }).catch((error) => {
      this.user.loading = false
      console.error(error)
      Notify.create({
        message: $t('auth.problemUpdatingProfile') + ' | ' + error.code,
        type: 'negative'
      })
    })
  },
  uploadAvatar (avatar) {
    return new Promise((resolve, reject) => {
      this.user.loading = true
      const storageRef = ref(firebaseStorage, `users/${this.user.uid}/avatar/avatar.jpeg`)
      this.resizeBase64Image(avatar).then(resized => {
        uploadString(storageRef, resized, 'data_url').then(() => {
          getDownloadURL(storageRef).then(photoURL => {
            this.user.photoURL = this.updateParamsUrl(photoURL, { dark: this.darkMode, lang: this.language })
            this.updateProfile({ photoURL: this.user.photoURL })
            this.user.loading = false
            resolve()
          })
        }).catch((error) => {
          this.user.loading = false
          reject(error)
        })
      })
    })
  },
  resizeBase64Image (base64, width = 200) {
    return new Promise((resolve, reject) => {
      var img = new Image()
      img.src = base64
      img.onload = (el) => {
        var elem = document.createElement('canvas')
        var scaleFactor = width / el.target.width
        elem.width = width
        elem.height = el.target.height * scaleFactor
        var ctx = elem.getContext('2d')
        ctx.drawImage(el.target, 0, 0, elem.width, elem.height)
        resolve(ctx.canvas.toDataURL('image/jpeg', 0.8))
      }
    })
  },
  updateParamsUrl (url, params) {
    url = url || 'https://www.gravatar.com/avatar/' + md5(this.user.email)
    url = new URL(url)
    for (const param in params) {
      url.searchParams.set(param, params[param])
    }
    return new URL(
      `${url.origin}${url.pathname}?${new URLSearchParams([
        ...Array.from(url.searchParams.entries())
      ]).toString()}`
    ).href
  },
  toggleDarkMode () {
    Dark.toggle()
    this.user.photoURL = this.updateParamsUrl(this.user.photoURL, { dark: !this.darkMode })
    this.updateProfile({ photoURL: this.user.photoURL })
  },
  redirectToBook (bookId) {
    bookId = bookId || this.router.currentRoute.value.params?.bookId || null
    this.router.push({ name: 'Book', params: { bookId } })
  }
}
