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
    const recoverModal = document.getElementById("recover-modal");
    const registerModal = document.getElementById("register-modal");
    const closeButtons = document.querySelectorAll(".close-btn");

    document.getElementById("open-register")?.addEventListener("click", () => {
        loginModal.style.display = "none";
        registerModal.style.display = "flex";
        recoverModal.style.display = "none";
    });

    document.getElementById("open-login")?.addEventListener("click", () => {
        registerModal.style.display = "none";
        loginModal.style.display = "flex";
        recoverModal.style.display = "none";
    });

    document.getElementById("open-recover")?.addEventListener("click", () => {
        registerModal.style.display = "none";
        loginModal.style.display = "none";
        recoverModal.style.display = "flex";
    });

    closeButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            loginModal.style.display = "none";
            registerModal.style.display = "none";
            recoverModal.style.display = "none";
        });
    });

    window.addEventListener("click", (event) => {
        if (event.target === loginModal) loginModal.style.display = "none";
        if (event.target === registerModal) registerModal.style.display = "none";
        if (event.target === recoverModal) recoverModal.style.display = "none";
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
                window.location.href = "index.html";
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
document.addEventListener("click", (event) => {
    if (event.target.id === "recover-btn") {
        recuperarContrasena();
    }
});

// 🔥 Función para recuperar contraseña
async function recuperarContrasena() {
    const email = document.getElementById("recover-email").value.trim();

    // 🔍 Validaciones
    if (!validarCorreo(email)) {
        document.getElementById("recover-message").innerText = "❌ Correo no válido.";
        return;
    }

    try {
        // 🔎 Verificar si el correo existe en la tabla de usuarios
        const { data: usuario, error: queryError } = await supabase
            .from("usuarios")
            .select("id")
            .eq("email", email)
            .maybeSingle();

        if (queryError) {
            throw new Error("No se pudo verificar el correo. Intenta más tarde.");
        }

        if (!usuario) {
            document.getElementById("recover-message").innerText = "❌ Este correo no está registrado.";
            return;
        }

        // ✅ Enviar correo de recuperación si el usuario existe
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `https://parral-map.vercel.app/reset-password.html`
        });

        if (error) {
            throw new Error("No se pudo enviar el enlace de recuperación.");
        }

        document.getElementById("recover-message").innerText =
            "✅ Revisa tu correo para recuperar tu contraseña.";

        setTimeout(() => {
            document.getElementById("recover-modal").style.display = "none";
        }, 2000);

    } catch (err) {
        document.getElementById("recover-message").innerText = "❌ Error: " + err.message;
    }
}

botonConfiguracion.addEventListener("click", async (e) => {
    const loginModal = document.getElementById("login-modal");
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
        e.preventDefault();
        loginModal.style.display = "flex";
    }else {
        window.location.href = "configuracion.html"
    }
});

/*
// 🔥 Tamaño del lote y retardo entre lotes
const TAMANO_LOTE = 50;
const RETARDO_ENTRE_LOTES = 1000; // 1000 ms = 1 segundo

// 🚀 Función para subir el archivo GeoJSON a Supabase en lotes
async function subirGeoJSON() {
    try {
        // 🔥 Obtener los datos de mapa.geojson
        const response = await fetch('mapa.geojson');
        const data = await response.json();

        // 🔥 Filtrar las características (features) de tipo LineString
        const calles = data.features.filter(feature => feature.geometry && feature.geometry.type === 'LineString');

        console.log(`✅ Total de calles a insertar: ${calles.length}`);

        // 🔥 Dividir las calles en lotes
        const lotes = [];
        for (let i = 0; i < calles.length; i += TAMANO_LOTE) {
            lotes.push(calles.slice(i, i + TAMANO_LOTE));
        }

        // 🔥 Función para insertar un lote en Supabase
        const insertarLote = async (lote, indiceLote) => {
            console.log(`🚀 Insertando lote ${indiceLote + 1} de ${lotes.length}`);

            // 🔥 Preparar los datos para la inserción
            const datos = lote.map((feature, index) => {
                const propiedades = feature.properties;

                return {
                    osm_id: propiedades['@id'] || 'Desconocido',
                    access: propiedades['access'] || 'Desconocido',
                    highway: propiedades['highway'] || 'Desconocido',
                    lanes: propiedades['lanes'] || 'Desconocido',
                    maxspeed: propiedades['maxspeed'] || 'Desconocido',
                    name: propiedades['name'] || `Calle_${index}`,
                    oneway: propiedades['oneway'] || 'Desconocido',
                    ref: propiedades['ref'] || 'Desconocido',
                    surface: propiedades['surface'] || 'Desconocido',
                    coordinates: feature.geometry.coordinates,
                    color: '#0000FF', // Color inicial (Azul)
                    state: 'Desconocido'
                };
            });

            // 🔥 Insertar el lote en Supabase
            const { error } = await supabase.from('calles').insert(datos);

            if (error) {
                console.error(`❌ Error al insertar el lote ${indiceLote + 1}:`, error.message);
            } else {
                console.log(`✅ Lote ${indiceLote + 1} insertado correctamente.`);
            }
        };

        // 🔥 Función para procesar los lotes con retardo entre cada uno
        const procesarLotes = async () => {
            for (let i = 0; i < lotes.length; i++) {
                await insertarLote(lotes[i], i);
                console.log(`⏳ Esperando ${RETARDO_ENTRE_LOTES / 1000} segundos antes del siguiente lote...`);
                await new Promise(resolve => setTimeout(resolve, RETARDO_ENTRE_LOTES));
            }
            console.log("✅ Todas las calles han sido insertadas.");
        };

        // 🚀 Ejecutar la inserción por lotes
        await procesarLotes();
    } catch (error) {
        console.error("❌ Error al cargar el archivo GeoJSON:", error);
    }
}

// 🚀 Ejecutar la función
subirGeoJSON();
*/