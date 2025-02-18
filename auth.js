import { supabase } from "./supabase-config.js";

// 🔥 Alternar entre Login y Registro
document.getElementById("toggle-register").addEventListener("click", function () {
    document.getElementById("login-section").style.display = "none";
    document.getElementById("register-section").style.display = "block";
});

document.getElementById("toggle-login").addEventListener("click", function () {
    document.getElementById("register-section").style.display = "none";
    document.getElementById("login-section").style.display = "block";
});

// 🔥 Función para Registrar Usuarios
document.getElementById("register-btn").addEventListener("click", async () => {
    const email = document.getElementById("register-email").value;
    const password = document.getElementById("register-password").value;

    let { user, error } = await supabase.auth.signUp({ email, password });

    if (error) {
        document.getElementById("status-message").innerText = "❌ Error al registrarse: " + error.message;
    } else {
        document.getElementById("status-message").innerText = "✅ Registro exitoso. Verifica tu correo.";
    }
});

// 🔥 Función para Iniciar Sesión
document.getElementById("login-btn").addEventListener("click", async () => {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    let { user, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        document.getElementById("status-message").innerText = "❌ Error al iniciar sesión: " + error.message;
    } else {
        document.getElementById("status-message").innerText = "✅ Inicio de sesión exitoso. Redirigiendo...";
        setTimeout(() => {
            window.location.href = "mapa.html"; // Redirige al mapa después del login
        }, 2000);
    }
});
