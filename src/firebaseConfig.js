// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyADN6eOKWVhTErDWnKqN4LzTHzAswppC_Y",
    authDomain: "subletx.firebaseapp.com",
    projectId: "subletx",
    storageBucket: "subletx.firebasestorage.app",
    messagingSenderId: "375964024122",
    appId: "1:375964024122:web:5f20dae374d1d203612403",
    measurementId: "G-FW6WCE230C"
  };

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
