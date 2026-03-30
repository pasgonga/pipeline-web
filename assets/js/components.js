/**
 * Pipeline Software · Component Loader
 * ──────────────────────────────────────────────────────────────────────────────
 * Carga header y footer desde archivos HTML independientes e inyecta
 * comportamientos interactivos (menú móvil, nav activa, sticky).
 *
 * ⚠️  IMPORTANTE: fetch() requiere un servidor HTTP local.
 *     Para desarrollo, abre el proyecto con una de estas opciones:
 *       · VS Code  → extensión "Live Server" (clic derecho → Open with Live Server)
 *       · Terminal → npx serve .  (necesita Node.js)
 *       · Terminal → python3 -m http.server 3000
 *
 * Uso en cualquier página HTML:
 *   <div id="header-root"></div>
 *   … contenido …
 *   <div id="footer-root"></div>
 *   <script src="assets/js/components.js"></script>
 *
 * Para páginas en subdirectorios, ajusta el parámetro basePath:
 *   initComponents({ basePath: '../' });
 * ──────────────────────────────────────────────────────────────────────────────
 */

'use strict';

/* ─── Configuración ──────────────────────────────────────────────────────── */

const COMPONENT_DEFAULTS = {
  basePath: './',                         // Ruta raíz del proyecto
  headerSelector: '#header-root',
  footerSelector: '#footer-root',
  headerFile: 'components/header.html',
  footerFile: 'components/footer.html',
};


/* ─── Carga de componentes ───────────────────────────────────────────────── */

/**
 * Obtiene un archivo HTML y lo inyecta en el elemento indicado.
 * @param {string} selector  Selector CSS del contenedor
 * @param {string} url       Ruta al archivo HTML del componente
 * @returns {Promise<boolean>} true si se cargó correctamente
 */
async function loadComponent(selector, url) {
  const container = document.querySelector(selector);
  if (!container) return false;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    container.innerHTML = await response.text();
    return true;
  } catch (err) {
    console.warn(`[Pipeline] No se pudo cargar el componente "${url}":`, err.message);
    console.info('[Pipeline] ¿Estás usando un servidor local? Ver instrucciones en components.js');
    return false;
  }
}


/* ─── Menú móvil ─────────────────────────────────────────────────────────── */

/**
 * Inicializa el toggle del menú hamburger.
 * Requiere que header.html esté ya en el DOM.
 */
function initMobileNav() {
  const hamburger = document.getElementById('nav-hamburger');
  const navLinks  = document.getElementById('nav-links');
  if (!hamburger || !navLinks) return;

  function openMenu() {
    navLinks.classList.add('nav-links--open');
    hamburger.setAttribute('aria-expanded', 'true');
    hamburger.setAttribute('aria-label', 'Cerrar menú de navegación');
  }

  function closeMenu() {
    navLinks.classList.remove('nav-links--open');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Abrir menú de navegación');
  }

  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.contains('nav-links--open');
    isOpen ? closeMenu() : openMenu();
  });

  // Cerrar al hacer clic fuera del menú
  document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
      closeMenu();
    }
  });

  // Cerrar al pulsar Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });
}


/* ─── Nav activa por página ──────────────────────────────────────────────── */

/**
 * Añade la clase "nav-link--active" y aria-current="page" al link
 * que coincide con la URL actual. Funciona con rutas relativas y absolutas.
 */
function setActiveNavLink() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';

  document.querySelectorAll('.nav-links a[href]').forEach(link => {
    const linkPath = (link.getAttribute('href') || '').split('/').pop();
    if (linkPath && linkPath === currentPath) {
      link.classList.add('nav-link--active');
      link.setAttribute('aria-current', 'page');
    }
  });
}


/* ─── Nav sticky con sombra ──────────────────────────────────────────────── */

/**
 * Añade la clase "nav--scrolled" cuando el usuario ha hecho scroll,
 * aplicando una sombra que separa visualmente el nav del contenido.
 */
function initStickyNav() {
  const nav = document.querySelector('.nav');
  if (!nav) return;

  // IntersectionObserver es más eficiente que el evento scroll
  const sentinel = document.createElement('div');
  sentinel.setAttribute('aria-hidden', 'true');
  sentinel.style.cssText = 'position:absolute;top:0;height:1px;width:100%;pointer-events:none;';
  document.body.prepend(sentinel);

  const observer = new IntersectionObserver(
    ([entry]) => nav.classList.toggle('nav--scrolled', !entry.isIntersecting),
    { threshold: 0 }
  );
  observer.observe(sentinel);
}


