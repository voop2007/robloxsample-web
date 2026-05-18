// ===============================
// SUPABASE CONFIG
// ===============================
const { createClient } = supabase;

const supabaseClient = createClient(
    "https://iiuhpmstxosfjnaelfrf.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpdWhwbXN0eG9zZmpuYWVsZnJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MTAzODcsImV4cCI6MjA5NDE4NjM4N30.szkMcsCY4cAiD_pm88cuZGgxbRAdYGykbLaSBedYwk0"
);

// ===============================
// VARIABLES
// ===============================
let gamesData = [];
let countdownInterval = null;
let bannerTimeout = null;


// ===============================
// JUEGOS EJEMPLO (PARA CARGAR A SUPABASE)
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
// SECCIONES
// ===============================
function showSection(sectionId) {
    document.querySelectorAll("main section").forEach(sec => sec.classList.add("hidden"));
    document.getElementById(sectionId).classList.remove("hidden");
}


// ===============================
// CONTADOR PARTICIPAR
// ===============================
const participarBtn = document.getElementById("participarBtn");
const countdown = document.getElementById("countdown");
const progressBar = document.getElementById("progressBar");
const progressFill = document.getElementById("progressFill");

function iniciarCuentaRegresiva() {
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
            participarBtn.classList.remove("hidden");
        }
    }, 1000);
}

participarBtn.addEventListener("click", iniciarCuentaRegresiva);


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

    } catch (err) {
        console.error("Error:", err);
        gamesData = [];
        renderGames(gamesData);
    }
}


// ===============================
// RENDER JUEGOS + BOTÓN COPIAR
// ===============================
function renderGames(lista) {
    const container = document.getElementById("gamesContainer");
    container.innerHTML = "";

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
                        <button class="copy-btn" onclick="copyCode('${code.trim()}')">
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
// BUSCADOR
// ===============================
const searchInput = document.getElementById("searchInput");

if (searchInput) {
    searchInput.addEventListener("input", () => {
        const valor = searchInput.value.toLowerCase();

        const filtrados = gamesData.filter(game =>
            game.nombre.toLowerCase().includes(valor)
        );

        renderGames(filtrados);
    });
}


// ===============================
// PANEL ADMIN OCULTO (F8)
// ===============================
const adminBtn = document.getElementById("adminBtn");
const adminPanel = document.getElementById("adminPanel");
const closeAdmin = document.getElementById("closeAdmin");

const adminLogin = document.getElementById("adminLogin");
const adminContent = document.getElementById("adminContent");

const loginBtn = document.getElementById("loginBtn");

// ocultar botón admin
if (adminBtn) adminBtn.style.display = "none";

// abrir con F8
document.addEventListener("keydown", (e) => {
    if (e.key === "F8") {
        e.preventDefault();
        adminPanel.classList.remove("hidden");
    }
});

// cerrar panel admin
if (closeAdmin) {
    closeAdmin.addEventListener("click", () => {
        adminPanel.classList.add("hidden");
    });
}

// login
if (loginBtn) {
    loginBtn.addEventListener("click", () => {
        const user = document.getElementById("adminUser").value;
        const pass = document.getElementById("adminPass").value;

        if (user === "admin" && pass === "1234") {
            adminLogin.classList.add("hidden");
            adminContent.classList.remove("hidden");
            renderAdminList();
        } else {
            alert("Usuario o contraseña incorrectos");
        }
    });
}


// ===============================
// ADMIN LISTA EDITABLE
// ===============================
function renderAdminList() {
    const adminGamesList = document.getElementById("adminGamesList");
    adminGamesList.innerHTML = "";

    gamesData.forEach((game, index) => {
        const div = document.createElement("div");
        div.className = "neo-card p-6";

        div.innerHTML = `
            <h3 class="text-lg font-bold mb-4 cyber-accent">Juego #${game.id}</h3>

            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input type="text" value="${game.nombre}" class="adminNombre px-4 py-2 rounded-xl text-white bg-black/50 border border-cyan-400/30">
                <input type="text" value="${game.imagen_url}" class="adminImagen px-4 py-2 rounded-xl text-white bg-black/50 border border-cyan-400/30">
                <input type="text" value="${game.codigo}" class="adminCodigo px-4 py-2 rounded-xl text-white bg-black/50 border border-cyan-400/30">

                <button class="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-xl font-bold text-white"
                    onclick="deleteGame(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        adminGamesList.appendChild(div);
    });
}


// ===============================
// ELIMINAR JUEGO EN SUPABASE
// ===============================
async function deleteGame(index) {
    const gameId = gamesData[index].id;

    const { error } = await supabaseClient
        .from("juegos")
        .delete()
        .eq("id", gameId);

    if (error) {
        alert("Error borrando juego");
        console.error(error);
        return;
    }

    fetchJuegos();
}


// ===============================
// AGREGAR JUEGO EN SUPABASE
// ===============================
document.getElementById("quickAddGameBtn").addEventListener("click", async () => {
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
});


// ===============================
// GUARDAR EDITS EN SUPABASE
// ===============================
document.getElementById("saveChangesBtn").addEventListener("click", async () => {
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
});


// ===============================
// FUNCIÓN NUEVA: CARGAR EJEMPLOS EN SUPABASE
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
// BANNER ADMIN EN SUPABASE
// ===============================
async function fetchBanner() {
    const { data } = await supabaseClient
        .from("anuncios")
        .select("*")
        .order("id", { ascending: false })
        .limit(1);

    if (data && data.length) {
        const { mensaje, expira } = data[0];

        const tiempoRestante = expira - Date.now();
        if (tiempoRestante > 0) {
            document.getElementById("bannerText").textContent = mensaje;
            document.getElementById("announcementBanner").classList.remove("hidden");

            bannerTimeout = setTimeout(() => {
                document.getElementById("announcementBanner").classList.add("hidden");
            }, tiempoRestante);
        }
    }
}


// activar banner
document.getElementById("startBannerBtn").addEventListener("click", async () => {
    const msg = document.getElementById("bannerMessage").value;
    const minutes = parseInt(document.getElementById("bannerMinutes").value);

    if (!msg || !minutes) {
        alert("Completa el mensaje y minutos.");
        return;
    }

    const expira = Date.now() + minutes * 60000;

    await supabaseClient.from("anuncios").insert([{ mensaje: msg, expira }]);

    alert("Banner guardado!");
    fetchBanner();
});


// borrar banner
document.getElementById("deleteBannerBtn").addEventListener("click", async () => {
    await supabaseClient.from("anuncios").delete().not("id", "is", null);
    document.getElementById("announcementBanner").classList.add("hidden");
});


// ===============================
fetchJuegos();
fetchBanner();
