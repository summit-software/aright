import { initializeApp } from 'firebase/app';
import {
  getAuth,
  sendSignInLinkToEmail,
  onAuthStateChanged,
  signOut,
  updateProfile,
  isSignInWithEmailLink,
  signInWithEmailLink,
  GoogleAuthProvider,
  signInWithPopup,
  OAuthProvider,
  FacebookAuthProvider
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

var firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
  dinamicLinksApi: process.env.FIREBASE_DINAMIC_LINKS_API
};

const firebaseActionCodeSettings = {
  // URL you want to redirect back to. The domain (www.example.com) for this
  // URL must be in the authorized domains list in the Firebase Console.
  url: process.env.FIREBASE_DINAMIC_LINKS_URL,
  handleCodeInApp: true,
  iOS: {
    bundleId: process.env.IOS_BUNDLE_ID
  },
  android: {
    packageName: process.env.ANDROID_PACKAGE_NAME,
    installApp: true,
    minimumVersion: '12'
  },
  dynamicLinkDomain: process.env.FIREBASE_DINAMIC_LINKS_DOMAIN
};

const firebaseDynamicLinkInfo = {
  domainUriPrefix: process.env.FIREBASE_DINAMIC_LINKS_DOMAIN,
  link: process.env.APP_URL,
  androidInfo: {
    androidPackageName: process.env.ANDROID_PACKAGE_NAME,
    androidMinPackageVersionCode: '12'
  },
  iosInfo: {
    iosBundleId: process.env.IOS_BUNDLE_ID
  }
};

const firebaseApp = initializeApp(firebaseConfig)
const firebaseAuth = getAuth(firebaseApp)
firebaseAuth.useDeviceLanguage();
const firebaseSendSignInLink = sendSignInLinkToEmail
const firebaseOnAuthStateChanged = onAuthStateChanged
const firebaseSignOut = signOut
const firebaseDb = getFirestore(firebaseApp)
const firebaseUpdateProfile = updateProfile
const firebaseStorage = getStorage(firebaseApp);
const firebaseIsSignInWithLink = isSignInWithEmailLink
const firebaseSignInWithLink = signInWithEmailLink
const firebaseGoogleAuthProvider = new GoogleAuthProvider();
const firebaseSignInWithPopup = signInWithPopup
const firebaseAppleOAuthProvider = new OAuthProvider('apple.com');
const firebaseFacebookAuthProvider = new FacebookAuthProvider();

export {
  firebaseAuth,
  firebaseSendSignInLink,
  firebaseOnAuthStateChanged,
  firebaseApp,
  firebaseSignOut,
  firebaseDb,
  firebaseUpdateProfile,
  firebaseStorage,
  firebaseActionCodeSettings,
  firebaseIsSignInWithLink,
  firebaseSignInWithLink,
  firebaseGoogleAuthProvider,
  firebaseSignInWithPopup,
  firebaseAppleOAuthProvider,
  firebaseFacebookAuthProvider,
  firebaseDynamicLinkInfo,
  firebaseConfig
}
