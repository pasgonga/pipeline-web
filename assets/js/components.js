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

  // Inicializar comportamientos que dependen de los componentes cargados
  initMobileNav();
  setActiveNavLink();
  initStickyNav();
}

document.addEventListener('DOMContentLoaded', () => initComponents());
