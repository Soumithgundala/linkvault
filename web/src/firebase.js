
// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCgqQBEVpUhAvXNSMw-UeqpWAVoi0IPpbs",
  authDomain: "linkvault-c721c.firebaseapp.com",
  projectId: "linkvault-c721c",
  storageBucket: "linkvault-c721c.firebasestorage.app",
  messagingSenderId: "364673225195",
  appId: "1:364673225195:web:f8e36e8ddaf0829beac9ae"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };