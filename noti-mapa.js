// 🚀 Importar la configuración de Supabase
import { supabase } from '../supabase-config.js';

let mapa;

// 🚀 Iniciar el Mapa de Google Maps
function iniciarMapa() {
    mapa = new google.maps.Map(document.getElementById('noti-mapa'), {
        center: { lat: 26.9339, lng: -105.6664 },
        zoom: 13,
        mapTypeId: 'roadmap',
        mapId: '2be7a20d7d4279a',
        disableDefaultUI: true
    });

    // 🔥 Cargar todas las noticias desde Supabase
    cargarNoticias();
    agregarEventosLongPress();
}

// 🚀 Cargar Noticias desde Supabase
async function cargarNoticias() {
    try {
        const { data, error } = await supabase
            .from('noticias_ubicacion')
            .select('*');

        if (error) {
            console.error("❌ Error al cargar noticias:", error.message);
            return;
        }

        const {AdvancedMarkerElement} = await google.maps.importLibrary("marker");

        // Suponiendo que 'noticias' es la lista de noticias obtenida de Supabase
        data.forEach(noticia => {
            const marker = new AdvancedMarkerElement({
                position: { lat: noticia.latitud, lng: noticia.longitud },
                map: mapa,
            });

            // Acceder al contenedor del marcador para agregar eventos
            const markerElement = marker.element;

            if (markerElement) {
                markerElement.addEventListener("mouseenter", (event) => {
                    mostrarTooltip(event, noticia);
                });

                markerElement.addEventListener("mouseleave", ocultarTooltip);

                markerElement.addListener("click", (event) => {
                    mostrarTooltip(event, noticia, true);
                });
            }
        });


    } catch (err) {
        console.error("❌ Error al conectar con Supabase:", err);
    }
}

// Función para obtener publicaciones de la base de datos
async function obtenerPublicaciones() {
    const { data, error } = await supabase
        .from("noticias_ubicacion")
        .select("id, username, titulo, descripcion, imagen_url, latitud, longitud, fecha")
        .order("fecha", { ascending: false });
    
    if (error) {
        console.error("Error obteniendo publicaciones:", error);
        return;
    }

    cargarPublicaciones();
}

// 🚀 Función para Cargar Publicaciones con Imagen en el Feed (Estilo Moderno)
async function cargarPublicaciones() {
    const publicacionesContainer = document.getElementById('contenedor-publicaciones');

    // 🔥 Verificar si el contenedor existe
    if (!publicacionesContainer) {
        console.error("❌ Error: No se encontró el contenedor de publicaciones.");
        return;
    }

    publicacionesContainer.innerHTML = ''; // Limpiar contenido previo

    // 🚀 Obtener publicaciones de Supabase
    const { data: publicaciones, error } = await supabase
        .from('noticias_ubicacion')
        .select('*')
        .order('fecha', { ascending: false });

    if (error) {
        console.error("❌ Error al cargar publicaciones:", error.message);
        return;
    }

    // 🚀 Mostrar publicaciones en el feed
    publicaciones.forEach(publicacion => {
        const card = document.createElement('div');
        card.classList.add('card-publicacion');

        const header = document.createElement('div');
        header.classList.add('card-header');
        header.innerHTML = `<h3>${publicacion.titulo}</h3>`;
        card.appendChild(header);

        // 🔥 Mostrar la imagen solo si existe una URL válida
        if (publicacion.imagen_url) {
            const imagen = document.createElement('img');
            imagen.src = publicacion.imagen_url;
            imagen.alt = publicacion.titulo;
            imagen.classList.add('imagen-publicacion');
            card.appendChild(imagen);
        }

        const contenido = document.createElement('p');
        contenido.innerText = publicacion.descripcion;
        contenido.classList.add('card-contenido');
        card.appendChild(contenido);

        const fecha = document.createElement('small');
        fecha.innerText = new Date(publicacion.fecha).toLocaleString();
        fecha.classList.add('card-fecha');
        card.appendChild(fecha);

        // 🚀 Botones de interacción
        const interacciones = document.createElement('div');
        interacciones.classList.add('card-interacciones');
        interacciones.innerHTML = `
            <button class="btn-interaccion"><i class="fa fa-heart"></i> Me gusta</button>
            <button class="btn-interaccion"><i class="fa fa-comment"></i> Comentar</button>
        `;
        card.appendChild(interacciones);

        publicacionesContainer.appendChild(card);
    });
}

