import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDLAMczj7q1mAqONV4opj2Q92qjp4FSxrE",
  authDomain: "db-cit.firebaseapp.com",
  databaseURL: "https://db-cit-default-rtdb.firebaseio.com",
  projectId: "db-cit",
  storageBucket: "db-cit.appspot.com",  // Corrected this line
  messagingSenderId: "401276066395",
  appId: "1:401276066395:web:5511c1015321a3260dbd7e",
  measurementId: "G-W7L6PRCK17"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
