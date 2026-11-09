# Rediseño visual premium — informe

Fecha: 2026-11-09 · Rama: `claude/remote-control-mz8xa5` (no publicada en producción)

## Qué se hizo
- **Sistema de diseño** en `assets/css/casa-tito.css`: paleta institucional (#173B70, #102947, #D62839, #F2C230), escala tipográfica (Manrope títulos, DM Sans textos), espaciado de base 4 px, radios, sombras, duraciones (200–350 ms en microinteracciones) y curvas de movimiento, todo en variables.
- **Introducción**: fondo azul oscuro, el logotipo original (`logo-casa-tito.png`, optimizado a WebP/JPG sin alterarlo) aparece con opacidad y escala sobre su placa blanca; un telón con filo rojo sube hacia la portada. ~2,2 s, una vez por sesión, con "Omitir intro".
- **Portada**: composición editorial asimétrica sobre azul oscuro con una grilla de plano muy sutil; título "Todo empieza con una buena elección." revelado línea por línea con máscara; la casita existente se reutiliza como pieza visual con su construcción acortada a ~2 s; banda inferior con el sello de 73 años, catálogo y WhatsApp.
- **Encabezado**: ahora usa el logotipo original (antes era una recreación en texto "CASA TITO"). Menú con subrayado animado y sección activa.
- **Secciones numeradas** (01 Destacados · 02 Catálogo · 03 Historia · 04 Contacto) con el mismo lenguaje de índice, título y nota.
- **Tarjetas**: categorías en azul (activas) y neutras (próximamente); productos con imagen sobre blanco, precio protagonista y botón azul. El rojo queda reservado a WhatsApp y a énfasis; el amarillo, a acentos puntuales.
- **Historia desde 1953**: "1953" monumental + línea de tiempo 1953 → 73 años → año actual, que se dibuja al entrar en pantalla.
- **Movimiento**: revelado al desplazarse con escalonado, imágenes que se asientan, parallax mínimo en CSS (sólo navegadores compatibles), ficha de producto con entrada suave. Sin scroll hijacking ni movimiento permanente. Respeta `prefers-reduced-motion`.

## Qué no se tocó
Productos, precios, códigos, categorías, enlaces y número de WhatsApp, correo, buscador, filtros, ficha, bandeja de consulta y mensaje armado para WhatsApp. Se verificó por comparación automática que `SITE_CONFIG`, `categories` y `products` son idénticos al original.

## Textos
No se inventaron datos. Los textos nuevos son reubicaciones de copy existente o rótulos de interfaz ("Omitir intro", "Nuestra historia", "Catálogo", "Consultas", "Generación tras generación"). **Para confirmar:** "Sucesores de Pablo Antonini" se tomó del propio logotipo y se usa como firma en la historia.

## Verificado (Chromium, escritorio 1440/1280/1024, tablet 820, móvil 390/360/320)
Sin errores de consola; sin desbordamiento horizontal; intro, omitir y no repetición en la sesión; ficha, variantes, sumar a consulta, bandeja y apertura de WhatsApp; buscador, filtros, tarjetas de categoría, carrusel, menú móvil, aviso superior; movimiento reducido; sin JavaScript (contenido visible).

## No verificado
Safari/iOS y Firefox reales (el parallax CSS no corre en Firefox: queda estático, a propósito). Dispositivos físicos. Rendimiento en red lenta real.

## Pendiente sugerido
- Optimizar las fotos de producto a WebP (hoy 4,1 MB en PNG); implica cambiar rutas en el catálogo, por eso no se hizo sin aprobación.
- Logo maestro vectorial para nitidez total en tamaños chicos.
