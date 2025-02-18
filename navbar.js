import { supabase } from "./supabase-config.js";

async function verificarSesion() {
    const { data, error } = await supabase.auth.getSession();
    const authBtn = document.getElementById("auth-btn");

    if (error) {
        console.error("❌ Error al verificar sesión:", error);
        return;
    }

    if (data.session && data.session.user) {
        authBtn.innerText = "Cerrar Sesión";
        authBtn.addEventListener("click", async () => {
            await supabase.auth.signOut();
            window.location.href = "/auth/login.html"; // Redirigir al login después de cerrar sesión
        });
    } else {
        authBtn.innerText = "Iniciar Sesión";
        authBtn.addEventListener("click", () => {
            window.location.href = "/auth/login.html"; // Redirigir al login
        });
    }
}

// 🔥 Función para incluir la barra en cualquier página
async function cargarNavbar() {
    const navbarContainer = document.createElement("div");
    const response = await fetch("/navbar.html");
    navbarContainer.innerHTML = await response.text();
    document.body.prepend(navbarContainer);
    verificarSesion();
}

// Ejecutar la carga de la barra al abrir cualquier página
document.addEventListener("DOMContentLoaded", cargarNavbar);
