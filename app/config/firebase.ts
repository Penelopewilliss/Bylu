import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDrJLBrJnaJm5C-EDU6mwv3I-3deW3I-QQ",
  authDomain: "glowgetter-199ce.firebaseapp.com",
  projectId: "glowgetter-199ce",
  storageBucket: "glowgetter-199ce.firebasestorage.app",
  messagingSenderId: "745487345733",
  appId: "1:745487345733:android:914ff15cd038c8b4ee9b2c"
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Initialize Firebase Auth
const auth = getAuth(app);

// Initialize Firestore
const db = getFirestore(app);

export { app, auth, db };
