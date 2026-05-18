// ===============================
// SUPABASE CONFIG
// ===============================
const { createClient } = supabase;

const supabaseClient = createClient(
    "https://iiuhpmstxosfjnaelfrf.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpdWhwbXN0eG9zZmpuYWVsZnJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MTAzODcsImV4cCI6MjA5NDE4NjM4N30.szkMcsCY4cAiD_pm88cuZGgxbRAdYGykbLaSBedYwk0"
);

let gamesData = [];
let noticiasData = [];

let countdownInterval = null;
let bannerTimeout = null;


// ===============================
// JUEGOS EJEMPLO
// ===============================
const juegosEjemplo = [
    {
        nombre: "Blox Fruits",
        codigo: "SUB2GAMERROBOT,ADMIN,STRAWHATMAINEE",
        imagen_url: "https://tr.rbxcdn.com/180DAY-5dcebd40eeb92d2b63c8799f7dc2a0cb/512/512/Image/Png/noFilter",
        descripcion: "Uno de los juegos mas populares de Roblox",
        jugadores: 1500000
    },
    {
        nombre: "Brookhaven RP",
        codigo: "BROOKHAVEN,RP2025,FREECASH",
        imagen_url: "https://tr.rbxcdn.com/180DAY-0d20b3c8edb946b2f4b27b6c2c78e8c7/512/512/Image/Png/noFilter",
        descripcion: "Juego de roleplay con casas, autos y ciudades",
        jugadores: 1200000
    },
    {
        nombre: "Pet Simulator 99",
        codigo: "FREEPET,DIAMONDS99,LUCKY",
        imagen_url: "https://tr.rbxcdn.com/180DAY-b6d1d1d1dfedca56a76a4d3c49d0b2c9/512/512/Image/Png/noFilter",
        descripcion: "Colecciona mascotas y gana recompensas",
        jugadores: 900000
    },
    {
        nombre: "Adopt Me",
        codigo: "ADOPTME,FREEPET2025,REWARD",
        imagen_url: "https://tr.rbxcdn.com/180DAY-0d8d2e84f75a9ed3cb04b03a6edb1b73/512/512/Image/Png/noFilter",
        descripcion: "Adopta mascotas y vive en una ciudad",
        jugadores: 800000
    },
    {
        nombre: "Tower of Hell",
        codigo: "TOH2025,FREEXP,LEVELUP",
        imagen_url: "https://tr.rbxcdn.com/180DAY-8f8cfb03d9f2a0cf1d2c4c12b3f5d2b4/512/512/Image/Png/noFilter",
        descripcion: "Supera torres imposibles y mejora tu habilidad",
        jugadores: 600000
    }
];


