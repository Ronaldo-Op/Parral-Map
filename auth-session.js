import { supabase } from "./supabase-config.js";

// ✅ Ejecutar verificación y configuración al cargar la página
document.addEventListener("DOMContentLoaded", async () => {
    await verificarSesion();
    configurarBotonAuth();
    //configurarModales();
});

/*
// Alternar entre Login y Registro
document.getElementById("toggle-register").addEventListener("click", function () {
    document.getElementById("login-section").style.display = "none";
    document.getElementById("register-section").style.display = "block";
});

document.getElementById("toggle-login").addEventListener("click", function () {
    document.getElementById("register-section").style.display = "none";
    document.getElementById("login-section").style.display = "block";
});
*/

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

// 🔥 Exportar `configurarModales()` para usarlo en `navbar.js`
export function configurarModales() {
    const loginModal = document.querySelector("#login-modal");
    const registerModal = document.querySelector("#register-modal");
    const closeButtons = document.querySelectorAll(".close-btn");

    document.querySelector("#open-register")?.addEventListener("click", () => {
        loginModal.style.display = "none";
        registerModal.style.display = "flex";
    });

    document.querySelector("#open-login")?.addEventListener("click", () => {
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


// 🔥 Configurar el botón de inicio/cierre de sesión
function configurarBotonAuth() {
    const authBtn = document.getElementById("auth-btn");
    const loginModal = document.getElementById("login-modal");
    const closeModal = document.querySelector("close-btn");

    if (!authBtn || !modal || !closeModal) {
        console.warn("⚠️ No se encontraron elementos para el modal.");
        return;
    }

    authBtn.addEventListener("click", async () => {
        const { data } = await supabase.auth.getSession();

        if (data.session && data.session.user) {
            await cerrarSesion();
        } else {
            loginModal.style.display = "flex"; // Mostrar el modal
        }
    });

    closeModal.addEventListener("click", () => {
        loginModal.style.display = "none"; // Cerrar el modal al hacer clic en la 'X'
    });

    window.addEventListener("click", (event) => {
        if (event.target === modal) {
            loginModal.style.display = "none"; // Cerrar si se hace clic fuera del modal
        }
    });
}
/*
// Función para registrar usuario con validaciones
async function registrarse() {
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
};
*/
// 🔥 Función para iniciar sesión desde el modal
document.addEventListener("click", (event) => {
    if (event.target.id === "login-btn") {
        iniciarSesion();
    }
});
/*
document.addEventListener("click", (event) => {
    if (event.target.id === "register-btn") {
        registrarse();
    }
});
*/
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
/*
// 🔥 Función para registrar usuario
document.getElementById("register-btn")?.addEventListener("click", async () => {
    const email = document.getElementById("register-email")?.value;
    const password = document.getElementById("register-password")?.value;

    try {
        let { error } = await supabase.auth.signUp({ email, password });

        if (error) {
            throw new Error(error.message);
        }

        document.getElementById("register-status-message")?.innerText = "✅ Registro exitoso. Verifica tu correo.";
        
        setTimeout(() => {
            document.getElementById("register-modal").style.display = "none";
            document.getElementById("login-modal").style.display = "flex"; // Abrir el modal de inicio de sesión
        }, 2000);
    } catch (err) {
        document.getElementById("register-status-message")?.innerText = "❌ Error: " + err.message;
    }
});
*/
// 🔥 Función para registrar usuario
document.addEventListener("click", (event) => {
    if (event.target.id === "register-btn") {
        registrarUsuario();
    }
});

async function registrarUsuario() {
    const email = document.querySelector("#register-email")?.value;
    const password = document.querySelector("#register-password")?.value;

    try {
        let { error } = await supabase.auth.signUp({ email, password });

        if (error) {
            throw new Error(error.message);
        }

        document.querySelector("#register-status-message")?.innerText = "✅ Registro exitoso. Verifica tu correo.";
        
        setTimeout(() => {
            document.querySelector("#register-modal").style.display = "none";
            document.querySelector("#login-modal").style.display = "flex";
        }, 2000);
    } catch (err) {
        document.querySelector("#register-status-message")?.innerText = "❌ Error: " + err.message;
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
