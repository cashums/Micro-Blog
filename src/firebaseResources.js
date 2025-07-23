import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDuj0qewxj6fg5_lBokMT5W5LXuwD_k2ac",
  authDomain: "cs110-c66cf.firebaseapp.com",
  projectId: "cs110-c66cf",
  storageBucket: "cs110-c66cf.firebasestorage.app",
  messagingSenderId: "591194023370",
  appId: "1:591194023370:web:17a757713f3bb284325b33"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app);
export const auth = getAuth(app);
