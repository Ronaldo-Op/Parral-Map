// 🚀 Importar la configuración de Supabase
import { supabase } from './supabase-config.js';

let mapa;
let polilineas = [];
const LIMITE_POR_PETICION = 4000; // 🔥 Máximo permitido por Supabase

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



// 🚀 Iniciar el mapa de Google Maps
function iniciarMapa() {
    mapa = new google.maps.Map(document.getElementById('mapa'), {
        center: { lat: 26.9339, lng: -105.6664 },
        zoom: 14,
        mapTypeId: 'roadmap',
        disableDefaultUI: true, // 🔥 Muestra los controles de zoom y otros
        styles: estiloMapa
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
                    strokeWeight: 3,
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
        document.getElementById('velocidad-maxima').value = calle.osm_id;
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
        .from('noticias')
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
        contenido.innerText = publicacion.contenido;
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
    //document.getElementById('boton-agregar').addEventListener('click', abrirModal);
    //document.getElementById('guardar-publicacion').addEventListener('click', guardarPublicacion);
    //document.getElementById('cerrar-modal').addEventListener('click', cerrarModal);
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

// 🚀 Función para Abrir el Modal de Nueva Noticia
function abrirModalNoticia() {
    const modal = document.getElementById('modal-noticia');
    modal.style.display = 'flex';
}

// 🚀 Función para Cerrar el Modal de Nueva Noticia
function cerrarModalNoticia() {
    const modal = document.getElementById('modal-noticia');
    modal.style.display = 'none';
}

// 🚀 Eventos para el Botón de Agregar Noticia y Cancelar
window.addEventListener('load', () => {
    const botonAgregarNoticia = document.getElementById('boton-agregar-noticia');
    const botonCancelarNoticia = document.getElementById('cancelar-noticia');
    
    botonAgregarNoticia.addEventListener('click', abrirModalNoticia);
    botonCancelarNoticia.addEventListener('click', cerrarModalNoticia);
});

// 🚀 Función para Subir Imagen a Supabase Storage (URL Manual)
async function subirImagen(file) {
    // 🔥 Normalizar el Nombre del Archivo
    const nombreArchivo = `${Date.now()}_${file.name}`
        .toLowerCase()
        .replace(/\s+/g, '_')   // Reemplazar espacios por guiones bajos
        .replace(/[^a-z0-9_.-]/g, ''); // Eliminar caracteres especiales

    console.log("🟡 Nombre del archivo normalizado:", nombreArchivo);

    const { data, error } = await supabase
        .storage
        .from('imagenes-noticias')
        .upload(nombreArchivo, file);

    if (error) {
        console.error("❌ Error al subir la imagen:", error.message);
        return null;
    } else {
        console.log("✅ Imagen subida correctamente:", data);
    }

    // 🚀 Construir la URL pública manualmente
    const supabaseUrl = 'https://hhkclunpavbswlethwry.supabase.co';
    const publicURL = `${supabaseUrl}/storage/v1/object/public/imagenes-noticias/${nombreArchivo}`;
    console.log("✅ URL pública generada manualmente:", publicURL);

    return publicURL;
}

// 🚀 Función Depurada para Guardar Nueva Noticia en Supabase
async function guardarNoticia() {
    const titulo = document.getElementById('titulo-noticia').value;
    const contenido = document.getElementById('descripcion-noticia').value;
    const imagenInput = document.getElementById('imagen-noticia');
    let imagenURL = null;

    // 🚀 Validación de Campos
    if (!titulo || !contenido) {
        alert("❌ Completa todos los campos.");
        return;
    }

    // 🚀 Verificar si hay una imagen seleccionada
    if (imagenInput.files.length > 0) {
        const imagen = imagenInput.files[0];
        imagenURL = await subirImagen(imagen);

        if (!imagenURL) {
            alert("❌ Error al subir la imagen.");
            console.error("❌ No se obtuvo una URL de imagen válida.");
            return;
        } else {
            console.log("✅ URL de la imagen obtenida:", imagenURL);
        }
    } else {
        console.log("ℹ️ No se seleccionó ninguna imagen.");
    }

    // 🚀 Obtener ID del Usuario Autenticado
    const { data: usuario, error: errorUsuario } = await supabase.auth.getUser();
    if (errorUsuario) {
        console.error("❌ Error al obtener el usuario:", errorUsuario.message);
        return;
    }

    const autor = usuario?.user?.id || null;

    // 🔥 Verificación antes de Insertar
    console.log("🔍 Datos a Insertar:", {
        titulo,
        contenido,
        imagen_url: imagenURL,
        autor,
        fecha: new Date().toISOString()
    });

    // 🚀 Insertar Noticia en Supabase
    const { error } = await supabase
        .from('noticias')
        .insert([{ 
            titulo, 
            contenido, 
            imagen_url: imagenURL, 
            autor, 
            fecha: new Date().toISOString() 
        }]);

    if (error) {
        console.error("❌ Error al guardar la noticia:", error.message);
        alert("❌ Error al guardar la noticia.");
    } else {
        alert("✅ Noticia publicada con éxito.");
        document.getElementById('titulo-noticia').value = '';
        document.getElementById('descripcion-noticia').value = '';
        document.getElementById('imagen-noticia').value = '';
        cerrarModalNoticia();
        cargarPublicaciones(); // 🔥 Recargar lista de noticias
    }
}

// 🚀 Evento para el Botón de Publicar Noticia
window.addEventListener('load', () => {
    const botonPublicar = document.getElementById('publicar-noticia');
    botonPublicar.addEventListener('click', guardarNoticia);
});
