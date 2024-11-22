// Import necessary Firebase services
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage'; // Import Firebase Storage

// Firebase configuration object (you should keep this secure)
const firebaseConfig = {
  apiKey: "AIzaSyDLAMczj7q1mAqONV4opj2Q92qjp4FSxrE",
  authDomain: "db-cit.firebaseapp.com",
  databaseURL: "https://db-cit-default-rtdb.firebaseio.com",
  projectId: "db-cit",
  storageBucket: "db-cit.appspot.com", // Make sure this is set to your Firebase Storage bucket
  messagingSenderId: "401276066395",
  appId: "1:401276066395:web:5511c1015321a3260dbd7e",
  measurementId: "G-W7L6PRCK17"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Authentication
export const auth = getAuth(app);

// Initialize Firebase Storage
export const storage = getStorage(app); // Initialize and export storage
