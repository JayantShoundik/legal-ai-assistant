// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // YEH IMPORT MISSING THA
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBaDdMLecH-33_u8MlTJ_tY2-7IUtl_4sE",
  authDomain: "legalai-app.firebaseapp.com",
  projectId: "legalai-app",
  storageBucket: "legalai-app.firebasestorage.app",
  messagingSenderId: "1075057896280",
  appId: "1:1075057896280:web:962233670b96ef2d06d32d",
  measurementId: "G-2JJQB5TWQ8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// YEH EXPORT HUMARE APP.JSX KO CHAHIYE THA
export const auth = getAuth(app);