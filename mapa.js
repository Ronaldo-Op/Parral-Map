import { supabase } from "./supabase-config.js"; // Importamos la conexión con Supabase

let mapa;
let calles = {}; // Almacena todas las calles y sus polilíneas
let colores = ["#0000FF", "#FF0000", "#00FF00", "#FFFF00", "#00FFFF"]; // Azul, Rojo, Verde, Amarillo
let infoWindow; // Para mostrar el nombre de la calle al pasar el cursor

async function iniciarMapa() {
    console.log("📌 Iniciando mapa...");
    
    // Inicializar Google Maps
    mapa = new google.maps.Map(document.getElementById("mapa"), {
        center: { lat: 26.9339, lng: -105.6664 },
        zoom: 14,
        disableDefaultUI: true,
        styles: [{ featureType: "poi", stylers: [{ visibility: "off" }] }]
    });

    infoWindow = new google.maps.InfoWindow();
    mostrarInfoWindow = "";

    // **1️⃣ Cargar GeoJSON antes de llamar a Supabase**
    console.log("📌 Cargando calles desde GeoJSON...");
    let geojsonData = await cargarGeoJSON();
    console.log("✅ GeoJSON cargado:", geojsonData);

    // **2️⃣ Cargar colores desde Supabase**
    console.log("📌 Cargando colores desde Supabase...");
    let coloresDesdeBD = await obtenerColoresDesdeSupabase();
    console.log("✅ Colores obtenidos de Supabase:", coloresDesdeBD);

    // **3️⃣ Dibujar las calles en el mapa con los datos combinados**
    dibujarCalles(geojsonData, coloresDesdeBD);

    // **Activar el detector del checkbox para InfoWindow**
    document.getElementById("toggleInfoWindow").addEventListener("change", function () {
        mostrarInfoWindow = this.checked;
    });

    // **4️⃣ Habilitar Realtime para cambios en la base de datos**
    habilitarRealtime();
}

// 🔥 **Cargar el archivo mapa.geojson**
async function cargarGeoJSON() {
    try {
        let response = await fetch("mapa.geojson");
        let data = await response.json();
        return data.features;
    } catch (error) {
        console.error("❌ Error al cargar GeoJSON:", error);
        return [];
    }
}

// 🔥 **Obtener colores guardados desde Supabase**
async function obtenerColoresDesdeSupabase() {
    const { data, error } = await supabase.from("calles").select("nombre, color");
    if (error) {
        console.error("❌ Error al obtener colores desde Supabase:", error);
        return {};
    }

    let coloresBD = {};
    data.forEach((calle) => {
        coloresBD[calle.nombre] = calle.color;
    });

    return coloresBD;
}

// 🔥 **Dibujar las calles en el mapa combinando los datos de GeoJSON y Supabase**
function dibujarCalles(geojsonData, coloresDesdeBD) {
    geojsonData.forEach((feature, index) => {
        if (feature.geometry.type === "LineString") {
            let coordenadas = feature.geometry.coordinates.map(coord => ({
                lat: coord[1],
                lng: coord[0]
            }));

            let nombreCalle = feature.properties.name || `Calle_${index}`;
            let colorInicial = coloresDesdeBD[nombreCalle] || colores[0]; // Si no hay color en BD, usa Azul

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

            // **Guardar en Supabase si aún no existe**
            guardarCalleEnSupabase(nombreCalle, colorInicial, coordenadas);
        }
    });
}

// 🔥 **Guardar una calle en Supabase (solo si no existe)**
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

// 🔥 **Actualizar el color en Supabase cuando el usuario lo cambia**
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

// 🔥 **Función para cambiar el color de la calle y guardarlo en Supabase**
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

// 🔥 Habilitar Realtime sin recargar la página
function habilitarRealtime() {
    supabase
        .channel("public:calles")
        .on("postgres_changes", { event: "UPDATE", schema: "public", table: "calles" }, (payload) => {
            console.log("📌 Cambio en Supabase detectado:", payload);
            
            let nombreCalle = payload.new.nombre;
            let nuevoColor = payload.new.color;

            // Aplicar el cambio solo a la calle que se modificó
            if (calles[nombreCalle]) {
                calles[nombreCalle].colorIndex = colores.indexOf(nuevoColor);

                // Cambiar el color en todas las secciones de la calle
                calles[nombreCalle].polilineas.forEach(polilinea => {
                    polilinea.setOptions({ strokeColor: nuevoColor });
                });

                console.log(`✅ Color de ${nombreCalle} actualizado en el mapa a ${nuevoColor}`);
            }
        })
        .subscribe();
}


window.onload = iniciarMapa;