// Llamar a la función al cargar la página
document.addEventListener("DOMContentLoaded", obtenerPublicaciones);

window.onload = iniciarMapa;

// 🚀 Función para Alternar la Barra de Noticias
function alternarBarraNoticias() {
    const barraNoticias = document.getElementById('barra-noticias');
    const botonNoticias = document.getElementById('boton-noticias');

    barraNoticias.classList.toggle('activo');

    // 🚀 Ajustar la posición del botón
    if (barraNoticias.classList.contains('activo')) {
        botonNoticias.style.right = '-40px'; // 🔥 Botón al borde derecho de la barra
        botonNoticias.innerText = '📰'; // 🔥 Ícono para cerrar
    } else {
        botonNoticias.style.right = '-300px'; // 🔥 Botón oculto fuera de la pantalla
        botonNoticias.innerText = '📰'; // 🔥 Ícono para abrir
    }
}

// 🚀 Evento para el Botón de Noticias
window.addEventListener('load', () => {
    const botonNoticias = document.getElementById('boton-noticias');
    botonNoticias.addEventListener('click', alternarBarraNoticias);
});

// 🚀 Cerrar Noticias al Hacer Clic Fuera de la Sección
window.addEventListener('click', (event) => {
    const barraNoticias = document.getElementById('barra-noticias');
    const botonNoticias = document.getElementById('boton-noticias');

    // 🚀 Verificar si el clic fue fuera de la barra de noticias y del botón
    if (!barraNoticias.contains(event.target) && event.target !== botonNoticias) {
        cerrarBarraNoticias();
    }
});

// 🚀 Función para Cerrar la Barra de Noticias
function cerrarBarraNoticias() {
    const barraNoticias = document.getElementById('barra-noticias');
    barraNoticias.classList.remove('activo');
}

// Obtener el elemento de la tarjeta flotante
const tooltip = document.getElementById("noticiaTooltip");

// Función para mostrar la tarjeta con información
function mostrarTooltip(event, noticia, esClick = false) {
    let e = event.domEvent || window.event; // Manejar eventos en móviles y desktop

    tooltip.innerHTML = `
        <strong>${noticia.titulo}</strong>
        ${noticia.imagen_url ? `<img src="${noticia.imagen_url}" alt="Imagen de la noticia">` : ""}
        <p>${noticia.descripcion}</p>
        <p>${noticia.username}${noticia.fecha}</p>
    `;

    // Obtener el tamaño del tooltip
    let tooltipWidth = tooltip.clientWidth;
    let tooltipHeight = tooltip.clientHeight;

    // Si es hover, usar la posición del cursor
    let x = e?.clientX ?? window.innerWidth / 2;
    let y = e?.clientY ?? window.innerHeight / 2;

    // Si es clic, centrar en la pantalla correctamente
    if (esClick) {
        x = Math.max((window.innerWidth - tooltipWidth) / 5, 10); // Evitar que se salga por la derecha
        y = Math.max((window.innerHeight - tooltipHeight) / 3, 10); // Evitar que se salga por abajo
    }

    // Posicionar el tooltip en la pantalla
    tooltip.style.top = `${y}px`;
    tooltip.style.left = `${x}px`;
    tooltip.style.display = "block";

    // Si se abrió con clic, activar la detección de clic fuera
    if (esClick) {
        setTimeout(() => {
            document.addEventListener("click", cerrarTooltipFuera);
        }, 1);
    }
}


function cerrarTooltipFuera(event) {
    // Verificar si el clic ocurrió fuera del tooltip
    if (!tooltip.contains(event.target)) {
        ocultarTooltip();
        document.removeEventListener("click", cerrarTooltipFuera);
    }
}

