import { supabase } from "./supabase-config.js";

// 🔥 Cargar la navbar dinámicamente
async function cargarNavbar() {
    try {
        const navbarContainer = document.createElement("div");
        const response = await fetch("navbar.html");
        navbarContainer.innerHTML = await response.text();
        document.body.prepend(navbarContainer);
        console.log("✅ Navbar cargada correctamente.");

        // ⚡ Disparar un evento personalizado para indicar que la navbar ya está en el DOM
        const eventoNavbarCargada = new Event("navbarCargada");
        document.dispatchEvent(eventoNavbarCargada);
    } catch (error) {
        console.error("❌ Error al cargar la navbar:", error);
    }
}

async function cargarFotoPerfil() {
    const { data: user, error: userError } = await supabase.auth.getUser();

    if (userError || !user || !user.user) {
        console.log("No se encontró usuario autenticado.");
        return;
    }

    const user_id = user.user.id;

    const { data: userData, error: profileError } = await supabase
        .from("usuarios")
        .select("foto_perfil")
        .eq("id", user_id)
        .single();

    if (profileError || !userData || !userData.foto_perfil) {
        console.log("No se encontró foto de perfil, usando imagen por defecto.");
        return;
    }

    // Actualizar la imagen de perfil en la navbar
    document.getElementById("fotoPerfilNavbar").src = userData.foto_perfil;
}


// ✅ Ejecutar la carga de la navbar al abrir cualquier página
document.addEventListener("DOMContentLoaded", cargarNavbar);
// Cargar la foto de perfil al cargar la navbar
document.addEventListener("DOMContentLoaded", cargarFotoPerfil);

