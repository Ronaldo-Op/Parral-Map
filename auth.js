import { supabase } from "./supabase-config.js";

document.addEventListener("DOMContentLoaded", async () => {
    await verificarSesion();
    configurarBotonAuth();
});

// ✅ Función para verificar sesión
async function verificarSesion() {
    try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
            console.error("❌ Error al verificar sesión:", error);
            return;
        }

        const logoutBtn = document.getElementById("logout-btn");

        if (data.session && data.session.user) {
            console.log("✅ Usuario autenticado:", data.session.user.email);
            if (logoutBtn) logoutBtn.style.display = "block";
        } else {
            if (logoutBtn) logoutBtn.style.display = "none";
        }
    } catch (err) {
        console.error("⚠️ Error en verificarSesion():", err);
    }
}

// ✅ Función para configurar el botón de inicio/cierre de sesión
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

// ✅ Función para iniciar sesión desde el modal
document.getElementById("login-btn")?.addEventListener("click", async () => {
    const email = document.getElementById("login-email")?.value;
    const password = document.getElementById("login-password")?.value;

    try {
        let { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            throw new Error(error.message);
        }

        document.getElementById("status-message")?.innerText = "✅ Inicio de sesión exitoso.";
        
        setTimeout(() => {
            window.location.reload(); // Recargar para reflejar cambios
        }, 2000);
    } catch (err) {
        document.getElementById("status-message")?.innerText = "❌ Error: " + err.message;
    }
});

// ✅ Función para cerrar sesión
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

// ✅ Recuperar contraseña
document.getElementById("forgot-password")?.addEventListener("click", async () => {
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

// ✅ Validación de correo electrónico
function validarCorreo(email) {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
}
