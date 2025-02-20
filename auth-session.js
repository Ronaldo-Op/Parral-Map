import { supabase } from "./supabase-config.js";

// ✅ Esperar hasta que la navbar esté completamente cargada
document.addEventListener("navbarCargada", async () => {
    console.log("✅ Navbar detectada. Iniciando configuración de autenticación...");
    await verificarSesion();
    configurarBotonAuth();
    configurarModales();
});

// 🔥 Función para registrar usuario con parámetros adicionales
document.addEventListener("click", (event) => {
    if (event.target.id === "register-btn") {
        registrarUsuario();
    }
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

        if (authBtn) {
            if (data.session && data.session.user) {
                console.log("✅ Usuario autenticado:", data.session.user.email);
                authBtn.innerText = "Cerrar Sesión";
            } else {
                authBtn.innerText = "Iniciar Sesión";
            }
        } else {
            console.warn("⚠️ No se encontró el botón de autenticación.");
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
    const username = document.getElementById("register-username").value;
    const firstName = document.getElementById("register-firstname").value;
    const lastName = document.getElementById("register-lastname").value;

    // 🔍 Validaciones adicionales
    if (!username || !firstName || !lastName) {
        document.getElementById("register-status-message").innerText = "❌ Todos los campos son obligatorios.";
        return;
    }

    try {
        // 🔥 Verificar si el nombre de usuario ya está en uso
        let { data: existingUser, error: userError } = await supabase
            .from("usuarios")
            .select("username")
            .eq("username", username)
            .single();

        if (existingUser) {
            document.getElementById("register-status-message").innerText = "❌ El nombre de usuario ya está en uso.";
            return;
        }

        // 🔥 Registrar usuario en Supabase
        let { error } = await supabase.auth.signUp({ email, password });

        if (error) {
            throw new Error(error.message);
        }

        // 🔥 Guardar información adicional en la tabla 'usuarios'
        let { error: insertError } = await supabase
            .from("usuarios")
            .insert([
                {
                    username,
                    first_name: firstName,
                    last_name: lastName,
                    email
                }
            ]);

        if (insertError) {
            throw new Error(insertError.message);
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

/*
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
    */
