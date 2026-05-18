// ===============================
// SUPABASE CONFIG
// ===============================
const { createClient } = supabase;

const supabaseClient = createClient(
  "https://iiuhpmstxosfjnaelfrf.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpdWhwbXN0eG9zZmpuYWVsZnJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MTAzODcsImV4cCI6MjA5NDE4NjM4N30.szkMcsCY4cAiD_pm88cuZGgxbRAdYGykbLaSBedYwk0"
);

let gamesData = [];
let newsData = [];
let countdownInterval = null;
let bannerTimeout = null;


// ===============================
// SECCIONES (PESTAÑAS)
// ===============================
function showSection(sectionId) {
  document.querySelectorAll("main section").forEach(sec => sec.classList.add("hidden"));

  const target = document.getElementById(sectionId);
  if (target) target.classList.remove("hidden");

  const mobileMenu = document.getElementById("mobileMenu");
  if (mobileMenu) mobileMenu.classList.add("hidden");

  window.scrollTo({ top: 0, behavior: "smooth" });
}


// ===============================
// SISTEMA PARTICIPAR (CONTADOR + USUARIO)
// ===============================
function iniciarCuentaRegresiva() {
  const participarBtn = document.getElementById("participarBtn");
  const countdown = document.getElementById("countdown");
  const progressBar = document.getElementById("progressBar");
  const progressFill = document.getElementById("progressFill");
  const userForm = document.getElementById("userForm");
  const userSavedMsg = document.getElementById("userSavedMsg");

  if (!participarBtn || !countdown || !progressBar || !progressFill) return;

  let tiempo = 45;

  participarBtn.classList.add("hidden");
  countdown.classList.remove("hidden");
  progressBar.classList.remove("hidden");

  countdown.textContent = tiempo;
  progressFill.style.width = "100%";

  if (userForm) userForm.classList.add("hidden");
  if (userSavedMsg) userSavedMsg.classList.add("hidden");

  if (countdownInterval) clearInterval(countdownInterval);

  countdownInterval = setInterval(() => {
    tiempo--;

    countdown.textContent = tiempo;
    progressFill.style.width = ((tiempo / 45) * 100) + "%";

    if (tiempo <= 0) {
      clearInterval(countdownInterval);

      countdown.classList.add("hidden");
      progressBar.classList.add("hidden");

      if (userForm) {
        userForm.classList.remove("hidden");
      }
    }
  }, 1000);
}


// ===============================
// GUARDAR USUARIO ROBLOX (SIN DB)
// ===============================
function guardarUsuarioRoblox() {
  const input = document.getElementById("robloxUserInput");
  const msg = document.getElementById("userSavedMsg");

  if (!input) return;

  const user = input.value.trim();

  if (!user) {
    alert("Escribe tu usuario de Roblox");
    return;
  }

  if (msg) msg.classList.remove("hidden");

  alert("Usuario guardado para participar: " + user);

  input.value = "";
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
  }
}


