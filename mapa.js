// 🚀 Importar la configuración de Supabase
import { supabase } from './supabase-config.js';

let mapa;
let polilineas = [];
const LIMITE_POR_PETICION = 1000; // 🔥 Máximo permitido por Supabase

// 🚀 Iniciar el mapa de Google Maps
function iniciarMapa() {
    mapa = new google.maps.Map(document.getElementById('mapa'), {
        center: { lat: 26.9339, lng: -105.6664 },
        zoom: 14,
        mapTypeId: 'roadmap',
        disableDefaultUI: true, // 🔥 Muestra los controles de zoom y otros
        styles: [
            {
                featureType: "poi", // 🔥 Oculta puntos de interés (marcadores predeterminados)
                stylers: [{ visibility: "off" }]
            },
            {
                featureType: "transit", // 🔥 Oculta las estaciones de transporte público
                stylers: [{ visibility: "on" }]
            },
            {
                featureType: "administrative.land_parcel", // 🔥 Oculta los límites de parcelas
                stylers: [{ visibility: "on" }]
            }
        ]
    });

    // 🔥 Cargar todas las calles desde Supabase
    cargarTodasLasCalles();
}

// 🚀 Función para cargar todas las calles usando paginación
async function cargarTodasLasCalles() {
    let calles = [];
    let desde = 0;
    let totalCalles = 0;

    try {
        // 🔥 Obtener el total de registros en la tabla
        const { count, error: errorCount } = await supabase
            .from('calles')
            .select('id', { count: 'exact' });

        if (errorCount) {
            console.error("❌ Error al obtener el total de calles:", errorCount.message);
            return;
        }

        totalCalles = count;
        console.log(`✅ Total de calles en Supabase: ${totalCalles}`);

        // 🔥 Obtener todas las calles usando paginación
        while (desde < totalCalles) {
            const { data, error } = await supabase
                .from('calles')
                .select('*')
                .neq('coordinates', null)
                .range(desde, desde + LIMITE_POR_PETICION - 1);

            if (error) {
                console.error("❌ Error al cargar calles desde Supabase:", error.message);
                return;
            }

            console.log(`✅ Calles obtenidas (${desde + 1} - ${desde + data.length}): ${data.length}`);
            calles = [...calles, ...data];
            desde += LIMITE_POR_PETICION;
        }

        console.log(`✅ Total de calles obtenidas: ${calles.length}`);
        // 🔥 Crear las polilíneas en el mapa
        calles.forEach(calle => {
            if (Array.isArray(calle.coordinates) && calle.coordinates.length > 0) {
                const coordinates = calle.coordinates.map(coord => ({
                    lat: parseFloat(coord[1]),
                    lng: parseFloat(coord[0])
                }));

                const polilinea = new google.maps.Polyline({
                    path: coordinates,
                    geodesic: true,
                    strokeColor: calle.color || '#0000FF',
                    strokeOpacity: 0.5,
                    strokeWeight: 8,
                    map: mapa
                });

                // 🚀 Asociar la polilínea con su calle correspondiente
                polilinea.calle = calle;
                polilineas.push(polilinea);

                // 🔥 Agregar evento `click` para mostrar el menú lateral
                google.maps.event.addListener(polilinea, 'click', function () {
                    console.log("🚀 Click en la polilínea"); // 🚀 Para verificar en consola
                    mostrarMenu(calle); // 🚀 Llama a `mostrarMenu()` al hacer clic
                });
            } else {
                console.warn(`⚠️ Coordenadas inválidas para la calle: ${calle.name}`);
            }
        });
    } catch (err) {
        console.error("❌ Error al conectar con Supabase:", err);
    }
}

window.onload = iniciarMapa;

// 🚀 Función para ajustar el tamaño del mapa al redimensionar la ventana
function ajustarMapa() {
    const contenedorMapa = document.getElementById('mapa');
    contenedorMapa.style.height = `${window.innerHeight}px`;
    contenedorMapa.style.width = `${window.innerWidth}px`;
}

// 🚀 Ajustar el mapa al cargar y al redimensionar la ventana
window.addEventListener('load', ajustarMapa);
window.addEventListener('resize', ajustarMapa);

// 🚀 Variable para almacenar la calle seleccionada
let calleSeleccionada = null;

// 🚀 Obtener el `UUID` del usuario logueado en Supabase
async function obtenerUUID() {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
        console.error("❌ Error al obtener el UUID:", error.message);
        return null;
    }
    return data.session?.user?.id || null;
}

// 🚀 Obtener el `role` del usuario desde la tabla `usuarios` en Supabase
async function obtenerRole(uuid) {
    const { data, error } = await supabase
        .from('usuarios')
        .select('role')
        .eq('id', uuid)
        .single();
    
    if (error) {
        console.error("❌ Error al obtener el rol del usuario:", error.message);
        return null;
    }
    return data.role;
}

