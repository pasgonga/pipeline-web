# Pipeline Software · Web Project Memory

## Estructura del proyecto
```
web/
├── index.html                  ← Página principal (home)
├── pipeline_home.html          ← Archivo original (archivo/referencia)
├── assets/
│   ├── css/main.css            ← Todos los estilos (organizados en 20 secciones)
│   └── js/components.js        ← Loader de header/footer + interactividad
└── components/
    ├── header.html             ← Nav reutilizable (skip link, hamburger, aria)
    └── footer.html             ← Footer reutilizable (4 columnas)
```

## Cómo añadir una nueva página
1. Crear `nueva-pagina.html` en la raíz
2. Estructura mínima:
   ```html
   <!DOCTYPE html>
   <html lang="es">
   <head>
     <meta charset="UTF-8">
     <meta name="viewport" content="width=device-width, initial-scale=1.0">
     <link rel="stylesheet" href="assets/css/main.css">
     <title>Título · Pipeline Software</title>
   </head>
   <body>
     <div id="header-root"></div>
     <main id="main-content">
       <!-- contenido -->
     </main>
     <div id="footer-root"></div>
     <script src="assets/js/components.js"></script>
   </body>
   </html>
   ```
3. Actualizar los `href` en `components/header.html` si hay nueva sección de nav

## Tokens de diseño (variables CSS en :root)
- `--blue: #3559DB` — Azul corporativo
- `--yellow: #FDCA44` — Acento amarillo
- `--dark: #0F1630` — Fondo oscuro principal
- `--muted: #8a9bbf` — Texto apagado (fondos oscuros)
- `--light-bg: #f5f7fc` — Fondo secciones claras
- `--max-width: 1140px` — Ancho máximo del contenido

## Decisiones técnicas
- **Componentización**: fetch() en JS (requiere servidor local para desarrollo)
- **Servidor local**: `npx serve .` o VS Code Live Server
- **Sin frameworks**: HTML/CSS/JS vanilla puro
- **Responsive**: breakpoints 900px (tablet) y 560px (móvil)

## Correcciones WCAG AA aplicadas
- footer-col a: `#4a5a7a` → `#8a9bbf` (ratio ~6:1)
- footer-bottom p: `#2a3450` → `#7a8fae` (ratio ~5.8:1)
- footer-brand p: `#3a4a6a` → `#8a9bbf`
- footer-col h6: `#3a4a6a` → `#5a7aaa`

## Preferencias del usuario
- Quiere que todo esté bien documentado y sea fácil de modificar
- Enfoque senior developer: buenas prácticas, accesibilidad, escalabilidad
- Idioma del proyecto: español (España)
