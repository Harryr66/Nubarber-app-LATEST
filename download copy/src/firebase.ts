import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore, enableIndexedDbPersistence } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBTs2aeN2eCaMlf_KloYyLmkntjyG-gsiM",
  authDomain: "nubarber-final.firebaseapp.com",
  projectId: "nubarber-final",
  storageBucket: "nubarber-final.firebasestorage.app",
  messagingSenderId: "940772021554",
  appId: "1:940772021554:web:3c838dcf252aa16700732b",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const db = initializeFirestore(app, {
  experimentalForceLongPolling: true  // Force long polling to fix transport errors
});

// Enable offline persistence (basic, without multi-tab for now to avoid TS error)
enableIndexedDbPersistence(db)
  .catch((error) => {
    console.error("Persistence failed: ", error);
  });

export { app, auth, db };