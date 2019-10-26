import firebase from 'firebase';
import 'firebase/firestore';
const firebaseConfig = {
    apiKey: "AIzaSyDDpn3IEQnwA9NXZZtRS6LKI5ZWEqUYH8c",
    authDomain: "lunch-buddy-cd04c.firebaseapp.com",
    databaseURL: "https://lunch-buddy-cd04c.firebaseio.com",
    projectId: "lunch-buddy-cd04c",
    storageBucket: "lunch-buddy-cd04c.appspot.com",
    messagingSenderId: "643655819377",
    appId: "1:643655819377:web:6674ec918a35f837533bd0",
    measurementId: "G-XH277RLGZZ"
  };
let app = firebase.initializeApp(firebaseConfig);
export const db = app.database();
export const firebaseapp = app;
// export const firestore = Firebase.firestore();