/* ─── Inicialización principal ───────────────────────────────────────────── */

/**
 * Punto de entrada. Carga los componentes y arranca los comportamientos.
 * @param {object} [options] Opciones para sobreescribir COMPONENT_DEFAULTS
 */
async function initComponents(options = {}) {
  // Leer la ruta base desde el atributo data-base-path del body (útil en subdirectorios)
  const bodyBasePath = document.body.dataset.basePath;
  const defaults = bodyBasePath
    ? { ...COMPONENT_DEFAULTS, basePath: bodyBasePath }
    : COMPONENT_DEFAULTS;

  const cfg = { ...defaults, ...options };

  // Cargar header y footer en paralelo
  await Promise.all([
    loadComponent(cfg.headerSelector, `${cfg.basePath}${cfg.headerFile}`),
    loadComponent(cfg.footerSelector, `${cfg.basePath}${cfg.footerFile}`),
  ]);

  // Si estamos en un subdirectorio, ajustar rutas relativas de imágenes en el header
  if (cfg.basePath !== './') {
    document.querySelectorAll(`${cfg.headerSelector} img[src]`).forEach(img => {
      const src = img.getAttribute('src');
      if (src && !src.startsWith('http') && !src.startsWith('/') && !src.startsWith(cfg.basePath)) {
        img.setAttribute('src', cfg.basePath + src);
      }
    });
  }

  // Inicializar comportamientos que dependen de los componentes cargados
  initMobileNav();
  setActiveNavLink();
  initStickyNav();
  initSearch(cfg.basePath);
}

document.addEventListener('DOMContentLoaded', () => initComponents());


/* ─── Búsqueda interna ───────────────────────────────────────────────────── */

const PIPELINE_SEARCH_INDEX = [
  { title: 'Orbis Web',         desc: 'Plataforma central. Expedientes, facturación, VERI*FACTU, TicketBAI, SII, Ses Hospedajes.', url: 'productos/orbis-web.html',         tags: 'orbis web gestión expedientes clientes facturación emisión verifactu ticketbai sii ses hospedajes cumplimiento normativo' },
  { title: 'Orbis Booking',     desc: 'Sistema de reservas web para comercialización online.',                                      url: 'productos/orbis-booking.html',     tags: 'orbis booking reservas web online comercialización' },
  { title: 'Orbis Portal',      desc: 'Comercio electrónico B2B y B2C para agencias.',                                             url: 'productos/orbis-portal.html',      tags: 'orbis portal b2b b2c ecommerce venta online' },
  { title: 'Orbis Pay',         desc: 'Gestión de cobros mediante enlaces de pago seguros.',                                       url: 'productos/orbis-pay.html',         tags: 'orbis pay pagos cobros enlaces pago' },
  { title: 'Orbis Hoteles Pro', desc: 'Búsqueda y reserva profesional de hoteles, múltiples proveedores.',                         url: 'productos/orbis-hoteles-pro.html', tags: 'orbis hoteles pro hoteles búsqueda reserva proveedores producto propio' },
  { title: 'Orbis Corporate',   desc: 'Gestión de viajes corporativos. Reporting y automatización documental.',                    url: 'productos/orbis-corporate.html',   tags: 'orbis corporate corporativo tmc empresa viajes reporting' },
  { title: 'Productos',         desc: 'Todos los módulos Orbis para agencias de viajes.',                                          url: 'productos.html',                   tags: 'productos módulos orbis catálogo suite' },
  { title: 'Soluciones',        desc: 'Soluciones adaptadas a cada modelo de agencia.',                                            url: 'soluciones.html',                  tags: 'soluciones minorista grupo red corporativa tmc' },
  { title: 'Empresa',           desc: 'Pipeline Software. Especialistas en software para agencias desde 1989.',                    url: 'empresa.html',                     tags: 'empresa historia quiénes somos castellón 1989 pipeline' },
  { title: 'Solicitar demo',    desc: 'Solicitar una demostración de las soluciones Orbis.',                                       url: 'demo.html',                        tags: 'demo demostración solicitar contacto comercial' },
  { title: 'Contacto',          desc: 'Contactar con Pipeline Software en Castellón.',                                             url: 'contacto.html',                    tags: 'contacto teléfono email dirección castellón' },
  { title: 'Integraciones',     desc: 'Conexión con GDS Amadeus, Sabre y Galileo. BSP, IATA.',                                    url: 'integraciones.html',               tags: 'integraciones gds amadeus sabre galileo bsp iata' },
  { title: 'VERI*FACTU',        desc: 'Soporte a VERI*FACTU en Orbis Web. Cumplimiento fiscal.',                                   url: 'productos/orbis-web.html',         tags: 'verifactu veri factu facturación cumplimiento hacienda' },
  { title: 'TicketBAI',         desc: 'Cumplimiento TicketBAI en Orbis Web.',                                                      url: 'productos/orbis-web.html',         tags: 'ticketbai ticket bai euskadi país vasco navarra álava cumplimiento fiscal' },
  { title: 'SII',               desc: 'Suministro Inmediato de Información. Orbis SII.',                                           url: 'productos/orbis-web.html',         tags: 'sii suministro inmediato información iva hacienda' },
  { title: 'Ses Hospedajes',    desc: 'Comunicación de viajeros. Ses Hospedajes.',                                                 url: 'productos/orbis-web.html',         tags: 'ses hospedajes partes viajeros policía guardia civil comunicación' },
];

