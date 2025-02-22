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

// 🚀 Función para mostrar el menú lateral con los datos de la calle
function mostrarMenu(calle) {
    console.log("🚀 mostrarMenu() llamado con:", calle); // 🚀 Verificar si se llama

    calleSeleccionada = calle;

    document.getElementById('nombre-calle').value = calle.name;
    document.getElementById('velocidad-maxima').value = calle.maxspeed;
    document.getElementById('color-calle').value = calle.color || '#0000FF';

    const menuLateral = document.getElementById('menu-lateral');
    menuLateral.classList.add('activo'); // 🚀 Verificar si se agrega la clase `activo`

    console.log("🚀 Clase `activo` agregada a `menu-lateral`");
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