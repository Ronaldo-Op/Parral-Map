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
    if (event.target.id === "forgot-password") {
        recuperarContrasena();
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
            // 🔥 Si está autenticado, cerrar sesión
            await cerrarSesion();
        } else {
            // 🔥 Si no está autenticado, abrir el modal de inicio de sesión
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

// ✅ Función para validar formato de correo
function validarCorreo(email) {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
}

// ✅ Función para validar complejidad de contraseña
function validarPassword(password) {
    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
}

// 🔥 Función para registrar usuario (solo correo y contraseña)
document.addEventListener("click", (event) => {
    if (event.target.id === "register-btn") {
        registrarUsuario();
    }
});

async function registrarUsuario() {
    const email = document.getElementById("register-email").value;
    const password = document.getElementById("register-password").value;

    // 🔍 Validaciones
    if (!validarCorreo(email)) {
        document.getElementById("register-status-message").innerText = "❌ Correo no válido.";
        return;
    }

    if (!validarPassword(password)) {
        document.getElementById("register-status-message").innerText = 
        "❌ La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un símbolo.";
        return;
    }

    try {
        // 🔥 Registrar usuario en Supabase
        let { error } = await supabase.auth.signUp({ email, password });

        if (error) {
            throw new Error(error.message);
        }

        document.getElementById("register-status-message").innerText = 
        "✅ Registro exitoso. Verifica tu correo.";

        setTimeout(() => {
            document.getElementById("register-modal").style.display = "none";
            document.getElementById("login-modal").style.display = "flex";
        }, 2000);
    } catch (err) {
        document.getElementById("register-status-message").innerText = 
        "❌ Error: " + err.message;
    }
}

// 🔥 Función para iniciar sesión
document.addEventListener("click", (event) => {
    if (event.target.id === "login-btn") {
        iniciarSesion();
    }
});

async function iniciarSesion() {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    // 🔍 Validaciones
    if (!validarCorreo(email)) {
        document.getElementById("status-message").innerText = "❌ Correo no válido.";
        return;
    }

    if (!password) {
        document.getElementById("status-message").innerText = "❌ La contraseña no puede estar vacía.";
        return;
    }

    try {
        // 🔥 Iniciar sesión en Supabase
        let { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            if (error.message.includes("Invalid login credentials")) {
                document.getElementById("status-message").innerText = "❌ Usuario o contraseña incorrectos.";
            } else {
                throw new Error(error.message);
            }
        } else {
            document.getElementById("status-message").innerText = "✅ Inicio de sesión exitoso. Redirigiendo...";
            
            setTimeout(() => {
                window.location.href = "mapa.html";
            }, 2000);
        }
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

        // ✅ Redirigir al usuario a la página de inicio
        window.location.href = "index.html";
    } catch (err) {
        console.error("❌ Error al cerrar sesión:", err.message);
        alert("❌ Error al cerrar sesión: " + err.message);
    }
}

// 🔥 Función para recuperar contraseña
async function recuperarContrasena() {
    const email = prompt("Ingresa tu correo para recuperar la contraseña:");

    if (!validarCorreo(email)) {
        alert("❌ Correo no válido.");
        return;
    }

    try {
        // 🔥 Solicitud de recuperación de contraseña en Supabase
        let { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password.html`
        });

        if (error) {
            throw new Error(error.message);
        } else {
            alert("✅ Correo de recuperación enviado. Revisa tu bandeja de entrada.");
        }
    } catch (err) {
        console.error("❌ Error al enviar el correo de recuperación:", err.message);
        alert("❌ Error al enviar el correo de recuperación: " + err.message);
    }
}

// 🚀 Función para subir el archivo GeoJSON a Supabase
async function subirGeoJSON() {
    try {
        // 🔥 Obtener los datos de mapa.geojson
        const response = await fetch('mapa.geojson');
        const data = await response.json();

        // 🔥 Recorrer las características (features) del GeoJSON
        data.features.forEach(async (feature) => {
            if (feature.geometry.type === 'LineString') {
                const propiedades = feature.properties;

                // 🔥 Obtener las propiedades
                const osm_id = propiedades['@id'] || 'Desconocido';
                const access = propiedades['access'] || 'Desconocido';
                const highway = propiedades['highway'] || 'Desconocido';
                const lanes = propiedades['lanes'] || 'Desconocido';
                const maxspeed = propiedades['maxspeed'] || 'Desconocido';
                const name = propiedades['name'] || 'Sin Nombre';
                const oneway = propiedades['oneway'] || 'Desconocido';
                const ref = propiedades['ref'] || 'Desconocido';
                const surface = propiedades['surface'] || 'Desconocido';
                const coordenadas = feature.geometry.coordinates;

                // 🔥 Insertar los datos en Supabase
                const { error } = await supabase.from('calles').insert([
                    {
                        osm_id: osm_id,
                        access: access,
                        highway: highway,
                        lanes: lanes,
                        maxspeed: maxspeed,
                        name: name,
                        oneway: oneway,
                        ref: ref,
                        surface: surface,
                        coordenadas: coordenadas,
                        color: '#0000FF', // Color inicial (Azul)
                        estado: 'Desconocido'
                    }
                ]);

                if (error) {
                    console.error("❌ Error al insertar:", error.message);
                } else {
                    console.log(`✅ Calle "${name}" insertada correctamente.`);
                }
            }
        });
    } catch (error) {
        console.error("❌ Error al cargar el archivo GeoJSON:", error);
    }
}

// 🚀 Ejecutar la función
subirGeoJSON();