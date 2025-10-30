// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDblwGDYJLLD-YwVgc4kqnu1INue1CB7Z0",
  authDomain: "geocercas-f89b1.firebaseapp.com",
  databaseURL: "https://geocercas-f89b1-default-rtdb.firebaseio.com",
  projectId: "geocercas-f89b1",
  storageBucket: "geocercas-f89b1.firebasestorage.app",
  messagingSenderId: "755143515931",
  appId: "1:755143515931:web:ffc379722c5ecb15c7bdbe",
  measurementId: "G-ZSFREL48CJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Obtiene la referencia de la base de datos
export const db = getDatabase(app);