function initSearch(basePath) {
  if (document.getElementById('search-overlay')) return;

  const base = (basePath === './' || !basePath) ? '' : basePath;

  const overlay = document.createElement('div');
  overlay.id = 'search-overlay';
  overlay.className = 'search-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Búsqueda en Pipeline Software');
  overlay.innerHTML = `
    <div class="search-modal" role="search">
      <div class="search-input-wrap">
        <svg class="search-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18" aria-hidden="true">
          <circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          class="search-input"
          id="search-input"
          type="search"
          autocomplete="off"
          spellcheck="false"
          placeholder="Buscar productos, soluciones o contenidos…"
          aria-label="Buscar en Pipeline Software"
        >
        <button class="search-close-btn" id="search-close-btn" aria-label="Cerrar búsqueda" type="button">ESC</button>
      </div>
      <div class="search-results" id="search-results" role="listbox" aria-label="Resultados"></div>
      <p class="search-hint">↑↓ para navegar &nbsp;·&nbsp; Enter para abrir &nbsp;·&nbsp; ESC para cerrar</p>
    </div>`;
  document.body.appendChild(overlay);

  const input    = overlay.querySelector('#search-input');
  const results  = overlay.querySelector('#search-results');
  const closeBtn = overlay.querySelector('#search-close-btn');

  function resultHTML(item) {
    return `<a class="search-result-item" href="${base}${item.url}" role="option">
      <span class="search-result-title">${item.title}</span>
      <span class="search-result-desc">${item.desc}</span>
    </a>`;
  }

  function renderResults(query) {
    const q = query.trim().toLowerCase();
    const pool = q
      ? PIPELINE_SEARCH_INDEX.filter(item =>
          item.title.toLowerCase().includes(q) ||
          item.tags.toLowerCase().includes(q) ||
          item.desc.toLowerCase().includes(q))
      : PIPELINE_SEARCH_INDEX.slice(0, 8);
    results.innerHTML = pool.map(resultHTML).join('');
  }

  function openSearch() {
    overlay.classList.add('search-overlay--open');
    const btn = document.getElementById('nav-search-btn');
    if (btn) btn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    renderResults('');
    setTimeout(() => input.focus(), 50);
  }

  function closeSearch() {
    overlay.classList.remove('search-overlay--open');
    const btn = document.getElementById('nav-search-btn');
    if (btn) btn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    input.value = '';
    results.innerHTML = '';
  }

  input.addEventListener('input', () => renderResults(input.value));
  closeBtn.addEventListener('click', closeSearch);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeSearch(); });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('search-overlay--open')) closeSearch();
  });

  overlay.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    const items = [...results.querySelectorAll('.search-result-item')];
    if (!items.length) return;
    const idx = items.indexOf(document.activeElement);
    e.preventDefault();
    if (e.key === 'ArrowDown') (items[idx + 1] || items[0]).focus();
    else (items[idx - 1] || input).focus();
  });

  const searchBtn = document.getElementById('nav-search-btn');
  if (searchBtn) searchBtn.addEventListener('click', openSearch);
}
