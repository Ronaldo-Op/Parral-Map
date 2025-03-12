import { supabase } from "./supabase-config.js";
/*
function mostrarSeccion(id) {
    // Ocultar todas las secciones
    document.querySelectorAll(".seccion").forEach(seccion => {
        seccion.classList.add("oculto");
    });

    // Mostrar la sección seleccionada
    document.getElementById(id).classList.remove("oculto");
}
*/
function habilitarEdicion() {
    document.getElementById("username").disabled = false;
    document.getElementById("nombre").disabled = false;
    document.getElementById("apellido").disabled = false;
    document.getElementById("inputFoto").disabled = false;

    document.getElementById("editarCuenta").style.display = "none";
    document.getElementById("guardarCuenta").style.display = "inline-block";
}


async function cargarDatosCuenta() {
    const { data: user, error: userError } = await supabase.auth.getUser();

    if (userError || !user || !user.user) {
        console.error("Error al obtener la información del usuario.");
        return;
    }

    const user_id = user.user.id;

    const { data: userData, error: profileError } = await supabase
        .from("usuarios")
        .select("username, first_name, last_name, email, foto_perfil")
        .eq("id", user_id)
        .single();

    if (profileError || !userData) {
        alert("No se pudo obtener la información de la cuenta.");
        return;
    }

    document.getElementById("username").value = userData.username;
    document.getElementById("nombre").value = userData.first_name;
    document.getElementById("apellido").value = userData.last_name;
    document.getElementById("email").value = userData.email;

    // Si hay foto de perfil, actualizarla
    if (userData.foto_perfil) {
        document.getElementById("fotoPerfil").src = userData.foto_perfil;
    }
}

async function guardarCuenta() {
    const username = document.getElementById("username").value;
    const nombre = document.getElementById("nombre").value;
    const apellido = document.getElementById("apellido").value;
    const fotoInput = document.getElementById("inputFoto").files[0];

    const { data: user, error: userError } = await supabase.auth.getUser();

    if (userError || !user || !user.user) {
        alert("Error al actualizar la cuenta. No se encontró el usuario.");
        return;
    }

    const user_id = user.user.id; // UUID del usuario

    let foto_url = null;

    // Si el usuario subió una nueva foto, guardarla en Supabase Storage
    if (fotoInput) {
        const filePath = `perfiles/${user_id}_${fotoInput.name}`;
        const { data: uploadData, error: uploadError } = await supabase
            .storage
            .from("avatars")
            .upload(filePath, fotoInput, { upsert: true });

        if (uploadError) {
            console.error("Error al subir la foto:", uploadError);
            alert("No se pudo subir la foto.");
        } else {
            foto_url = `https://TU_SUPABASE_URL.supabase.co/storage/v1/object/public/avatars/${filePath}`;
        }
    }

    // Construir el objeto de actualización sin incluir valores nulos
    const updateData = {};
    if (username) updateData.username = username;
    if (nombre) updateData.first_name = nombre;
    if (apellido) updateData.last_name = apellido;
    if (foto_url) updateData.foto_url = foto_url;

    // Verificar si hay algo que actualizar
    if (Object.keys(updateData).length === 0) {
        alert("No hay cambios para actualizar.");
        return;
    }

    // Actualizar los datos en Supabase
    const { error: updateError } = await supabase
        .from("usuarios")
        .update(updateData)
        .eq("id", user_id); // Asegurar que la consulta usa `eq()`

    if (updateError) {
        console.error("Error al actualizar los datos:", updateError);
        alert("Hubo un error al actualizar los datos.");
        return;
    }

    alert("Cuenta actualizada con éxito.");

    // Bloquear los campos nuevamente
    document.getElementById("username").disabled = true;
    document.getElementById("nombre").disabled = true;
    document.getElementById("apellido").disabled = true;
    document.getElementById("inputFoto").disabled = true;

    document.getElementById("editarCuenta").style.display = "inline-block";
    document.getElementById("guardarCuenta").style.display = "none";

    // Recargar los datos para reflejar los cambios
    cargarDatosCuenta();
}

