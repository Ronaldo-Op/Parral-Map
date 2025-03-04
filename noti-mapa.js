// 🚀 Importar la configuración de Supabase
import { supabase } from '../supabase-config.js';

let mapa;
let marcadores = [];

// 🚀 Iniciar el Mapa de Google Maps
function iniciarMapa() {
    mapa = new google.maps.Map(document.getElementById('noti-mapa'), {
        center: { lat: 26.9339, lng: -105.6664 },
        zoom: 13,
        mapTypeId: 'roadmap',
        mapId: "DEMO_MAP_ID",
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

        // 🔥 Crear Marcadores para cada Noticia
        data.forEach(noticia => {
            const marcador = new google.maps.Marker({
                position: { lat: parseFloat(noticia.latitud), lng: parseFloat(noticia.longitud) },
                map: mapa,
                title: noticia.titulo,
                icon: {
                    url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
                    scaledSize: new google.maps.Size(40, 40)
                }
            });

            // 🔥 Crear InfoWindow para Detalles
            const contenido = `
                <div class="info-window">
                    <h3>${noticia.titulo}</h3>
                    <img src="${noticia.imagen_url}" alt="${noticia.titulo}">
                    <p>${noticia.descripcion}</p>
                </div>
            `;

            const infoWindow = new google.maps.InfoWindow({
                content: contenido
            });

            marcador.addListener('click', () => {
                infoWindow.open(mapa, marcador);
            });

            marcadores.push(marcador);
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

