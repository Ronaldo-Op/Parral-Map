import { supabase } from "./supabase-config.js";

// Alternar entre Login y Registro
document.getElementById("toggle-register").addEventListener("click", function () {
    document.getElementById("login-section").style.display = "none";
    document.getElementById("register-section").style.display = "block";
});

document.getElementById("toggle-login").addEventListener("click", function () {
    document.getElementById("register-section").style.display = "none";
    document.getElementById("login-section").style.display = "block";
});

// Validación de correo electrónico
function validarCorreo(email) {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
}

// Validación de contraseña segura
function validarPassword(password) {
    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
}

let intentosFallidos = 0; // Para bloquear múltiples intentos fallidos

// Función para registrar usuario con validaciones
document.getElementById("register-btn").addEventListener("click", async () => {
    const email = document.getElementById("register-email").value;
    const password = document.getElementById("register-password").value;

    if (!validarCorreo(email)) {
        document.getElementById("status-message").innerText = "❌ Correo no válido.";
        return;
    }

    if (!validarPassword(password)) {
        document.getElementById("status-message").innerText = "❌ La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un símbolo.";
        return;
    }

    let { error } = await supabase.auth.signUp({ email, password });

    if (error) {
        document.getElementById("status-message").innerText = "❌ Error al registrarse: " + error.message;
    } else {
        document.getElementById("status-message").innerText = "✅ Registro exitoso. Verifica tu correo.";
    }
});

// Función para iniciar sesión con bloqueo de intentos fallidos
document.getElementById("login-btn").addEventListener("click", async () => {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    if (intentosFallidos >= 5) {
        document.getElementById("status-message").innerText = "❌ Demasiados intentos fallidos. Intenta más tarde.";
        return;
    }

    let { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        intentosFallidos++;
        document.getElementById("status-message").innerText = `❌ Usuario o contraseña incorrectos. Intento ${intentosFallidos}/5`;
    } else {
        intentosFallidos = 0; // Reiniciar intentos si inicia sesión correctamente
        document.getElementById("status-message").innerText = "✅ Inicio de sesión exitoso. Redirigiendo...";
        setTimeout(() => {
            window.location.href = "mapa.html";
        }, 2000);
    }
});

// Mantener sesión iniciada
async function verificarSesion() {
    const { data } = await supabase.auth.getSession();
    if (data.session) {
        window.location.href = "mapa.html";
    }
}

verificarSesion();

// Recuperar contraseña
document.getElementById("forgot-password").addEventListener("click", async () => {
    const email = prompt("Ingresa tu correo para recuperar la contraseña:");

    if (!validarCorreo(email)) {
        alert("❌ Correo no válido.");
        return;
    }

    let { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
        alert("❌ Error al enviar el correo de recuperación: " + error.message);
    } else {
        alert("✅ Correo de recuperación enviado.");
    }
});
