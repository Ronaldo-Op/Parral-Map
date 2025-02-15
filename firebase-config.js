// 🔥 Configuración de Firebase (Reemplaza con tus claves)
const firebaseConfig = {
    apiKey: "AIzaSyAMXfhTglTKRhPjZFSUxV83gjCwgVY4IwE",
    authDomain: "parral-map.firebaseapp.com",
    databaseURL: "https://parral-map-default-rtdb.firebaseio.com",
    projectId: "parral-map",
    storageBucket: "parral-map.firebasestorage.app",
    messagingSenderId: "584081558698",
    appId: "1:584081558698:web:ef579152ec0b3da58954d3"
};

// Asegurar que Firebase está disponible antes de inicializar
if (typeof firebase !== "undefined" && firebase.initializeApp) {
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();
    console.log("🔥 Firebase inicializado correctamente");
} else {
    console.error("❌ Error: Firebase no está disponible. Revisa la carga de scripts en HTML.");
}
