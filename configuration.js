import { initializeApp } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-app.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAOOzT8-lKp-i9pg5TL7NFVELY8RAPxPPo",
  authDomain: "money-manger-71b2e.firebaseapp.com",
  projectId: "money-manger-71b2e",
  storageBucket: "money-manger-71b2e.appspot.com",
  messagingSenderId: "650362749200",
  appId: "1:650362749200:web:519df3e577a12fe7e0e595"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
import { getDatabase, get, ref, push, set, child, update, remove, onValue, onChildAdded } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-database.js";
import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, getRedirectResult, signInWithRedirect } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-auth.js";

export { onValue, getDatabase, get, ref, push, set, child, update, remove, getAuth, signInWithEmailAndPassword, onChildAdded, signInWithPopup, GoogleAuthProvider, getRedirectResult, signInWithRedirect }