import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";


const firebaseConfig = {
  apiKey: `${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`,
  authDomain: "whatsapp-clone-34f8a.firebaseapp.com",
  projectId: "whatsapp-clone-34f8a",
  storageBucket: "whatsapp-clone-34f8a.appspot.com",
  messagingSenderId: "368686253809",
  appId: "1:368686253809:web:c79b3e0632242d312e8b50",
  measurementId: "G-WL4K1C2CXS",
};

// const firebaseConfig = {
//   apiKey: `${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`,
//   authDomain: "whats-app-clone-1-0.firebaseapp.com",
//   projectId: "whats-app-clone-1-0",
//   storageBucket: "whats-app-clone-1-0.appspot.com",
//   messagingSenderId: "10554949333",
//   appId: "1:10554949333:web:5327f429c78fe1fd056c5c",
// };

const app = initializeApp(firebaseConfig);

export const firebaseAuth = getAuth(app);
