import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Agregar configuración firebase:
var firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

const firebaseApp = initializeApp(firebaseConfig)
const firebaseAuth = getAuth(firebaseApp)
const firebaseSignIn = signInWithEmailAndPassword
const firebaseOnAuthStateChanged = onAuthStateChanged
const firebaseSignOut = signOut
const firebaseDb = getFirestore(firebaseApp)
const firebaseUpdateProfile = updateProfile
const firebaseUpdatePassword = updatePassword
const firebaseReauthenticate = reauthenticateWithCredential
const firebaseEmailAuthProvider = EmailAuthProvider
const firebaseStorage = getStorage(firebaseApp);

export {
  firebaseAuth,
  firebaseSignIn,
  firebaseOnAuthStateChanged,
  firebaseApp,
  firebaseSignOut,
  firebaseDb,
  firebaseUpdateProfile,
  firebaseUpdatePassword,
  firebaseReauthenticate,
  firebaseEmailAuthProvider,
  firebaseStorage
}
