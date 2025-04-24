// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCgqQBEVpUhAvXNSMw-UeqpWAVoi0IPpbs",
  authDomain: "linkvault-c721c.firebaseapp.com",
  projectId: "linkvault-c721c",
  storageBucket: "linkvault-c721c.firebasestorage.app",
  messagingSenderId: "364673225195",
  appId: "1:364673225195:web:f8e36e8ddaf0829beac9ae"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth and set persistence
const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence)
  .catch((error) => {
    console.error("Error setting persistence:", error);
  });

// Initialize Firestore
const db = getFirestore(app);

// Export services (remove undefined "username")
export { auth, db };
export default app;