import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBTs2aeN2eCaMlf_KloYyLmkntjyG-gsiM",
  authDomain: "nubarber-final.firebaseapp.com",
  projectId: "nubarber-final",
  storageBucket: "nubarber-final.firebasestorage.app",
  messagingSenderId: "940772021554",
  appId: "1:940772021554:web:3c838dcf252aa16700732b"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);