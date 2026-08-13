import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration loaded from environment variables
const firebaseConfig = {
  apiKey: import.meta.env["VITE_FIREBASE_API_KEY"] || "AIzaSyDv8OOW7LpVjO5KD8bZfhuX4SFfbtyRGUc",
  authDomain: import.meta.env["VITE_FIREBASE_AUTH_DOMAIN"] || "nri360.firebaseapp.com",
  databaseURL: import.meta.env["VITE_FIREBASE_DATABASE_URL"] || "https://nri360-default-rtdb.firebaseio.com/",
  projectId: import.meta.env["VITE_FIREBASE_PROJECT_ID"] || "nri360",
  storageBucket: import.meta.env["VITE_FIREBASE_STORAGE_BUCKET"] || "nri360.firebasestorage.app",
  messagingSenderId: import.meta.env["VITE_FIREBASE_MESSAGING_SENDER_ID"] || "468421327848",
  appId: import.meta.env["VITE_FIREBASE_APP_ID"] || "1:468421327848:web:7cbe767760e6788170025d"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const rtdb = getDatabase(app);
