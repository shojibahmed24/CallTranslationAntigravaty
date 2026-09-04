import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAaB0O1Dw3TNfgVx2DtJ0HZxypHM2SIXO4",
  authDomain: "unicom-d325b.firebaseapp.com",
  projectId: "unicom-d325b",
  storageBucket: "unicom-d325b.firebasestorage.app",
  messagingSenderId: "872547522493",
  appId: "1:872547522493:web:861a0a0ab282e359f1a4d4",
  measurementId: "G-W36GZTL4B2"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
