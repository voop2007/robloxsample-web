const { createClient } = supabase;

const supabaseClient = createClient(
    "https://iiuhpmstxosfjnaelfrf.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpdWhwbXN0eG9zZmpuYWVsZnJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MTAzODcsImV4cCI6MjA5NDE4NjM4N30.szkMcsCY4cAiD_pm88cuZGgxbRAdYGykbLaSBedYwk0"
);

let gamesData = [];
let countdownInterval = null;
let bannerTimeout = null;


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
// RENDER JUEGOS
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

searchInput.addEventListener("input", () => {
    const valor = searchInput.value.toLowerCase();

    const filtrados = gamesData.filter(game =>
        game.nombre.toLowerCase().includes(valor)
    );

    renderGames(filtrados);
});


// ===============================
// PANEL ADMIN (F8)
// ===============================
const adminBtn = document.getElementById("adminBtn");
const adminPanel = document.getElementById("adminPanel");
const closeAdmin = document.getElementById("closeAdmin");

const adminLogin = document.getElementById("adminLogin");
const adminContent = document.getElementById("adminContent");

const loginBtn = document.getElementById("loginBtn");

// ocultar botón admin
adminBtn.style.display = "none";

// abrir panel con F8
document.addEventListener("keydown", (e) => {
    if (e.key === "F8") {
        e.preventDefault();
        adminPanel.classList.remove("hidden");
    }
});

// cerrar panel admin
closeAdmin.addEventListener("click", () => {
    adminPanel.classList.add("hidden");
});

// login
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


// ===============================
// ADMIN LIST
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
// DELETE GAME SUPABASE
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
// ADD GAME SUPABASE
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
// SAVE EDITS SUPABASE
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


// activar banner
document.getElementById("startBannerBtn").addEventListener("click", async () => {
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
});


// borrar banner
document.getElementById("deleteBannerBtn").addEventListener("click", async () => {
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
});


// ===============================
fetchJuegos();
fetchBanner();