// ===============================
// SECCIONES (PESTAÑAS)
// ===============================
function showSection(sectionId) {
    document.querySelectorAll("main section").forEach(sec => sec.classList.add("hidden"));

    const target = document.getElementById(sectionId);
    if (target) {
        target.classList.remove("hidden");
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    // cerrar menú móvil si existe
    const mobileMenu = document.getElementById("mobileMenu");
    if (mobileMenu) mobileMenu.classList.add("hidden");
}


// ===============================
// SISTEMA PARTICIPAR (CONTADOR + USUARIO)
// ===============================
function iniciarCuentaRegresiva() {
    const participarBtn = document.getElementById("participarBtn");
    const countdown = document.getElementById("countdown");
    const progressBar = document.getElementById("progressBar");
    const progressFill = document.getElementById("progressFill");
    const sorteoContainer = document.getElementById("sorteoContainer");

    if (!participarBtn || !countdown || !progressBar || !progressFill || !sorteoContainer) return;

    let tiempo = 45;

    participarBtn.classList.add("hidden");
    countdown.classList.remove("hidden");
    progressBar.classList.remove("hidden");

    countdown.textContent = tiempo;
    progressFill.style.width = "100%";

    if (countdownInterval) clearInterval(countdownInterval);

    countdownInterval = setInterval(() => {
        tiempo--;

        countdown.textContent = tiempo;
        progressFill.style.width = ((tiempo / 45) * 100) + "%";

        if (tiempo <= 0) {
            clearInterval(countdownInterval);

            countdown.classList.add("hidden");
            progressBar.classList.add("hidden");

            sorteoContainer.innerHTML = `
                <div class="neo-card p-6 text-center">
                    <h3 class="text-xl font-bold cyber-accent mb-4">🎮 Ingresa tu usuario de Roblox</h3>

                    <input id="robloxUserInput" type="text" placeholder="Ej: Player123"
                        class="w-full px-4 py-3 rounded-xl text-white bg-black/50 border border-cyan-400/30 focus:outline-none focus:border-cyan-400 mb-4">

                    <button id="guardarUsuarioBtn" class="btn-cyber px-8 py-3 rounded-xl font-bold text-white">
                        <i class="fas fa-save mr-2"></i> Guardar
                    </button>
                </div>
            `;

            const guardarBtn = document.getElementById("guardarUsuarioBtn");
            if (guardarBtn) {
                guardarBtn.addEventListener("click", () => {
                    const user = document.getElementById("robloxUserInput").value.trim();

                    if (!user) {
                        alert("Escribe tu usuario de Roblox");
                        return;
                    }

                    alert("Usuario guardado para participar: " + user);

                    sorteoContainer.innerHTML = `
                        <div id="countdown" class="countdown-cyber mb-6 hidden">45</div>

                        <div class="progress-cyber hidden" id="progressBar">
                            <div class="progress-cyber-fill" id="progressFill"></div>
                        </div>

                        <button id="participarBtn" class="btn-cyber px-10 py-4 rounded-xl text-lg font-bold text-white">
                            <i class="fas fa-gift mr-2"></i> Participar Ahora
                        </button>
                    `;

                    document.getElementById("participarBtn").addEventListener("click", iniciarCuentaRegresiva);
                });
            }
        }
    }, 1000);
}


// ===============================
// CARGAR JUEGOS DESDE SUPABASE
// ===============================
async function fetchJuegos() {
    try {
        const { data, error } = await supabaseClient
            .from("juegos")
            .select("*")
            .order("id", { ascending: true });

        if (error) {
            console.error("Error cargando juegos:", error);
            gamesData = [];
        } else {
            gamesData = data || [];
        }

        renderGames(gamesData);
        renderAdminList();

    } catch (err) {
        console.error("Error:", err);
        gamesData = [];
        renderGames(gamesData);
        renderAdminList();
    }
}


// ===============================
// RENDER JUEGOS PUBLICO
// ===============================
function renderGames(lista) {
    const container = document.getElementById("gamesContainer");
    if (!container) return;

    container.innerHTML = "";

    if (!lista || lista.length === 0) {
        container.innerHTML = `
            <div class="neo-card p-8 text-center col-span-full">
                <h3 class="text-2xl font-bold cyber-accent mb-3">No hay juegos aún</h3>
                <p class="text-gray-400">Entra al panel admin (F8) para cargar juegos.</p>
            </div>
        `;
        return;
    }

    lista.forEach(game => {
        const codesArray = game.codigo ? game.codigo.split(",") : [];

        const card = document.createElement("div");
        card.className = "neo-card p-6";

        card.innerHTML = `
            <img src="${game.imagen_url}" class="w-full h-40 object-cover rounded-lg mb-4" alt="${game.nombre}">
            <h3 class="text-xl font-bold titanium-title mb-2">${game.nombre}</h3>
            <p class="text-gray-400 text-sm mb-3">${game.descripcion || ""}</p>

            <div class="space-y-2">
                ${codesArray.map(code => `
                    <div class="flex items-center justify-between gap-2">
                        <span class="code-cyber-badge">${code.trim()}</span>
                        <button class="btn-cyber px-3 py-2 rounded-lg text-sm" onclick="copyCode('${code.trim()}')">
                            <i class="fas fa-copy"></i>
                        </button>
                    </div>
                `).join("")}
            </div>
        `;

        container.appendChild(card);
    });
}


// ===============================
// COPIAR CÓDIGO
// ===============================
function copyCode(texto) {
    navigator.clipboard.writeText(texto);
    alert("Código copiado: " + texto);
}


// ===============================
// BUSCADOR (PC Y MOVIL)
// ===============================
function aplicarBusqueda(valor) {
    const filtrados = gamesData.filter(game =>
        game.nombre.toLowerCase().includes(valor.toLowerCase())
    );

    renderGames(filtrados);
}


// ===============================
// PANEL ADMIN (F8)
// ===============================
function configurarAdminPanel() {
    const adminBtn = document.getElementById("adminBtn");
    const adminPanel = document.getElementById("adminPanel");
    const closeAdmin = document.getElementById("closeAdmin");

    const adminLogin = document.getElementById("adminLogin");
    const adminContent = document.getElementById("adminContent");

    const loginBtn = document.getElementById("loginBtn");

    if (adminBtn) adminBtn.style.display = "none";

    document.addEventListener("keydown", (e) => {
        if (e.key === "F8") {
            e.preventDefault();
            if (adminPanel) adminPanel.classList.remove("hidden");
        }
    });

    if (closeAdmin) {
        closeAdmin.addEventListener("click", () => {
            if (adminPanel) adminPanel.classList.add("hidden");
        });
    }

    if (loginBtn) {
        loginBtn.addEventListener("click", () => {
            const user = document.getElementById("adminUser").value;
            const pass = document.getElementById("adminPass").value;

            if (user === "admin" && pass === "1234") {
                if (adminLogin) adminLogin.classList.add("hidden");
                if (adminContent) adminContent.classList.remove("hidden");
                renderAdminList();
                renderNoticiasAdmin();
            } else {
                alert("Usuario o contraseña incorrectos");
            }
        });
    }
}


// ===============================
// ADMIN LIST (JUEGOS)
// ===============================
function renderAdminList() {
    const adminGamesList = document.getElementById("adminGamesList");
    if (!adminGamesList) return;

    adminGamesList.innerHTML = "";

    if (!gamesData || gamesData.length === 0) {
        adminGamesList.innerHTML = `
            <div class="neo-card p-6 text-center">
                <h3 class="text-xl font-bold cyber-accent mb-3">No hay juegos</h3>
                <p class="text-gray-400">Agrega juegos desde arriba.</p>
            </div>
        `;
        return;
    }

    gamesData.forEach((game) => {
        const div = document.createElement("div");
        div.className = "neo-card p-6";

        div.innerHTML = `
            <h3 class="text-lg font-bold mb-4 cyber-accent">Juego #${game.id}</h3>

            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input type="text" value="${game.nombre}" class="adminNombre px-4 py-2 rounded-xl text-white bg-black/50 border border-cyan-400/30">
                <input type="text" value="${game.imagen_url}" class="adminImagen px-4 py-2 rounded-xl text-white bg-black/50 border border-cyan-400/30">
                <input type="text" value="${game.codigo}" class="adminCodigo px-4 py-2 rounded-xl text-white bg-black/50 border border-cyan-400/30">

                <button class="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-xl font-bold text-white"
                    onclick="deleteGame(${game.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        adminGamesList.appendChild(div);
    });
}


// ===============================
// DELETE GAME SUPABASE (FIXED)
// ===============================
async function deleteGame(gameId) {
    const confirmar = confirm("¿Seguro que quieres eliminar este juego?");
    if (!confirmar) return;

    const { error } = await supabaseClient
        .from("juegos")
        .delete()
        .eq("id", gameId);

    if (error) {
        alert("Error borrando juego (revisa policies)");
        console.error(error);
        return;
    }

    alert("Juego eliminado");
    fetchJuegos();
}


// ===============================
// ADD GAME SUPABASE
// ===============================
async function quickAddGame() {
    const nombre = document.getElementById("newGameName").value;
    const imagen = document.getElementById("newGameImage").value;
    const codigos = document.getElementById("newGameCodes").value;

    if (!nombre || !codigos) {
        alert("Completa nombre y códigos");
        return;
    }

    const { error } = await supabaseClient.from("juegos").insert([{
        nombre: nombre,
        imagen_url: imagen || "https://via.placeholder.com/300",
        codigo: codigos,
        descripcion: "Agregado desde admin",
        jugadores: 0
    }]);

    if (error) {
        alert("Error agregando juego");
        console.error(error);
        return;
    }

    document.getElementById("newGameName").value = "";
    document.getElementById("newGameImage").value = "";
    document.getElementById("newGameCodes").value = "";

    fetchJuegos();
}


// ===============================
// SAVE EDITS SUPABASE
// ===============================
async function saveChanges() {
    const nombres = document.querySelectorAll(".adminNombre");
    const imagenes = document.querySelectorAll(".adminImagen");
    const codigos = document.querySelectorAll(".adminCodigo");

    for (let i = 0; i < gamesData.length; i++) {
        gamesData[i].nombre = nombres[i].value;
        gamesData[i].imagen_url = imagenes[i].value;
        gamesData[i].codigo = codigos[i].value;

        await supabaseClient.from("juegos")
            .update({
                nombre: gamesData[i].nombre,
                imagen_url: gamesData[i].imagen_url,
                codigo: gamesData[i].codigo
            })
            .eq("id", gamesData[i].id);
    }

    alert("Cambios guardados!");
    fetchJuegos();
}


// ===============================
// CARGAR EJEMPLOS A SUPABASE
// ===============================
async function cargarEjemplosEnSupabase() {
    const confirmar = confirm("¿Quieres cargar juegos ejemplo en Supabase?");
    if (!confirmar) return;

    for (let juego of juegosEjemplo) {
        await supabaseClient.from("juegos").insert([juego]);
    }

    alert("Juegos ejemplo cargados!");
    fetchJuegos();
}


// ===============================
// BANNER SUPABASE
// ===============================
async function fetchBanner() {
    const { data, error } = await supabaseClient
        .from("anuncios")
        .select("*")
        .order("id", { ascending: false })
        .limit(1);

    if (error) {
        console.error("Error cargando banner:", error);
        return;
    }

    if (data && data.length > 0) {
        const { mensaje, expira } = data[0];
        const tiempoRestante = expira - Date.now();

        if (tiempoRestante > 0) {
            document.getElementById("bannerText").textContent = mensaje;
            document.getElementById("announcementBanner").classList.remove("hidden");

            if (bannerTimeout) clearTimeout(bannerTimeout);

            bannerTimeout = setTimeout(() => {
                document.getElementById("announcementBanner").classList.add("hidden");
            }, tiempoRestante);
        } else {
            document.getElementById("announcementBanner").classList.add("hidden");
        }
    }
}


// ===============================
// ACTIVAR BANNER
// ===============================
async function activarBanner() {
    const msg = document.getElementById("bannerMessage").value;
    const minutes = parseInt(document.getElementById("bannerMinutes").value);

    if (!msg || !minutes) {
        alert("Completa mensaje y minutos");
        return;
    }

    const expira = Date.now() + (minutes * 60000);

    const { error } = await supabaseClient
        .from("anuncios")
        .insert([{ mensaje: msg, expira: expira }]);

    if (error) {
        console.error(error);
        alert("Error guardando banner");
        return;
    }

    alert("Banner activado!");
    fetchBanner();
}


// ===============================
// BORRAR BANNER
// ===============================
async function borrarBanner() {
    const confirmar = confirm("¿Seguro que quieres borrar el banner?");
    if (!confirmar) return;

    const { error } = await supabaseClient
        .from("anuncios")
        .delete()
        .not("id", "is", null);

    if (error) {
        console.error(error);
        alert("Error eliminando banner");
        return;
    }

    document.getElementById("announcementBanner").classList.add("hidden");
    document.getElementById("bannerText").textContent = "";

    alert("Banner eliminado");
}


// ===============================
// NOTICIAS SUPABASE
// ===============================
async function fetchNoticias() {
    try {
        const { data, error } = await supabaseClient
            .from("noticias")
            .select("*")
            .order("id", { ascending: false });

        if (error) {
            console.error("Error cargando noticias:", error);
            noticiasData = [];
        } else {
            noticiasData = data || [];
        }

        renderNoticiasPublicas();
        renderNoticiasAdmin();

    } catch (err) {
        console.error("Error noticias:", err);
        noticiasData = [];
        renderNoticiasPublicas();
        renderNoticiasAdmin();
    }
}


// ===============================
// RENDER NOTICIAS PUBLICO
// ===============================
function renderNoticiasPublicas() {
    const container = document.getElementById("noticiasContainer");
    if (!container) return;

    container.innerHTML = "";

    if (!noticiasData || noticiasData.length === 0) {
        container.innerHTML = `
            <div class="neo-card p-8 text-center col-span-full">
                <h3 class="text-2xl font-bold cyber-accent mb-3">No hay noticias aún</h3>
                <p class="text-gray-400">El admin puede agregar noticias desde F8.</p>
            </div>
        `;
        return;
    }

    noticiasData.forEach(noticia => {
        const div = document.createElement("div");
        div.className = "neo-card p-6";

        div.innerHTML = `
            <img src="${noticia.imagen}" class="w-full h-44 object-cover rounded-lg mb-4" alt="${noticia.titulo}">
            <h3 class="text-2xl font-bold titanium-title mb-2">${noticia.titulo}</h3>
            <p class="text-gray-300 text-sm leading-relaxed">${noticia.contenido}</p>
        `;

        container.appendChild(div);
    });
}


// ===============================
// AGREGAR NOTICIA
// ===============================
async function agregarNoticia() {
    const titulo = document.getElementById("newNoticiaTitulo").value;
    const imagen = document.getElementById("newNoticiaImagen").value;
    const contenido = document.getElementById("newNoticiaTexto").value;

    if (!titulo || !contenido) {
        alert("Completa título y contenido");
        return;
    }

    const { error } = await supabaseClient
        .from("noticias")
        .insert([{
            titulo: titulo,
            imagen: imagen || "https://via.placeholder.com/600x400",
            contenido: contenido
        }]);

    if (error) {
        alert("Error agregando noticia");
        console.error(error);
        return;
    }

    document.getElementById("newNoticiaTitulo").value = "";
    document.getElementById("newNoticiaImagen").value = "";
    document.getElementById("newNoticiaTexto").value = "";

    alert("Noticia agregada!");
    fetchNoticias();
}


// ===============================
// ELIMINAR NOTICIA
// ===============================
async function deleteNoticia(id) {
    const confirmar = confirm("¿Eliminar esta noticia?");
    if (!confirmar) return;

    const { error } = await supabaseClient
        .from("noticias")
        .delete()
        .eq("id", id);

    if (error) {
        alert("Error eliminando noticia");
        console.error(error);
        return;
    }

    alert("Noticia eliminada!");
    fetchNoticias();
}


// ===============================
// RENDER NOTICIAS ADMIN
// ===============================
function renderNoticiasAdmin() {
    const list = document.getElementById("adminNoticiasList");
    if (!list) return;

    list.innerHTML = "";

    if (!noticiasData || noticiasData.length === 0) {
        list.innerHTML = `
            <div class="neo-card p-6 text-center">
                <h3 class="text-xl font-bold cyber-accent mb-3">No hay noticias</h3>
                <p class="text-gray-400">Agrega una noticia usando el formulario.</p>
            </div>
        `;
        return;
    }

    noticiasData.forEach(noticia => {
        const div = document.createElement("div");
        div.className = "neo-card p-6";

        div.innerHTML = `
            <h3 class="text-xl font-bold cyber-accent mb-3">${noticia.titulo}</h3>
            <p class="text-gray-400 text-sm mb-3">${noticia.contenido.substring(0, 120)}...</p>

            <button class="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-xl font-bold text-white"
                onclick="deleteNoticia(${noticia.id})">
                <i class="fas fa-trash mr-2"></i> Eliminar
            </button>
        `;

        list.appendChild(div);
    });
}


// ===============================
// HACER FUNCIONES GLOBALES PARA onclick
// ===============================
window.showSection = showSection;
window.copyCode = copyCode;
window.deleteGame = deleteGame;
window.cargarEjemplosEnSupabase = cargarEjemplosEnSupabase;
window.deleteNoticia = deleteNoticia;


// ===============================
// DOM LOADED
// ===============================
document.addEventListener("DOMContentLoaded", () => {

    // Iniciar en inicio
    showSection("inicio");

    // Participar
    const participarBtn = document.getElementById("participarBtn");
    if (participarBtn) {
        participarBtn.addEventListener("click", iniciarCuentaRegresiva);
    }

    // Buscador PC
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
        searchInput.addEventListener("input", () => {
            aplicarBusqueda(searchInput.value);
        });
    }

    // Buscador móvil
    const searchInputMobile = document.getElementById("searchInputMobile");
    if (searchInputMobile) {
        searchInputMobile.addEventListener("input", () => {
            aplicarBusqueda(searchInputMobile.value);
        });
    }

    // Admin
    configurarAdminPanel();

    // Botones admin juegos
    const quickAddBtn = document.getElementById("quickAddGameBtn");
    if (quickAddBtn) {
        quickAddBtn.addEventListener("click", quickAddGame);
    }

    const saveBtn = document.getElementById("saveChangesBtn");
    if (saveBtn) {
        saveBtn.addEventListener("click", saveChanges);
    }

    // Banner
    const startBannerBtn = document.getElementById("startBannerBtn");
    if (startBannerBtn) {
        startBannerBtn.addEventListener("click", activarBanner);
    }

    const deleteBannerBtn = document.getElementById("deleteBannerBtn");
    if (deleteBannerBtn) {
        deleteBannerBtn.addEventListener("click", borrarBanner);
    }

    // Noticias admin
    const addNoticiaBtn = document.getElementById("addNoticiaBtn");
    if (addNoticiaBtn) {
        addNoticiaBtn.addEventListener("click", agregarNoticia);
    }

    // Cargar datos
    fetchJuegos();
    fetchBanner();
    fetchNoticias();
});
