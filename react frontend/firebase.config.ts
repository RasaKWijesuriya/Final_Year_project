import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCzX71p2uEoLuPoT6jQASX0IPZM28py2tw",
  authDomain: "vbkitsource.firebaseapp.com",
  databaseURL: "https://vbkitsource-default-rtdb.firebaseio.com",
  projectId: "vbkitsource",
  storageBucket: "vbkitsource.appspot.com",
  messagingSenderId: "216636551498",
  appId: "1:216636551498:web:79b837d0911883d35791b3",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database };
