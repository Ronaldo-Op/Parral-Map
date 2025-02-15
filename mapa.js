import { supabase } from "./supabase-config.js"; // Importamos la conexión con Supabase

let mapa;
let calles = {}; // Almacena todas las secciones de cada calle con su nombre
let colores = ["#0000FF", "#FF0000", "#00FF00", "#FFFF00", "#00FFFF"]; // Azul, Rojo, Verde, Amarillo
let infoWindow; // Para mostrar el nombre de la calle al pasar el cursor

async function iniciarMapa() {
    mapa = new google.maps.Map(document.getElementById('mapa'), {
        center: { lat: 26.9339, lng: -105.6664 },
        zoom: 14,
        disableDefaultUI: true, // Oculta controles predeterminados
        styles: [{ featureType: "poi", stylers: [{ visibility: "off" }] }]
    });

    infoWindow = new google.maps.InfoWindow();
    mostrarInfoWindow = "";

    // Cargar las calles desde Supabase
    await cargarCallesDesdeSupabase();

    // Detectar cambios en el checkbox para activar/desactivar InfoWindow
    document.getElementById("toggleInfoWindow").addEventListener("change", function () {
        mostrarInfoWindow = this.checked;
    });
}

// 🔥 Cargar las calles desde Supabase
async function cargarCallesDesdeSupabase() {
    const { data, error } = await supabase.from("calles").select("*");

    if (error) {
        console.error("❌ Error al cargar calles desde Supabase:", error);
        return;
    }

    data.forEach((calle) => {
        let coordenadas = JSON.parse(calle.coordenadas); // Convertir JSON a coordenadas
        let nombreCalle = calle.nombre;
        let colorInicial = calle.color || colores[0]; // Si no hay color, usa azul

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
        google.maps.event.addListener(polilinea, 'click', function () {
            cambiarColorCalle(nombreCalle);
        });

        // Evento para mostrar nombre de la calle al pasar el cursor
        google.maps.event.addListener(polilinea, 'mouseover', function (event) {
            if (mostrarInfoWindow) {
                infoWindow.setContent(nombreCalle);
                infoWindow.setPosition(event.latLng);
                infoWindow.open(mapa);
            }
        });

        google.maps.event.addListener(polilinea, 'mouseout', function () {
            infoWindow.close();
        });
    });
}

// 🔥 Guardar el color de la calle en Supabase
async function guardarCalleEnSupabase(nombreCalle, color) {
    const { error } = await supabase
        .from("calles")
        .update({ color: color })
        .eq("nombre", nombreCalle);

    if (error) {
        console.error(`❌ Error al guardar color en Supabase para ${nombreCalle}:`, error);
    } else {
        console.log(`✅ Calle ${nombreCalle} guardada en Supabase con color ${color}`);
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

        // Guardar en Supabase
        guardarCalleEnSupabase(nombreCalle, nuevoColor);
    }
}

// 🔥 Habilitar Realtime (Opcional, para ver cambios en vivo)
supabase
    .channel("public:calles")
    .on("postgres_changes", { event: "*", schema: "public", table: "calles" }, (payload) => {
        console.log("📌 Cambio en Supabase detectado:", payload);
        cargarCallesDesdeSupabase();
    })
    .subscribe();

window.onload = iniciarMapa;
