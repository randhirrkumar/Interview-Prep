import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyC5ndeb5dR-q43jW3xcaIsKmZmkasyrhEA",
  authDomain: "interview-prep-118b9.firebaseapp.com",
  projectId: "interview-prep-118b9",
  storageBucket: "interview-prep-118b9.firebasestorage.app",
  messagingSenderId: "326347854871",
  appId: "1:326347854871:web:1bc8ef8ca950221e677852"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const googleProvider = new GoogleAuthProvider()
