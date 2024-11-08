// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCE9NjabPOxvOeILmsOcnZWCearFn1OmyE",
  authDomain: "arduino-flood-alert.firebaseapp.com",
  databaseURL: "https://arduino-flood-alert-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "arduino-flood-alert",
  storageBucket: "arduino-flood-alert.firebasestorage.app",
  messagingSenderId: "685102739357",
  appId: "1:685102739357:web:96ad0a9aa8ff67e65dc974"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
const database = getDatabase(app);


export { database }