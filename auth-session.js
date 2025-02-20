import { supabase } from "./supabase-config.js";

// ✅ Ejecutar la configuración al cargar la página
document.addEventListener("DOMContentLoaded", async () => {
    await verificarSesion();
    configurarBotonAuth();
    configurarModales();
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

    if (!authBtn) {
        console.warn("⚠️ No se encontró el botón de autenticación.");
        return;
    }

    authBtn.addEventListener("click", async () => {
        const { data } = await supabase.auth.getSession();

        if (data.session && data.session.user) {
            await cerrarSesion();
        } else {
            const loginModal = document.getElementById("login-modal");
            if (loginModal) loginModal.style.display = "flex";
        }
    });
}

// 🔥 Configurar los modales de inicio de sesión y registro
function configurarModales() {
    const loginModal = document.getElementById("login-modal");
    const registerModal = document.getElementById("register-modal");
    const closeButtons = document.querySelectorAll(".close-btn");

    document.getElementById("open-register")?.addEventListener("click", () => {
        loginModal.style.display = "none";
        registerModal.style.display = "flex";
    });

    document.getElementById("open-login")?.addEventListener("click", () => {
        registerModal.style.display = "none";
        loginModal.style.display = "flex";
    });

    closeButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            loginModal.style.display = "none";
            registerModal.style.display = "none";
        });
    });

    window.addEventListener("click", (event) => {
        if (event.target === loginModal) loginModal.style.display = "none";
        if (event.target === registerModal) registerModal.style.display = "none";
    });
}

// 🔥 Función para registrar usuario
document.addEventListener("click", (event) => {
    if (event.target.id === "register-btn") {
        registrarUsuario();
    }
});

async function registrarUsuario() {
    const email = document.getElementById("register-email").value;
    const password = document.getElementById("register-password").value;

    try {
        let { error } = await supabase.auth.signUp({ email, password });

        if (error) {
            throw new Error(error.message);
        }

        document.getElementById("register-status-message").innerText = "✅ Registro exitoso. Verifica tu correo.";
        
        setTimeout(() => {
            document.getElementById("register-modal").style.display = "none";
            document.getElementById("login-modal").style.display = "flex";
        }, 2000);
    } catch (err) {
        document.getElementById("register-status-message").innerText = "❌ Error: " + err.message;
    }
}