// 🚀 Función para mostrar el menú lateral con los datos de la calle
async function mostrarMenu(calle) {
    console.log("🚀 mostrarMenu() llamado con:", calle); // 🚀 Para verificar en consola

    const uuid = await obtenerUUID();
    const role = await obtenerRole(uuid);

    console.log("🚀 UUID del usuario:", uuid);
    console.log("🚀 Rol del usuario:", role);

    // 🔥 Verificar si el rol es `admin` antes de mostrar el menú
    if (role === 'admin') {
        calleSeleccionada = calle;

        document.getElementById('nombre-calle').value = calle.name;
        document.getElementById('velocidad-maxima').value = calle.maxspeed;
        document.getElementById('color-calle').value = calle.color || '#0000FF';

        const menuLateral = document.getElementById('menu-lateral');
        menuLateral.classList.add('activo'); // 🚀 Agrega la clase `activo` solo al hacer clic

        console.log("🚀 Clase `activo` agregada a `menu-lateral`");
    } else {
        console.log("❌ El usuario no tiene permisos para editar.");
    }
}


// 🚀 Función para ocultar el menú lateral
function ocultarMenu() {
    console.log("🚀 ocultarMenu() llamado"); // 🚀 Verificar si se llama
    const menuLateral = document.getElementById('menu-lateral');
    menuLateral.classList.remove('activo');
}

// 🚀 Función para actualizar eventos `click` en las polilíneas
function actualizarEventosPolilineas() {
    polilineas.forEach((polilinea, index) => {
        console.log(`🚀 Asignando evento 'click' a la polilínea ${index}`);
        google.maps.event.addListener(polilinea, 'click', function () {
            console.log(`🚀 Click en la polilínea ${index}`);
            mostrarMenu(polilinea.calle); // 🚀 Pasar datos de la calle a mostrarMenu()
        });
    });
}

// 🚀 Función para guardar los cambios en Supabase
async function guardarCambios() {
    const nuevoNombre = document.getElementById('nombre-calle').value;
    const nuevoMaxspeed = document.getElementById('velocidad-maxima').value;
    const nuevoColor = document.getElementById('color-calle').value;

    const { error } = await supabase.from('calles').update({
        name: nuevoNombre,
        maxspeed: nuevoMaxspeed,
        color: nuevoColor
    }).eq('id', calleSeleccionada.id);

    if (error) {
        console.error("❌ Error al actualizar los datos:", error.message);
    } else {
        console.log("✅ Datos actualizados en Supabase.");

        // 🔥 Actualizar los valores en la variable `calleSeleccionada`
        calleSeleccionada.name = nuevoNombre;
        calleSeleccionada.maxspeed = nuevoMaxspeed;
        calleSeleccionada.color = nuevoColor;

        // 🔥 Actualizar solo la polilínea seleccionada
        const polilineaSeleccionada = polilineas.find(p => p.calle.id === calleSeleccionada.id);
        if (polilineaSeleccionada) {
            polilineaSeleccionada.setOptions({ strokeColor: nuevoColor });
        }

        ocultarMenu(); // 🚀 Cerrar el menú lateral
    }
}


// 🚀 Eventos para guardar cambios y cerrar el menú
document.getElementById('guardar-cambios').addEventListener('click', guardarCambios);
document.getElementById('cerrar-menu').addEventListener('click', ocultarMenu);

// 🚀 Función para Cargar Publicaciones desde Supabase
async function cargarPublicaciones() {
    const { data, error } = await supabase
        .from('noticias')
        .select('*')
        .order('fecha', { ascending: false });

    if (error) {
        console.error("❌ Error al cargar publicaciones:", error.message);
        return;
    }

    const contenedor = document.getElementById('contenedor-publicaciones');
    contenedor.innerHTML = ''; // 🔥 Limpiar publicaciones anteriores

    data.forEach(publicacion => {
        const div = document.createElement('div');
        div.className = 'publicacion';
        div.innerHTML = `
            <h4>${publicacion.titulo}</h4>
            <p>${publicacion.contenido}</p>
            <span class="fecha">${new Date(publicacion.fecha).toLocaleString()}</span>
        `;
        contenedor.appendChild(div);
    });
}

// 🚀 Función para Guardar Nueva Publicación en Supabase
async function guardarPublicacion() {
    const titulo = document.getElementById('titulo-publicacion').value;
    const contenido = document.getElementById('contenido-publicacion').value;

    if (!titulo || !contenido) {
        alert("❌ Completa todos los campos.");
        return;
    }

    const { error } = await supabase
        .from('noticias')
        .insert([{ titulo, contenido, fecha: new Date().toISOString() }]);

    if (error) {
        console.error("❌ Error al guardar la publicación:", error.message);
    } else {
        document.getElementById('titulo-publicacion').value = '';
        document.getElementById('contenido-publicacion').value = '';
        cargarPublicaciones();
    }

    cerrarModal();
}

// 🚀 Inicialización y Eventos
window.addEventListener('load', () => {
    cargarPublicaciones();
    document.getElementById('boton-agregar').addEventListener('click', abrirModal);
    document.getElementById('guardar-publicacion').addEventListener('click', guardarPublicacion);
    document.getElementById('cerrar-modal').addEventListener('click', cerrarModal);
});

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