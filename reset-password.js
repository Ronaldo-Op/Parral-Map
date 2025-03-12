import { supabase } from "./supabase-config.js";

        // 🔥 Función para obtener el token de autenticación de la URL
        function obtenerToken() {
            const hash = window.location.hash.substring(1); // elimina el "#"
            const params = new URLSearchParams(hash);
            return params.get("access_token");
        }
        

        // 🔥 Función para autenticar con el token de acceso
        async function autenticarConToken() {
            const token = obtenerToken();
            if (!token) {
                document.getElementById("reset-status-message").innerHTML = "❌ Error: Token de autenticación no encontrado en la URL.";
                return false;
            }

            // 🔥 Configurar sesión con el token de acceso
            const { data, error } = await supabase.auth.setSession({
                access_token: token,
                refresh_token: ''
            });

            if (error) {
                console.error("❌ Error en setSession:", error.message);
                document.getElementById("reset-status-message").innerHTML = "❌ Error: " + error.message;
                return false;
            }

            console.log("✅ Sesión autenticada con éxito.");
            return true;
        }

        // 🔥 Función para restablecer la contraseña
        async function restablecerContrasena() {
            const newPassword = document.getElementById("new-password").value;

            // 🔥 Verificar que la sesión esté autenticada
            const sesionActiva = await autenticarConToken();
            if (!sesionActiva) {
                return;
            }

            // 🔥 Actualizar la contraseña
            try {
                let { error } = await supabase.auth.updateUser({ password: newPassword });

                if (error) {
                    throw new Error(error.message);
                } else {
                    document.getElementById("reset-status-message").innerHTML = "✅ Contraseña restablecida con éxito.";
                    setTimeout(() => {
                        window.location.href = "index.html";
                    }, 3000);
                }
            } catch (err) {
                document.getElementById("reset-status-message").innerHTML = "❌ Error: " + err.message;
            }
        }

        // 🔥 Event Listener para el botón de restablecer contraseña
        document.getElementById("reset-password-btn").addEventListener("click", restablecerContrasena);

        // 🔥 Autenticar automáticamente al cargar la página
        document.addEventListener("DOMContentLoaded", autenticarConToken);