import { supabase } from "./supabase-config.js";

// ✅ Ejecutar verificación y configuración al cargar la página
document.addEventListener("DOMContentLoaded", async () => {
    await verificarSesion();
    configurarBotonAuth();
});

// Alternar entre Login y Registro
document.getElementById("toggle-register").addEventListener("click", function () {
    document.getElementById("login-section").style.display = "none";
    document.getElementById("register-section").style.display = "block";
});

document.getElementById("toggle-login").addEventListener("click", function () {
    document.getElementById("register-section").style.display = "none";
    document.getElementById("login-section").style.display = "block";
});

// 🔥 Función para verificar sesión
async function verificarSesion() {
    try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
            console.error("❌ Error al verificar sesión:", error);
            return;
        }

        const authBtn = document.getElementById("auth-btn");

        if (data.session && data.session.user) {
            console.log("✅ Usuario autenticado:", data.session.user.email);
            authBtn.innerText = "Cerrar Sesión";
        } else {
            authBtn.innerText = "Iniciar Sesión";
        }
    } catch (err) {
        console.error("⚠️ Error en verificarSesion():", err);
    }
}

// 🔥 Configurar el botón de inicio/cierre de sesión
function configurarBotonAuth() {
    const authBtn = document.getElementById("auth-btn");
    const modal = document.getElementById("login-modal");
    const closeModal = document.querySelector(".close-btn");

    if (!authBtn || !modal || !closeModal) {
        console.warn("⚠️ No se encontraron elementos para el modal.");
        return;
    }

    authBtn.addEventListener("click", async () => {
        const { data } = await supabase.auth.getSession();

        if (data.session && data.session.user) {
            await cerrarSesion();
        } else {
            modal.style.display = "flex"; // Mostrar el modal
        }
    });

    closeModal.addEventListener("click", () => {
        modal.style.display = "none"; // Cerrar el modal al hacer clic en la 'X'
    });

    window.addEventListener("click", (event) => {
        if (event.target === modal) {
            modal.style.display = "none"; // Cerrar si se hace clic fuera del modal
        }
    });
}

// 🔥 Función para iniciar sesión desde el modal
document.addEventListener("click", (event) => {
    if (event.target.id === "login-btn") {
        iniciarSesion();
    }
});
let intentosFallidos = 0; // Para bloquear múltiples intentos fallidos

async function iniciarSesion() {
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
}

// 🔥 Función para cerrar sesión
async function cerrarSesion() {
    try {
        let { error } = await supabase.auth.signOut();

        if (error) {
            throw new Error(error.message);
        }

        console.log("✅ Sesión cerrada correctamente.");
        window.location.reload();
    } catch (err) {
        alert("❌ Error al cerrar sesión: " + err.message);
    }
}
