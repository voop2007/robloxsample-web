// ⚠️ MODIFICA ESTAS DOS LÍNEAS CON TUS CREDENCIALES REALES DE SUPABASE
const SUPABASE_URL = "https://tu-url-de-supabase.supabase.co"; 
const SUPABASE_KEY = "tu-clave-anon-publica-aqui";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
let todosLosJuegos = [];

// Cambiar de sección / pestañas de manera limpia
function showSection(sectionId) {
    document.querySelectorAll('.tab-content').forEach(section => {
        section.classList.add('hidden');
    });
    const target = document.getElementById(sectionId);
    if (target) { 
        target.classList.remove('hidden'); 
    }

    if (sectionId === 'juegos') { 
        fetchJuegos(); 
    }
}

// Lógica del botón de participar del sorteo
document.getElementById('participarBtn').addEventListener('click', () => {
    document.getElementById('participarBtn').classList.add('hidden');
    document.getElementById('countdown').classList.remove('hidden');
    document.getElementById('progressBar').classList.remove('hidden');
    
    let tiempo = 45;
    const progressFill = document.getElementById('progressFill');
    
    const intervalo = setInterval(() => {
        tiempo--;
        document.getElementById('countdown').innerText = tiempo;
        if (progressFill) {
            progressFill.style.width = `${((45 - tiempo) / 45) * 100}%`;
        }
        
        if (tiempo <= 0) {
            clearInterval(intervalo);
            alert("¡Registrando tu participación en el sorteo!");
        }
    }, 1000);
});

// 🔐 ENTRADAS SECRETAS AL PANEL ADMINISTRADOR (EASTER EGGS)

// 1. En PC: Abre al pulsar la tecla F8
window.addEventListener('keydown', (e) => {
    if (e.key === 'F8') {
        e.preventDefault();
        showSection('adminFormSection');
    }
});

// 2. En Celular: Abre al presionar el logo 8 veces seguidas
let clickContador = 0;
let temporizadorReset;
document.getElementById('logoAdminTrigger').addEventListener('click', () => {
    clickContador++;
    clearTimeout(temporizadorReset);
    // Si dejas de pulsar por más de 1.5 segundos, el contador se reinicia
    temporizadorReset = setTimeout(() => { clickContador = 0; }, 1500);

    if (clickContador === 8) {
        clickContador = 0;
        showSection('adminFormSection'); // Abre directo y de forma silenciosa
    }
});

// Cargar la información desde la tabla de Supabase
async function fetchJuegos() {
    const container = document.getElementById('gamesContainer');
    try {
        const { data: juegos, error } = await supabaseClient.from('juegos').select('*');
        if (error) throw error;
        todosLosJuegos = juegos || [];
        renderGamesList(todosLosJuegos);
    } catch (err) {
        container.innerHTML = `<p class="text-center text-red-400 col-span-full">Error al conectar con la base de datos.</p>`;
    }
}

// Renderizar las tarjetas de juegos dinámicamente
function renderGamesList(lista) {
    const container = document.getElementById('gamesContainer');
    if (lista.length === 0) {
        container.innerHTML = `<p class="text-center text-zinc-400 col-span-full py-8">No hay códigos activos en este momento.</p>`;
        return;
    }
    container.innerHTML = "";
    lista.forEach(juego => {
        const nombre = juego.nombre || "Juego";
        const imagen = juego.imagen_url || "https://images.rbxcdn.com/9fbda9da694da83928424fb84236a281.png";
        const codigo = juego.codigo || "No activo";
        
        container.innerHTML += `
            <div class="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden p-4 shadow-lg">
                <img src="${imagen}" alt="${nombre}" class="w-full h-40 object-cover rounded-lg mb-3">
                <h3 class="font-bold text-lg text-white mb-2 truncate">${nombre}</h3>
                <div class="bg-zinc-950 p-2 rounded border border-zinc-800 flex items-center justify-between">
                    <code class="text-pink-400 font-mono text-sm font-bold">${codigo}</code>
                    <button onclick="navigator.clipboard.writeText('${codigo}'); alert('¡Código copiado!');" class="text-zinc-400 hover:text-white text-xs px-2 py-1 bg-zinc-800 rounded">Copiar</button>
                </div>
            </div>`;
    });
}

// Filtrar juegos desde la barra de búsqueda
function filterGames() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const filtrados = todosLosJuegos.filter(juego => juego.nombre.toLowerCase().includes(query));
    renderGamesList(filtrados);
}

// Enviar nuevos juegos a Supabase desde el panel oculto
document.getElementById('quickAddGameBtn').addEventListener('click', async () => {
    const nombre = document.getElementById('newGameName').value;
    const imagen = document.getElementById('newGameImage').value;
    const codigo = document.getElementById('newGameCodes').value;

    if (!nombre || !codigo) return;
    try {
        const { error } = await supabaseClient.from('juegos').insert([{ nombre, imagen_url: imagen, codigo }]);
        if (error) throw error;
        alert("¡Juego guardado con éxito!");
        document.getElementById('newGameName').value = '';
        document.getElementById('newGameImage').value = '';
        document.getElementById('newGameCodes').value = '';
        showSection('juegos');
    } catch (err) { 
        alert("Error: " + err.message); 
    }
});
