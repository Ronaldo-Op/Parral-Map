/*
let mapa;
let calles = {}; // Almacena todas las secciones de cada calle con su nombre
let colores = ["#0000FF", "#FF0000", "#00FF00", "#FFFF00", "#00FFFF"]; // Azul, Rojo, Verde, Amarillo
let infoWindow; // Para mostrar el nombre de la calle al pasar el cursor

function iniciarMapa() {
    mapa = new google.maps.Map(document.getElementById('mapa'), {
        center: { lat: 26.9339, lng: -105.6664 },
        zoom: 14,
        disableDefaultUI: true, // Oculta controles predeterminados
        styles: [
            {
                featureType: "poi", // Oculta puntos de interés (marcadores predeterminados)
                stylers: [{ visibility: "off" }]
            }
        ]
    });

    // Crear el cuadro de información
    infoWindow = new google.maps.InfoWindow();
    mostrarInfoWindow = "";

    // Cargar archivo GeoJSON con las calles
    fetch('mapa.geojson')
        .then(response => response.json())
        .then(data => {
            data.features.forEach((feature, index) => {
                if (feature.geometry.type === 'LineString') {
                    let coordenadas = feature.geometry.coordinates.map(coord => ({
                        lat: coord[1],
                        lng: coord[0]
                    }));

                    // Obtener el nombre de la calle o asignar un identificador único
                    let nombreCalle = feature.properties.name || `Calle_${index}`;

                    // Si la calle aún no existe en el objeto, inicializarla
                    if (!calles[nombreCalle]) {
                        calles[nombreCalle] = { polilineas: [], colorIndex: 0 };
                    }

                    // Crear la polilínea
                    let polilinea = new google.maps.Polyline({
                        path: coordenadas,
                        geodesic: true,
                        strokeColor: colores[0], // Color inicial (Azul)
                        strokeOpacity: 0.30,
                        strokeWeight: 7,
                        map: mapa
                    });

                    // Almacenar la polilínea dentro del grupo de la calle
                    calles[nombreCalle].polilineas.push(polilinea);

                    // Agregar evento de clic para cambiar color de TODAS las secciones de la calle
                    google.maps.event.addListener(polilinea, 'click', function () {
                        cambiarColorCalle(nombreCalle);
                    });

                    // Agregar evento para mostrar el nombre de la calle al pasar el cursor
                    google.maps.event.addListener(polilinea, 'mouseover', function (event) {
                        if (mostrarInfoWindow) {
                            infoWindow.setContent(nombreCalle);
                            infoWindow.setPosition(event.latLng);
                            infoWindow.open(mapa);
                        }
                    });

                    // Cerrar el cuadro de información al salir de la calle
                    google.maps.event.addListener(polilinea, 'mouseout', function () {
                        infoWindow.close();
                    });
                }
            });
        })
        .catch(error => console.error('Error al cargar el archivo GeoJSON:', error));
    
        // Detectar cambios en el checkbox para activar/desactivar InfoWindow
    document.getElementById("toggleInfoWindow").addEventListener("change", function () {
        mostrarInfoWindow = this.checked;
    });
}

function toggleMenu() {
    let menu = document.getElementById("menu");
    menu.style.display = (menu.style.display === "block") ? "none" : "block";
}

// Función para cambiar el color de TODAS las secciones de una calle
function cambiarColorCalle(nombreCalle) {
    if (calles[nombreCalle]) {
        let calle = calles[nombreCalle];

        // Alternar entre los colores disponibles
        calle.colorIndex = (calle.colorIndex + 1) % colores.length;
        let nuevoColor = colores[calle.colorIndex];

        // Cambiar el color de todas las secciones de la calle
        calle.polilineas.forEach(polilinea => {
            polilinea.setOptions({ strokeColor: nuevoColor });
        });
    }
}

window.onload = iniciarMapa;
*/
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
        mapTypeId: 'roadmap'
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
                    strokeOpacity: 0.7,
                    strokeWeight: 5,
                    map: mapa
                });

                polilineas.push(polilinea);

                // 🔥 Agregar evento `click` para mostrar un cuadro de diálogo
                google.maps.event.addListener(polilinea, 'click', async function () {
                    const nuevoNombre = prompt("Nombre de la Calle:", calle.name);
                    const nuevoMaxspeed = prompt("Velocidad Máxima:", calle.maxspeed);
                    const nuevoColor = prompt("Nuevo color en HEX (#FF0000):", calle.color);

                    // 🔥 Verificar si se ingresaron nuevos valores
                    if (nuevoNombre || nuevoMaxspeed || nuevoColor) {
                        polilinea.setOptions({ strokeColor: nuevoColor });

                        // 🔥 Actualizar los datos en Supabase
                        const { error } = await supabase.from('calles').update({
                            name: nuevoNombre,
                            maxspeed: nuevoMaxspeed,
                            color: nuevoColor
                        }).eq('id', calle.id);

                        if (error) {
                            console.error("❌ Error al actualizar los datos:", error.message);
                        } else {
                            console.log("✅ Datos actualizados en Supabase.");
                        }
                    }
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
