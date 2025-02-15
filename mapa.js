import { supabase } from "./supabase-config.js"; // Importar conexión con Supabase

let mapa;
let calles = {}; // Almacena todas las secciones de cada calle con su nombre
let colores = ["#0000FF", "#FF0000", "#00FF00", "#FFFF00", "#00FFFF"]; // Azul, Rojo, Verde, Amarillo
let infoWindow; // Para mostrar el nombre de la calle al pasar el cursor

async function iniciarMapa() {
    mapa = new google.maps.Map(document.getElementById('mapa'), {
        center: { lat: 26.9339, lng: -105.6664 },
        zoom: 14,
        disableDefaultUI: true,
        styles: [{ featureType: "poi", stylers: [{ visibility: "off" }] }]
    });

    infoWindow = new google.maps.InfoWindow();
    mostrarInfoWindow = "";

    // Cargar el archivo mapa.geojson y sincronizar con Supabase
    await cargarCallesDesdeGeoJSON();

    // Detectar cambios en el checkbox para activar/desactivar InfoWindow
    document.getElementById("toggleInfoWindow").addEventListener("change", function () {
        mostrarInfoWindow = this.checked;
    });
}

// 🔥 Cargar calles desde mapa.geojson y sincronizar con Supabase
async function cargarCallesDesdeGeoJSON() {
    try {
        let response = await fetch("mapa.geojson");
        let data = await response.json();

        // Obtener colores guardados en Supabase
        const { data: supabaseCalles, error } = await supabase.from("calles").select("*");
        if (error) console.error("❌ Error al obtener calles desde Supabase:", error);

        let coloresGuardados = {}; // Mapa para almacenar los colores guardados
        if (supabaseCalles) {
            supabaseCalles.forEach((calle) => {
                coloresGuardados[calle.nombre] = calle.color;
            });
        }

        data.features.forEach((feature, index) => {
            if (feature.geometry.type === "LineString") {
                let coordenadas = feature.geometry.coordinates.map(coord => ({
                    lat: coord[1],
                    lng: coord[0]
                }));

                let nombreCalle = feature.properties.name || `Calle_${index}`;
                let colorInicial = coloresGuardados[nombreCalle] || colores[0];

                if (!calles[nombreCalle]) {
                    calles[nombreCalle] = { polilineas: [], colorIndex: colores.indexOf(colorInicial) };
                }

                let polilinea = new google.maps.Polyline({
                    path: coordenadas,
                    geodesic: true,
                    strokeColor: colorInicial,
                    strokeOpacity: 0.30,
                    strokeWeight: 7,
                    map: mapa
                });

                calles[nombreCalle].polilineas.push(polilinea);

                // Evento de clic para cambiar color
                google.maps.event.addListener(polilinea, "click", function () {
                    cambiarColorCalle(nombreCalle);
                });

                // Evento para mostrar nombre de la calle al pasar el cursor
                google.maps.event.addListener(polilinea, "mouseover", function (event) {
                    if (mostrarInfoWindow) {
                        infoWindow.setContent(nombreCalle);
                        infoWindow.setPosition(event.latLng);
                        infoWindow.open(mapa);
                    }
                });

                google.maps.event.addListener(polilinea, "mouseout", function () {
                    infoWindow.close();
                });

                // Guardar la calle en Supabase si aún no existe
                if (!coloresGuardados[nombreCalle]) {
                    guardarCalleEnSupabase(nombreCalle, colorInicial, coordenadas);
                }
            }
        });
    } catch (error) {
        console.error("❌ Error al cargar el archivo GeoJSON:", error);
    }
}

// 🔥 Guardar la calle en Supabase
async function guardarCalleEnSupabase(nombreCalle, color, coordenadas) {
    const { data, error } = await supabase
        .from("calles")
        .upsert([{ nombre: nombreCalle, color: color, coordenadas: JSON.stringify(coordenadas) }]);

    if (error) {
        console.error(`❌ Error al guardar ${nombreCalle} en Supabase:`, error);
    } else {
        console.log(`✅ Calle ${nombreCalle} guardada en Supabase.`);
    }
}

// 🔥 Función para cambiar el color de la calle y guardarlo en Supabase
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

        // Guardar el cambio en Supabase
        actualizarColorEnSupabase(nombreCalle, nuevoColor);
    }
}

// 🔥 Actualizar el color en Supabase
async function actualizarColorEnSupabase(nombreCalle, color) {
    const { error } = await supabase
        .from("calles")
        .update({ color: color })
        .eq("nombre", nombreCalle);

    if (error) {
        console.error(`❌ Error al actualizar color en Supabase para ${nombreCalle}:`, error);
    } else {
        console.log(`✅ Color de la calle ${nombreCalle} actualizado en Supabase.`);
    }
}

// 🔥 Habilitar Realtime para ver cambios en vivo
supabase
    .channel("public:calles")
    .on("postgres_changes", { event: "*", schema: "public", table: "calles" }, (payload) => {
        console.log("📌 Cambio en Supabase detectado:", payload);
        cargarCallesDesdeGeoJSON(); // Recargar las calles con los datos actualizados
    })
    .subscribe();

window.onload = iniciarMapa;
