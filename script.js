// ==========================
// CONFIG SUPABASE
// ==========================

const SUPABASE_URL = "https://iiuhpmstxosfjnaelfrf.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpdWhwbXN0eG9zZmpuYWVsZnJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MTAzODcsImV4cCI6MjA5NDE4NjM4N30.szkMcsCY4cAiD_pm88cuZGgxbRAdYGykbLaSBedYwk0";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let gamesData = [];
let bannerTimeout;

// ==========================
// JUEGOS EJEMPLO
// ==========================

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
    }
];

// ==========================
// CARGAR JUEGOS DESDE SUPABASE
// ==========================

async function fetchJuegos() {
    try {
        const { data, error } = await supabaseClient
            .from("juegos")
            .select("*");

        if (error || !data || data.length === 0) {
            gamesData = juegosEjemplo;
        } else {
            gamesData = data;
        }

        renderGames(gamesData);

    } catch (err) {
        gamesData = juegosEjemplo;
        renderGames(gamesData);
    }
}

// ==========================
// RENDER JUEGOS
// ==========================

function renderGames(games) {
    const container = document.getElementById("gamesContainer");
    if (!container) return;

    container.innerHTML = "";

    games.forEach(game => {
        container.innerHTML += `
            <div class="game-card">
                <img src="${game.imagen_url}" class="game-img">
                <h3>${game.nombre}</h3>
                <p>${game.descripcion}</p>
                <button onclick="copyCode('${game.codigo}')">Copiar Código</button>
            </div>
        `;
    });
}

// ==========================
// COPIAR CÓDIGO
// ==========================

function copyCode(code) {
    navigator.clipboard.writeText(code);
    alert("Código copiado!");
}

// ==========================
// CAMBIAR SECCIONES
// ==========================

function showSection(sectionId) {
    const sections = document.querySelectorAll(".section");
    sections.forEach(sec => sec.style.display = "none");

    const active = document.getElementById(sectionId);
    if (active) active.style.display = "block";
}

// ==========================
// PARTICIPAR
// ==========================

function iniciarCuentaRegresiva() {
    alert("Participación registrada!");
}

// ==========================
// BUSCADOR
// ==========================

function aplicarBusqueda(valor) {
    const filtrados = gamesData.filter(game =>
        game.nombre.toLowerCase().includes(valor.toLowerCase())
    );
    renderGames(filtrados);
}

document.addEventListener("DOMContentLoaded", () => {

    fetchJuegos();

    const searchInput = document.getElementById("searchInput");
    const searchInputMobile = document.getElementById("searchInputMobile");

    if (searchInput) {
        searchInput.addEventListener("input", () => {
            aplicarBusqueda(searchInput.value);
        });
    }

    if (searchInputMobile) {
        searchInputMobile.addEventListener("input", () => {
            aplicarBusqueda(searchInputMobile.value);
        });
    }

    const participarBtn = document.getElementById("participarBtn");
    if (participarBtn) {
        participarBtn.addEventListener("click", iniciarCuentaRegresiva);
    }
});

// ==========================
// PANEL ADMIN CON F8
// ==========================

document.addEventListener("keydown", function (e) {
    if (e.key === "F8") {
        const password = prompt("Contraseña administrador:");
        if (password === "admin123") {
            const panel = document.getElementById("adminPanel");
            if (panel) panel.style.display = "block";
        } else {
            alert("Contraseña incorrecta");
        }
    }
});

// ==========================
// FUNCIONES GLOBALES
// ==========================

window.showSection = showSection;
window.copyCode = copyCode;
