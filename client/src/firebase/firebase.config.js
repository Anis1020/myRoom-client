// import { initializeApp } from 'firebase/app'

// const firebaseConfig = {
//   apiKey: import.meta.env.VITE_apiKey,
//   authDomain: import.meta.env.VITE_authDomain,
//   projectId: import.meta.env.VITE_projectId,
//   storageBucket: import.meta.env.VITE_storageBucket,
//   messagingSenderId: import.meta.env.VITE_messagingSenderId,
//   appId: import.meta.env.VITE_appId,
// }

// export const app = initializeApp(firebaseConfig)

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBba1koiCWucxaSdPuF6GT57Hf5-plq-0E",
  authDomain: "room-rent-bcb20.firebaseapp.com",
  projectId: "room-rent-bcb20",
  storageBucket: "room-rent-bcb20.firebasestorage.app",
  messagingSenderId: "885967913034",
  appId: "1:885967913034:web:5dd31908b1fbd3ba1826b3",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
