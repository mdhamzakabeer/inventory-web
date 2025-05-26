// Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-analytics.js";
  import { getAuth , createUserWithEmailAndPassword,signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
  import { getFirestore ,doc, setDoc } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";
  const firebaseConfig = {
    apiKey: "AIzaSyBYzPHt01P12G7BdJtcCbmustr0dp7KI5E",
    authDomain: "inventory-web-90957.firebaseapp.com",
    projectId: "inventory-web-90957",
    storageBucket: "inventory-web-90957.firebasestorage.app",
    messagingSenderId: "1085507341120",
    appId: "1:1085507341120:web:9db12198ebab96bc05c8a5",
    measurementId: "G-LG56HZKVM2"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export{
    auth ,createUserWithEmailAndPassword,signInWithEmailAndPassword,db,doc, setDoc
}
