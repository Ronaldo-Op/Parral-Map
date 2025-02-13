const firebaseConfig = {
    apiKey: "AIzaSyAMXfhTglTKRhPjZFSUxV83gjCwgVY4IwE",
    authDomain: "parral-map.firebaseapp.com",
    projectId: "parral-map",
    storageBucket: "parral-map.firebasestorage.app",
    messagingSenderId: "584081558698",
    appId: "1:584081558698:web:ef579152ec0b3da58954d3"
  };

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();