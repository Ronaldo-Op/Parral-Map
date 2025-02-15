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

    // Cargar datos desde Firebase antes de generar las calles
    cargarCallesDesdeFirebase();
}

// 🔥 Cargar los datos de Firebase para aplicar los colores correctos
function cargarCallesDesdeFirebase() {
    db.collection("calles").get().then(snapshot => {
        let firebaseData = {};
        snapshot.forEach(doc => {
            firebaseData[doc.id] = doc.data().color; // Guardamos el color de cada calle
        });

        // Ahora que tenemos los colores, cargamos el archivo GeoJSON
        fetch('mapa.geojson')
            .then(response => response.json())
            .then(data => {
                data.features.forEach((feature, index) => {
                    if (feature.geometry.type === 'LineString') {
                        let coordenadas = feature.geometry.coordinates.map(coord => ({
                            lat: coord[1],
                            lng: coord[0]
                        }));

                        let nombreCalle = feature.properties.name || `Calle_${index}`;
                        let colorInicial = firebaseData[nombreCalle] || colores[0]; // Si no hay color en Firebase, usar azul

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

                        google.maps.event.addListener(polilinea, 'click', function () {
                            cambiarColorCalle(nombreCalle);
                        });

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
                    }
                });
            })
            .catch(error => console.error("Error al cargar el archivo GeoJSON:", error));
    }).catch(error => console.error("Error al cargar calles desde Firebase:", error));
}

// 🔥 Guardar el color de la calle en Firebase
function guardarCalleEnFirebase(nombreCalle, color) {
    db.collection("calles").doc(nombreCalle).set({ color: color })
        .then(() => console.log(`Calle ${nombreCalle} guardada en Firebase con color ${color}`))
        .catch(error => console.error(`Error al guardar ${nombreCalle}:`, error));
}

// 🔥 Modificar la función para guardar el color en Firebase
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

        // Guardar el nuevo color en Firebase
        guardarCalleEnFirebase(nombreCalle, nuevoColor);
    }
}

window.onload = iniciarMapa;
