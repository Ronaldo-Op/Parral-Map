// Función para cambiar entre Login y Registro
function mostrarRegistro() {
    document.getElementById("login-form").style.display = "none";
    document.getElementById("register-form").style.display = "block";
}

function mostrarLogin() {
    document.getElementById("register-form").style.display = "none";
    document.getElementById("login-form").style.display = "block";
}

// Detectar "Enter" en el campo de contraseña para iniciar sesión automáticamente
document.addEventListener("DOMContentLoaded", function () {
    let loginPassword = document.getElementById("login-password");
    let loginUsername = document.getElementById("login-username");

    if (loginPassword) {
        loginPassword.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                event.preventDefault(); // Evita la acción por defecto del formulario
                login(); // Llama a la función de inicio de sesión
            }
        });
    }

    if (loginUsername) {
        loginUsername.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                if (loginPassword) {
                    loginPassword.focus(); // Mueve el foco al campo de contraseña
                }
            }
        });
    }
});

// Función para Registrar Usuario
function registrar() {
    let username = document.getElementById("register-username").value;
    let password = document.getElementById("register-password").value;
    let isAdmin = document.getElementById("register-admin").checked;

    if (username === "" || password === "") {
        alert("Por favor, completa todos los campos.");
        return;
    }

    if (localStorage.getItem(username)) {
        alert("El usuario ya existe. Prueba otro nombre.");
    } else {
        let userData = {
            password: password,
            role: isAdmin ? "admin" : "usuario" // Define el rol
        };

        localStorage.setItem(username, JSON.stringify(userData));
        alert("Registro exitoso. Ahora puedes iniciar sesión.");
        mostrarLogin();
    }
}

// Función para Iniciar Sesión
function login() {
    let username = document.getElementById("login-username").value;
    let password = document.getElementById("login-password").value;

    if (username === "" || password === "") {
        alert("Por favor, completa todos los campos.");
        return;
    }

    let storedUser = localStorage.getItem(username);
    if (!storedUser) {
        alert("Usuario no encontrado.");
        return;
    }

    let userData = JSON.parse(storedUser);

    if (userData.password === password) {
        localStorage.setItem("usuario_actual", username);
        localStorage.setItem("rol_actual", userData.role); // Guarda el rol del usuario

        if (userData.role === "admin") {
            window.location.href = "admin.html"; // Redirige a los administradores
        } else {
            window.location.href = "mapa.html"; // Redirige a usuarios comunes
        }
    } else {
        alert("Contraseña incorrecta.");
    }
}

// Verifica si el usuario ya inició sesión
window.onload = function () {
    if (localStorage.getItem("usuario_actual")) {
        window.location.href = "mapa.html"; // Redirige si ya está autenticado
    }
}

// Función para cerrar sesión
function logout() {
    localStorage.removeItem("usuario_actual"); // Elimina el usuario de la sesión
    window.location.href = "index.html"; // Redirige a la página de inicio
};
