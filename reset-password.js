import { supabase } from "./supabase-config.js";

    // 🔥 Verificar si ya hay sesión activa
    async function verificarSesion() {
        const { data, error } = await supabase.auth.getSession();

        if (!data?.session) {
            document.getElementById("reset-status-message").innerHTML =
                "❌ Error: No se encontró una sesión activa. Intenta volver a hacer clic en el enlace de recuperación.";
            return false;
        }

        console.log("✅ Sesión activa detectada.");
        return true;
    }


    // 🔥 Función para restablecer la contraseña
    async function restablecerContrasena() {
        const newPassword = document.getElementById("new-password").value;

        const sesionActiva = await verificarSesion();
        if (!sesionActiva) return;

        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword });

            if (error) throw new Error(error.message);

            document.getElementById("reset-status-message").innerHTML =
                "✅ Contraseña restablecida con éxito. Redirigiendo...";
            setTimeout(() => {
                window.location.href = "index.html";
            }, 3000);
        } catch (err) {
            document.getElementById("reset-status-message").innerHTML =
                "❌ Error: " + err.message;
        }
    }

    // 🔥 Event Listener para el botón de restablecer contraseña
    document.getElementById("reset-password-btn").addEventListener("click", restablecerContrasena);

    // 🔥 Autenticar automáticamente al cargar la página
    document.addEventListener("DOMContentLoaded", autenticarConToken);