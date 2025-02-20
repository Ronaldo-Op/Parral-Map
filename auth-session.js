import { supabase } from "./supabase-config.js";

// ✅ Ejecutar verificación y configuración al cargar la página
document.addEventListener("DOMContentLoaded", async () => {
    await verificarSesion();
    configurarBotonAuth();
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

async function iniciarSesion() {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    try {
        let { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            throw new Error(error.message);
        }

        document.getElementById("status-message").innerText = "✅ Inicio de sesión exitoso.";
        
        setTimeout(() => {
            window.location.reload(); // Recargar para reflejar cambios
        }, 2000);
    } catch (err) {
        document.getElementById("status-message").innerText = "❌ Error: " + err.message;
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