// Función para ocultar la tarjeta
function ocultarTooltip() {
    tooltip.style.display = "none";
}

let lastClickedLocation = null;

// Función que agrega los eventos de "mantener presionado"
function agregarEventosLongPress() {
    if (!mapa) {
        console.error("Mapa no está definido.");
        return;
    }

    let longPressTimer;

    function iniciarLongPress(event) {
        lastClickedLocation = event.latLng;
        longPressTimer = setTimeout(() => {
            abrirModalNuevaNoticia();
        }, 3000);
    }

    function cancelarLongPress() {
        clearTimeout(longPressTimer);
    }

    // Agregar eventos después de que el mapa esté cargado
    mapa.addListener("mousedown", iniciarLongPress);
    mapa.addListener("mouseup", cancelarLongPress);
    mapa.addListener("mousemove", cancelarLongPress);

    mapa.addListener("click", function(event) {
        if (event.placeId) {
            event.stop();
        }
    });    

    mapa.addListener("touchstart", iniciarLongPress);
    mapa.addListener("touchend", cancelarLongPress);
}

async function abrirModalNuevaNoticia() {
    // Obtener el usuario autenticado
    const { data: user, error: userError } = await supabase.auth.getUser();

    if (userError || !user || !user.user) {
        console.log("Debes iniciar sesión para publicar una noticia.");
        return;
    }

    const user_id = user.user.id; // ID del usuario autenticado

    // Obtener el role del usuario desde la base de datos
    const { data: userData, error: roleError } = await supabase
        .from("usuarios")
        .select("role")
        .eq("id", user_id)
        .single();

    if (roleError || !userData) {
        console.log("No se pudo verificar tu rol de usuario.");
        return;
    }

    if (userData.role !== "admin") {
        console.log("No tienes permisos para crear noticias.");
        return;
    }

    // Si es admin, abrir el modal
    document.getElementById("modalNuevaNoticia").style.display = "flex";
}


function cerrarModalNuevaNoticia() {
    document.getElementById("modalNuevaNoticia").style.display = "none";
}

async function guardarNoticia() {
    const titulo = document.getElementById("titulo").value;
    const descripcion = document.getElementById("descripcion").value;
    const imagen_url = document.getElementById("imagen").value || null;

    if (!titulo || !descripcion) {
        alert("Por favor, completa todos los campos.");
        return;
    }

    if (!lastClickedLocation) {
        alert("No se encontró una ubicación válida.");
        return;
    }

    // Obtener el usuario autenticado
    const { data: user, error: userError } = await supabase.auth.getUser();

    if (userError || !user || !user.user) {
        alert("Debes iniciar sesión para publicar una noticia.");
        return;
    }

    const user_id = user.user.id; // ID del usuario autenticado

    // Obtener el username desde la base de datos
    const { data: userData, error: usernameError } = await supabase
        .from("usuarios")
        .select("username")
        .eq("id", user_id)
        .single();

    if (usernameError || !userData) {
        alert("No se pudo obtener el username del usuario.");
        return;
    }

    const username = userData.username; // Nombre de usuario obtenido de la base de datos

    // Insertar la noticia con el username
    const { data, error } = await supabase
        .from("noticias_ubicacion")
        .insert([
            {
                user_id,
                username, // Se guarda el username del usuario autenticado
                titulo,
                descripcion,
                imagen_url,
                latitud: lastClickedLocation.lat(),
                longitud: lastClickedLocation.lng(),
                fecha: new Date().toISOString()
            }
        ]);

    if (error) {
        console.error("Error al guardar la noticia:", error);
        alert("Hubo un error al guardar la noticia.");
    } else {
        alert("¡Noticia guardada exitosamente!");
        cerrarModalNuevaNoticia();
        obtenerPublicaciones(); // Recargar las noticias
    }
}

// Hacer que las funciones sean accesibles globalmente
window.cerrarModalNuevaNoticia = cerrarModalNuevaNoticia;
window.guardarNoticia = guardarNoticia;

// Esperar a que la página cargue antes de inicializar el mapa
document.addEventListener("DOMContentLoaded", iniciarMapa);