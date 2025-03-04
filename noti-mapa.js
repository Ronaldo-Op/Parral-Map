// 🚀 Importar la configuración de Supabase
import { supabase } from '../supabase-config.js';

let mapa;
let marcadores = [];

// 🚀 Estilo Mejorado para Google Maps
const estiloMapa = [
    {
        "elementType": "geometry",
        "stylers": [
            { "color": "#fdfdfd" } // Fondo blanco suave
        ]
    },
    {
        "elementType": "labels.icon",
        "stylers": [
            { "visibility": "off" }
        ]
    },
    {
        "elementType": "labels.text.fill",
        "stylers": [
            { "color": "#616161" } // Texto en gris oscuro
        ]
    },
    {
        "elementType": "labels.text.stroke",
        "stylers": [
            { "color": "#fdfdfd" } // Fondo blanco suave para texto
        ]
    },
    {
        "featureType": "administrative.land_parcel",
        "elementType": "labels.text.fill",
        "stylers": [
            { "color": "#bdbdbd" } // Parcelas en gris claro
        ]
    },
    {
        "featureType": "poi",
        "elementType": "geometry",
        "stylers": [
            { "color": "#e0e0e0" } // Lugares de interés en gris suave
        ]
    },
    {
        "featureType": "poi",
        "elementType": "labels.text.fill",
        "stylers": [
            { "color": "#757575" }
        ]
    },
    {
        "featureType": "poi.park",
        "elementType": "geometry",
        "stylers": [
            { "color": "#d5e8a4" } // Zonas verdes en verde suave
        ]
    },
    {
        "featureType": "poi.park",
        "elementType": "labels.text.fill",
        "stylers": [
            { "color": "#9e9e9e" }
        ]
    },
    {
        "featureType": "road",
        "elementType": "geometry",
        "stylers": [
            { "color": "#c6c6c6" } // Calles en blanco puro
        ]
    },
    {
        "featureType": "road.arterial",
        "elementType": "geometry",
        "stylers": [
            { "color": "#dadada" } // Calles arteriales en gris claro
        ]
    },
    {
        "featureType": "road.arterial",
        "elementType": "labels.text.fill",
        "stylers": [
            { "color": "#c6c6c6" } // Texto en gris oscuro
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry",
        "stylers": [
            { "color": "#c6c6c6" } // Carreteras en gris oscuro
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "labels.text.fill",
        "stylers": [
            { "color": "#616161" }
        ]
    },
    {
        "featureType": "road.local",
        "elementType": "labels.text.fill",
        "stylers": [
            { "color": "#9e9e9e" }
        ]
    },
    {
        "featureType": "transit.line",
        "elementType": "geometry",
        "stylers": [
            { "color": "#e0e0e0" }
        ]
    },
    {
        "featureType": "transit.station",
        "elementType": "geometry",
        "stylers": [
            { "color": "#eeeeee" }
        ]
    },
    {
        "featureType": "water",
        "elementType": "geometry",
        "stylers": [
            { "color": "#a2d5f2" } // Áreas acuáticas en azul claro
        ]
    },
    {
        "featureType": "water",
        "elementType": "labels.text.fill",
        "stylers": [
            { "color": "#929292" }
        ]
    }
];

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
                gmpClickable: true,
            });

            // Acceder al contenedor del marcador para agregar eventos
            const markerElement = marker.element;

            if (markerElement) {
                markerElement.addEventListener("mouseenter", (event) => {
                    mostrarTooltip(event, noticia);
                });

                markerElement.addEventListener("mouseleave", ocultarTooltip);

                markerElement.addEventListener("click", (event) => {
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
    tooltip.innerHTML = `
        <strong>${noticia.titulo}</strong>
        <p>${noticia.descripcion}</p>
        ${noticia.imagen_url ? `<img src="${noticia.imagen_url}" alt="Imagen de la noticia">` : ""}
    `;

    // Posicionar la tarjeta cerca del cursor
    tooltip.style.top = `${event.clientY + 15}px`;
    tooltip.style.left = `${event.clientX + 15}px`;
    tooltip.style.display = "block";

    // Si es clic, mantener la tarjeta abierta y cerrar al hacer clic fuera
    if (esClick) {
        document.addEventListener("click", cerrarTooltipFuera, { once: true });
    }
}

// Función para cerrar la tarjeta si se hace clic fuera de un marcador
function cerrarTooltipFuera(event) {
    if (!tooltip.contains(event.target)) {
        ocultarTooltip();
    }
}

// Función para ocultar la tarjeta
function ocultarTooltip() {
    tooltip.style.display = "none";
}

