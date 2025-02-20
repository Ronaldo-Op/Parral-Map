import { supabase } from "./supabase-config.js";

async function verificarSesion() {
    const { data, error } = await supabase.auth.getSession();
    const authBtn = document.getElementById("auth-btn");
    const modal = document.getElementById("login-modal");
    const closeModal = document.querySelector(".close-btn");

    if (error) {
        console.error("❌ Error al verificar sesión:", error);
        return;
    }

    if (data.session && data.session.user) {
        authBtn.innerText = "Cerrar Sesión";
        authBtn.addEventListener("click", async () => {
            await supabase.auth.signOut();
            window.location.reload(); // Recargar la página al cerrar sesión
        });
    } else {
        authBtn.innerText = "Iniciar Sesión";
        authBtn.addEventListener("click", () => {
            modal.style.display = "flex"; // Mostrar modal
        });
    }

    // Cerrar el modal al hacer clic en la "X"
    closeModal.addEventListener("click", () => {
        modal.style.display = "none";
    });

    // Cerrar el modal al hacer clic fuera del contenido
    window.addEventListener("click", (event) => {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });
}
/*
// 🔥 Cargar la barra de navegación
async function cargarNavbar() {
    const navbarContainer = document.createElement("div");
    const response = await fetch("/navbar.html");
    navbarContainer.innerHTML = await response.text();
    document.body.prepend(navbarContainer);
    verificarSesion();
}
*/
async function cargarNavbar() {
    try {
        const navbarContainer = document.createElement("div");
        const response = await fetch("navbar.html");
        navbarContainer.innerHTML = await response.text();
        document.body.prepend(navbarContainer);
        console.log("✅ Navbar cargada correctamente.");

        // ⚡ Ejecutar configuración de modales después de cargar la navbar
        configurarModales();
    } catch (error) {
        console.error("❌ Error al cargar la navbar:", error);
    }
}

// Ejecutar la carga de la barra al abrir cualquier página
document.addEventListener("DOMContentLoaded", cargarNavbar);
