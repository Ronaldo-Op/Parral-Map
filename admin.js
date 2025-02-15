<<<<<<< HEAD
// Verifica si el usuario es admin antes de cargar la página
window.onload = function () {
    let usuarioActual = localStorage.getItem("usuario_actual");
    let rolActual = localStorage.getItem("rol_actual");

    if (!usuarioActual || rolActual !== "admin") {
        alert("Acceso denegado. No tienes permisos para ver esta página.");
        window.location.href = "index.html"; // Redirige a la página de inicio
    }
=======
// Verifica si el usuario es admin antes de cargar la página
window.onload = function () {
    let usuarioActual = localStorage.getItem("usuario_actual");
    let rolActual = localStorage.getItem("rol_actual");

    if (!usuarioActual || rolActual !== "admin") {
        alert("Acceso denegado. No tienes permisos para ver esta página.");
        window.location.href = "index.html"; // Redirige a la página de inicio
    }
>>>>>>> 11f0a8f3865b442d27fc42501401579e4532227b
};