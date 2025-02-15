// Verifica si el usuario es admin antes de cargar la página
window.onload = function () {
    let usuarioActual = localStorage.getItem("usuario_actual");
    let rolActual = localStorage.getItem("rol_actual");

    if (!usuarioActual || rolActual !== "admin") {
        alert("Acceso denegado. No tienes permisos para ver esta página.");
        window.location.href = "index.html"; // Redirige a la página de inicio
    }
};