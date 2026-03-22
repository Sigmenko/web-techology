// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Твої ключі доступу (зберігаємо як є)
const firebaseConfig = {
  apiKey: "AIzaSyAq4bkjB8IOI-KwpaGB8NzByvui7SXvSUA",
  authDomain: "food-express-lab4.firebaseapp.com",
  projectId: "food-express-lab4",
  storageBucket: "food-express-lab4.firebasestorage.app",
  messagingSenderId: "636443158110",
  appId: "1:636443158110:web:cdc3b1a6393c339357f6cf",
  measurementId: "G-1TEET0N2J5"
};

// Ініціалізація Firebase
const app = initializeApp(firebaseConfig);

// Ініціалізація Авторизації (Auth) та Бази даних (Firestore)
export const auth = getAuth(app);
export const db = getFirestore(app);