async function cargarPublicacionesModeracion() {
    const contenedor = document.getElementById("contenedor-moderacion");
    contenedor.innerHTML = "<p>Cargando publicaciones...</p>";

    try {
        const { data: publicaciones, error } = await supabase
            .from("noticias_ubicacion")
            .select("id, titulo, descripcion, username, fecha, imagen_url, estado")

        if (error) throw error;

        if (!publicaciones || publicaciones.length === 0) {
            contenedor.innerHTML = "<p>No hay publicaciones para mostrar.</p>";
            return;
        }

        // Limpiar contenedor y generar tarjetas
        contenedor.innerHTML = "";

        publicaciones.forEach(pub => {
            const tarjeta = document.createElement("div");
            tarjeta.classList.add("tarjeta-publicacion");

            tarjeta.innerHTML = `
                <h3>${pub.titulo}</h3>
                <img src="${pub.imagen_url || 'placeholder.jpg'}" alt="Imagen de la publicación" class="imagen-publicacion">
                <p><strong>Usuario:</strong> ${pub.username}</p>
                <p>${pub.descripcion}</p>
                <p><small>📅 ${new Date(pub.fecha).toLocaleString()}</small></p>
                <p><strong>Estado:</strong> ${pub.estado}</p>
                <div class="acciones-moderacion">
                    ${
                        pub.estado === "pendiente"
                            ? `
                                <button onclick="aprobarPublicacion('${pub.id}')">✅ Aprobar</button>
                                <button onclick="rechazarPublicacion('${pub.id}')">❌ Rechazar</button>
                            `
                            : pub.estado === "aprobada"
                            ? `
                                <p style="color: green">✔ Aprobada</p>
                                <button onclick="eliminarPublicacion('${pub.id}')">🗑️ Eliminar</button>
                            `
                            : `<p style="color: gray">Estado: ${pub.estado}</p>`
                    }
                </div>
            `;

            tarjeta.classList.add("tarjeta-publicacion", pub.estado); // pub.estado debe ser "aprobada", "rechazada", etc.


            contenedor.appendChild(tarjeta);
        });

    } catch (err) {
        contenedor.innerHTML = `<p>Error al cargar publicaciones: ${err.message}</p>`;
    }
}

function mostrarSeccion(id) {
    // Ocultar todas las secciones
    document.querySelectorAll(".seccion").forEach(seccion => {
        seccion.classList.add("oculto");
    });

    // Mostrar la sección seleccionada
    document.getElementById(id).classList.remove("oculto");

    // Si es moderación, cargar publicaciones
    if (id === "moderacion") {
        cargarPublicacionesModeracion();
    }
}

async function aprobarPublicacion(id) {
    const { error } = await supabase
        .from("noticias_ubicacion")
        .update({ estado: "aprobada" })
        .eq("id", id);

    if (error) {
        alert("❌ Error al aprobar publicación.");
        console.error(error);
        return;
    }

    alert("✅ Publicación aprobada.");
    cargarPublicacionesModeracion();
}

async function rechazarPublicacion(id) {
    const confirmar = confirm("¿Seguro que deseas eliminar esta publicación?");
    if (!confirmar) return;

    const { error } = await supabase
        .from("noticias_ubicacion")
        .delete()
        .eq("id", id);

    if (error) {
        alert("❌ Error al eliminar la publicación.");
        console.error(error);
        return;
    }

    alert("🗑️ Publicación rechazada y eliminada.");
    cargarPublicacionesModeracion();
}

async function eliminarPublicacion(id) {
    const confirmar = confirm("¿Seguro que deseas eliminar esta publicación aprobada?");
    if (!confirmar) return;

    const { error } = await supabase
        .from("noticias_ubicacion")
        .delete()
        .eq("id", id);

    if (error) {
        alert("❌ Error al eliminar la publicación.");
        console.error(error);
        return;
    }

    alert("🗑️ Publicación eliminada correctamente.");
    cargarPublicacionesModeracion();
}

window.mostrarSeccion = mostrarSeccion;
document.addEventListener("DOMContentLoaded", cargarDatosCuenta);
window.habilitarEdicion = habilitarEdicion;
window.guardarCuenta = guardarCuenta;
window.cargarPublicacionesModeracion = cargarPublicacionesModeracion;
window.aprobarPublicacion = aprobarPublicacion;
window.rechazarPublicacion = rechazarPublicacion;
window.eliminarPublicacion = eliminarPublicacion;