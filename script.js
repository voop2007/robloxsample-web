// ===============================
// SUPABASE CONFIG (PEGA TU URL Y KEY)
// ===============================
const { createClient } = supabase;

const SUPABASE_URL = "https://iiuhpmstxosfjnaelfrf.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpdWhwbXN0eG9zZmpuYWVsZnJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MTAzODcsImV4cCI6MjA5NDE4NjM4N30.szkMcsCY4cAiD_pm88cuZGgxbRAdYGykbLaSBedYwk0";

const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ===============================
// GLOBAL VARS
// ===============================
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
// PARTICIPAR (CONTADOR)
// ===============================
function iniciarCuentaRegresiva() {
  const participarBtn = document.getElementById("participarBtn");
  const countdown = document.getElementById("countdown");
  const progressBar = document.getElementById("progressBar");
  const progressFill = document.getElementById("progressFill");
  const userForm = document.getElementById("userForm");

  if (!participarBtn || !countdown || !progressBar || !progressFill) return;

  let tiempo = 45;

  participarBtn.classList.add("hidden");
  countdown.classList.remove("hidden");
  progressBar.classList.remove("hidden");

  countdown.textContent = tiempo;
  progressFill.style.width = "100%";

  if (userForm) userForm.classList.add("hidden");

  if (countdownInterval) clearInterval(countdownInterval);

  countdownInterval = setInterval(() => {
    tiempo--;

    countdown.textContent = tiempo;
    progressFill.style.width = ((tiempo / 45) * 100) + "%";

    if (tiempo <= 0) {
      clearInterval(countdownInterval);

      countdown.classList.add("hidden");
      progressBar.classList.add("hidden");

      if (userForm) userForm.classList.remove("hidden");
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
    (game.nombre || "").toLowerCase().includes(valor.toLowerCase())
  );

  renderGames(filtrados);
}

// ===============================
// CARGAR JUEGOS DESDE SUPABASE
// ===============================
async function fetchJuegos() {
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
  renderAdminGamesList();
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
      <img src="${game.imagen_url || ""}" 
        class="w-full h-40 object-cover rounded-lg mb-4" 
        alt="${game.nombre || "Juego"}"
        onerror="this.src='https://via.placeholder.com/512'">

      <h3 class="text-xl font-bold titanium-title mb-2">${game.nombre || "Sin nombre"}</h3>
      <p class="text-gray-400 text-sm mb-3">${game.descripcion || ""}</p>

      <div class="space-y-2">
        ${codesArray.map(code => `
          <div class="flex items-center justify-between gap-2">
            <span class="code-cyber-badge break-all">${code.trim()}</span>
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
// PANEL ADMIN (F8)
// ===============================
function configurarAdminPanel() {
  const adminPanel = document.getElementById("adminPanel");
  const closeAdmin = document.getElementById("closeAdmin");

  const loginBtn = document.getElementById("loginBtn");

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
    loginBtn.addEventListener("click", loginAdmin);
  }
}

// ===============================
// LOGIN ADMIN REAL (SUPABASE AUTH)
// ===============================
async function loginAdmin() {
  const email = document.getElementById("adminUser").value.trim();
  const password = document.getElementById("adminPass").value.trim();

  if (!email || !password) {
    alert("Escribe email y contraseña");
    return;
  }

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    alert("Credenciales incorrectas");
    console.error(error);
    return;
  }

  alert("Bienvenido Admin");

  document.getElementById("adminLogin").classList.add("hidden");
  document.getElementById("adminContent").classList.remove("hidden");

  fetchJuegos();
  fetchNoticias();
  fetchBanner();
}

// ===============================
// VER SI YA ESTA LOGUEADO
// ===============================
async function checkAdminSession() {
  const { data } = await supabaseClient.auth.getSession();

  if (data.session) {
    document.getElementById("adminLogin").classList.add("hidden");
    document.getElementById("adminContent").classList.remove("hidden");
  } else {
    document.getElementById("adminLogin").classList.remove("hidden");
    document.getElementById("adminContent").classList.add("hidden");
  }
}

// ===============================
// ADMIN LIST JUEGOS
// ===============================
function renderAdminGamesList() {
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
        <input type="text" value="${game.nombre || ""}" data-id="${game.id}" 
          class="adminNombre px-4 py-2 rounded-xl text-white bg-black/50 border border-cyan-400/30">

        <input type="text" value="${game.imagen_url || ""}" data-id="${game.id}" 
          class="adminImagen px-4 py-2 rounded-xl text-white bg-black/50 border border-cyan-400/30">

        <textarea data-id="${game.id}" 
          class="adminCodigo px-4 py-2 rounded-xl text-white bg-black/50 border border-cyan-400/30 resize-none h-20">${game.codigo || ""}</textarea>

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
// DELETE GAME
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

  alert("Juego eliminado!");
  fetchJuegos();
}

// ===============================
// ADD GAME
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
    alert("Error agregando juego (revisa policies)");
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
// SAVE EDITS
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

    const { error } = await supabaseClient.from("juegos")
      .update({
        nombre: nuevoNombre,
        imagen_url: nuevaImagen,
        codigo: nuevosCodigos
      })
      .eq("id", id);

    if (error) {
      console.error("Error guardando cambios:", error);
    }
  }

  alert("Cambios guardados!");
  fetchJuegos();
}

// ===============================
// NOTICIAS FETCH
// ===============================
async function fetchNoticias() {
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
  renderAdminNewsList();
}

// ===============================
// RENDER NOTICIAS
// ===============================
function renderNoticias() {
  const container = document.getElementById("newsContainer");
  if (!container) return;

  container.innerHTML = "";

  if (!newsData || newsData.length === 0) {
    container.innerHTML = `
      <div class="neo-card p-6 text-center col-span-full">
        <h3 class="text-xl font-bold cyber-accent mb-2">No hay noticias todavía</h3>
        <p class="text-gray-400">El admin puede publicar noticias desde el panel (F8).</p>
      </div>
    `;
    return;
  }

  newsData.forEach(news => {
    const div = document.createElement("div");
    div.className = "neo-card overflow-hidden";

    div.innerHTML = `
      <img src="${news.imagen_url || ""}" class="w-full h-48 object-cover"
        onerror="this.src='https://via.placeholder.com/512'">

      <div class="p-6">
        <h3 class="text-xl font-bold titanium-title mb-2">${news.titulo || "Sin título"}</h3>
        <p class="text-gray-300 text-sm mb-3">${news.contenido || ""}</p>
        <p class="text-gray-500 text-xs">Publicado: ${new Date(news.created_at).toLocaleDateString()}</p>
      </div>
    `;

    container.appendChild(div);
  });
}

// ===============================
// ADMIN NEWS LIST
// ===============================
function renderAdminNewsList() {
  const adminNewsList = document.getElementById("adminNewsList");
  if (!adminNewsList) return;

  adminNewsList.innerHTML = "";

  if (!newsData || newsData.length === 0) {
    adminNewsList.innerHTML = `
      <p class="text-gray-400">No hay noticias publicadas.</p>
    `;
    return;
  }

  newsData.forEach(n => {
    const div = document.createElement("div");
    div.className = "neo-card p-4 flex items-center justify-between gap-3";

    div.innerHTML = `
      <div>
        <h4 class="font-bold text-white">${n.titulo}</h4>
        <p class="text-gray-400 text-sm line-clamp-2">${n.contenido}</p>
      </div>

      <button class="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-xl font-bold text-white"
        onclick="deleteNews(${n.id})">
        <i class="fas fa-trash"></i>
      </button>
    `;

    adminNewsList.appendChild(div);
  });
}

// ===============================
// ADD NEWS
// ===============================
async function addNews() {
  const titulo = document.getElementById("newsTitle").value.trim();
  const imagen = document.getElementById("newsImage").value.trim();
  const contenido = document.getElementById("newsContent").value.trim();

  if (!titulo || !contenido) {
    alert("Completa título y contenido");
    return;
  }

  const { error } = await supabaseClient.from("noticias").insert([{
    titulo: titulo,
    imagen_url: imagen || "https://via.placeholder.com/512",
    contenido: contenido
  }]);

  if (error) {
    alert("Error publicando noticia (revisa policies)");
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
// DELETE NEWS
// ===============================
async function deleteNews(newsId) {
  const confirmar = confirm("¿Eliminar noticia?");
  if (!confirmar) return;

  const { error } = await supabaseClient
    .from("noticias")
    .delete()
    .eq("id", newsId);

  if (error) {
    alert("Error eliminando noticia (revisa policies)");
    console.error(error);
    return;
  }

  alert("Noticia eliminada!");
  fetchNoticias();
}

// ===============================
// BANNER FETCH
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
    alert("Error guardando banner (revisa policies)");
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
    alert("Error eliminando banner (revisa policies)");
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
document.addEventListener("DOMContentLoaded", async () => {
  showSection("inicio");

  // Participar
  const participarBtn = document.getElementById("participarBtn");
  if (participarBtn) participarBtn.addEventListener("click", iniciarCuentaRegresiva);

  // Guardar usuario
  const saveUserBtn = document.getElementById("saveUserBtn");
  if (saveUserBtn) saveUserBtn.addEventListener("click", guardarUsuarioRoblox);

  // Buscador PC
  const searchInput = document.getElementById("searchInput");
  if (searchInput) searchInput.addEventListener("input", () => aplicarBusqueda(searchInput.value));

  // Buscador móvil
  const searchInputMobile = document.getElementById("searchInputMobile");
  if (searchInputMobile) searchInputMobile.addEventListener("input", () => aplicarBusqueda(searchInputMobile.value));

  // Admin Panel
  configurarAdminPanel();

  // Botones admin
  const quickAddBtn = document.getElementById("quickAddGameBtn");
  if (quickAddBtn) quickAddBtn.addEventListener("click", quickAddGame);

  const saveBtn = document.getElementById("saveChangesBtn");
  if (saveBtn) saveBtn.addEventListener("click", saveChanges);

  const startBannerBtn = document.getElementById("startBannerBtn");
  if (startBannerBtn) startBannerBtn.addEventListener("click", activarBanner);

  const deleteBannerBtn = document.getElementById("deleteBannerBtn");
  if (deleteBannerBtn) deleteBannerBtn.addEventListener("click", borrarBanner);

  const addNewsBtn = document.getElementById("addNewsBtn");
  if (addNewsBtn) addNewsBtn.addEventListener("click", addNews);

  // Check session
  await checkAdminSession();

  // Cargar datos
  fetchJuegos();
  fetchNoticias();
  fetchBanner();
});