// ===============================
// RENDER JUEGOS
// ===============================
function renderGames(lista) {
  const container = document.getElementById("gamesContainer");
  if (!container) return;

  container.innerHTML = "";

  if (!lista || lista.length === 0) {
    container.innerHTML = `
      <div class="neo-card p-6 text-center col-span-full">
        <h3 class="text-xl font-bold cyber-accent mb-2">No hay juegos todavía</h3>
        <p class="text-gray-400">Agrega juegos desde el panel admin (F8).</p>
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
            <span class="code-cyber-badge" style="max-width: 75%; overflow-wrap: break-word; word-break: break-word; white-space: normal;">
              ${code.trim()}
            </span>

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
// BUSCADOR
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
      const user = document.getElementById("adminUser").value.trim();
      const pass = document.getElementById("adminPass").value.trim();

      if (user === "admin" && pass === "1234") {
        if (adminLogin) adminLogin.classList.add("hidden");
        if (adminContent) adminContent.classList.remove("hidden");

        renderAdminList();
        fetchNoticias();
      } else {
        alert("Usuario o contraseña incorrectos");
      }
    });
  }
}


// ===============================
// ADMIN LIST JUEGOS
// ===============================
function renderAdminList() {
  const adminGamesList = document.getElementById("adminGamesList");
  if (!adminGamesList) return;

  adminGamesList.innerHTML = "";

  if (!gamesData || gamesData.length === 0) {
    adminGamesList.innerHTML = `
      <div class="neo-card p-6 text-center">
        <p class="text-gray-400">No hay juegos para editar.</p>
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
        <input type="text" value="${game.nombre}" data-id="${game.id}" class="adminNombre px-4 py-2 rounded-xl text-white bg-black/50 border border-cyan-400/30">
        <input type="text" value="${game.imagen_url}" data-id="${game.id}" class="adminImagen px-4 py-2 rounded-xl text-white bg-black/50 border border-cyan-400/30">
        <input type="text" value="${game.codigo}" data-id="${game.id}" class="adminCodigo px-4 py-2 rounded-xl text-white bg-black/50 border border-cyan-400/30">

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
// DELETE GAME SUPABASE
// ===============================
async function deleteGame(gameId) {
  const confirmar = confirm("¿Seguro que quieres eliminar este juego?");
  if (!confirmar) return;

  const { error } = await supabaseClient
    .from("juegos")
    .delete()
    .eq("id", gameId);

  if (error) {
    alert("Error borrando juego");
    console.error(error);
    return;
  }

  alert("Juego eliminado!");
  fetchJuegos();
}


// ===============================
// ADD GAME SUPABASE
// ===============================
async function quickAddGame() {
  const nombre = document.getElementById("newGameName").value.trim();
  const imagen = document.getElementById("newGameImage").value.trim();
  const codigos = document.getElementById("newGameCodes").value.trim();

  if (!nombre || !codigos) {
    alert("Completa nombre y códigos");
    return;
  }

  const { error } = await supabaseClient.from("juegos").insert([{
    nombre: nombre,
    imagen_url: imagen || "https://via.placeholder.com/512",
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

  alert("Juego agregado!");
  fetchJuegos();
}


// ===============================
// SAVE EDITS SUPABASE
// ===============================
async function saveChanges() {
  const nombres = document.querySelectorAll(".adminNombre");
  const imagenes = document.querySelectorAll(".adminImagen");
  const codigos = document.querySelectorAll(".adminCodigo");

  for (let i = 0; i < nombres.length; i++) {
    const id = nombres[i].dataset.id;

    const nuevoNombre = nombres[i].value.trim();
    const nuevaImagen = imagenes[i].value.trim();
    const nuevosCodigos = codigos[i].value.trim();

    await supabaseClient.from("juegos")
      .update({
        nombre: nuevoNombre,
        imagen_url: nuevaImagen,
        codigo: nuevosCodigos
      })
      .eq("id", id);
  }

  alert("Cambios guardados!");
  fetchJuegos();
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
      newsData = [];
    } else {
      newsData = data || [];
    }

    renderNoticias();
    renderAdminNoticias();

  } catch (err) {
    console.error("Error:", err);
    newsData = [];
    renderNoticias();
  }
}


// ===============================
// RENDER NOTICIAS EN SECCION
// ===============================
function renderNoticias() {
  const container = document.getElementById("newsContainer");
  if (!container) return;

  container.innerHTML = "";

  if (!newsData || newsData.length === 0) {
    container.innerHTML = `
      <div class="neo-card p-6 text-center col-span-full">
        <h3 class="text-xl font-bold cyber-accent mb-2">No hay noticias aún</h3>
        <p class="text-gray-400">Agrega noticias desde el panel admin (F8).</p>
      </div>
    `;
    return;
  }

  newsData.forEach(n => {
    const card = document.createElement("div");
    card.className = "neo-card overflow-hidden";

    card.innerHTML = `
      <img src="${n.imagen_url}" class="w-full h-48 object-cover" alt="${n.titulo}">
      <div class="p-6">
        <h3 class="text-xl font-bold titanium-title mb-2">${n.titulo}</h3>
        <p class="text-gray-300 text-sm mb-4" style="white-space: pre-line;">${n.contenido}</p>
        <p class="text-xs text-gray-500">Publicado</p>
      </div>
    `;

    container.appendChild(card);
  });
}


// ===============================
// RENDER NOTICIAS EN ADMIN
// ===============================
function renderAdminNoticias() {
  const adminNewsList = document.getElementById("adminNewsList");
  if (!adminNewsList) return;

  adminNewsList.innerHTML = "";

  if (!newsData || newsData.length === 0) {
    adminNewsList.innerHTML = `
      <div class="neo-card p-4 text-center">
        <p class="text-gray-400">No hay noticias publicadas.</p>
      </div>
    `;
    return;
  }

  newsData.forEach(n => {
    const div = document.createElement("div");
    div.className = "neo-card p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4";

    div.innerHTML = `
      <div class="flex items-center gap-4">
        <img src="${n.imagen_url}" class="w-20 h-20 object-cover rounded-lg border border-cyan-400/30">
        <div>
          <h4 class="font-bold text-white">${n.titulo}</h4>
          <p class="text-gray-400 text-sm" style="max-width: 400px; overflow-wrap: break-word;">
            ${n.contenido.substring(0, 80)}...
          </p>
        </div>
      </div>

      <button class="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-xl font-bold text-white"
        onclick="deleteNews(${n.id})">
        <i class="fas fa-trash"></i> Eliminar
      </button>
    `;

    adminNewsList.appendChild(div);
  });
}


// ===============================
// ADD NOTICIA SUPABASE
// ===============================
async function addNoticia() {
  const titulo = document.getElementById("newsTitle").value.trim();
  const imagen = document.getElementById("newsImage").value.trim();
  const contenido = document.getElementById("newsContent").value.trim();

  if (!titulo || !contenido) {
    alert("Completa el título y el contenido");
    return;
  }

  const { error } = await supabaseClient.from("noticias").insert([{
    titulo: titulo,
    imagen_url: imagen || "https://via.placeholder.com/512",
    contenido: contenido
  }]);

  if (error) {
    alert("Error agregando noticia");
    console.error(error);
    return;
  }

  document.getElementById("newsTitle").value = "";
  document.getElementById("newsImage").value = "";
  document.getElementById("newsContent").value = "";

  alert("Noticia publicada!");
  fetchNoticias();
}


// ===============================
// DELETE NOTICIA
// ===============================
async function deleteNews(newsId) {
  const confirmar = confirm("¿Seguro que quieres eliminar esta noticia?");
  if (!confirmar) return;

  const { error } = await supabaseClient
    .from("noticias")
    .delete()
    .eq("id", newsId);

  if (error) {
    alert("Error eliminando noticia");
    console.error(error);
    return;
  }

  alert("Noticia eliminada!");
  fetchNoticias();
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
  const msg = document.getElementById("bannerMessage").value.trim();
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
// HACER FUNCIONES GLOBALES
// ===============================
window.showSection = showSection;
window.copyCode = copyCode;
window.deleteGame = deleteGame;
window.deleteNews = deleteNews;


// ===============================
// DOM LOADED
// ===============================
document.addEventListener("DOMContentLoaded", () => {

  showSection("inicio");

  // Participar
  const participarBtn = document.getElementById("participarBtn");
  if (participarBtn) {
    participarBtn.addEventListener("click", iniciarCuentaRegresiva);
  }

  // Guardar usuario
  const saveUserBtn = document.getElementById("saveUserBtn");
  if (saveUserBtn) {
    saveUserBtn.addEventListener("click", guardarUsuarioRoblox);
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

  // Botones admin
  const quickAddBtn = document.getElementById("quickAddGameBtn");
  if (quickAddBtn) {
    quickAddBtn.addEventListener("click", quickAddGame);
  }

  const saveBtn = document.getElementById("saveChangesBtn");
  if (saveBtn) {
    saveBtn.addEventListener("click", saveChanges);
  }

  const startBannerBtn = document.getElementById("startBannerBtn");
  if (startBannerBtn) {
    startBannerBtn.addEventListener("click", activarBanner);
  }

  const deleteBannerBtn = document.getElementById("deleteBannerBtn");
  if (deleteBannerBtn) {
    deleteBannerBtn.addEventListener("click", borrarBanner);
  }

  const addNewsBtn = document.getElementById("addNewsBtn");
  if (addNewsBtn) {
    addNewsBtn.addEventListener("click", addNoticia);
  }

  // Cargar datos
  fetchJuegos();
  fetchBanner();
  fetchNoticias();

});
