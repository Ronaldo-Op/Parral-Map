// 🔥 Cargar la navbar dinámicamente
async function cargarNavbar() {
    try {
        const navbarContainer = document.createElement("div");
        const response = await fetch("navbar.html");
        navbarContainer.innerHTML = await response.text();
        document.body.prepend(navbarContainer);
        console.log("✅ Navbar cargada correctamente.");
    } catch (error) {
        console.error("❌ Error al cargar la navbar:", error);
    }
}

// ✅ Ejecutar la carga de la navbar al abrir cualquier página
document.addEventListener("DOMContentLoaded", cargarNavbar);
