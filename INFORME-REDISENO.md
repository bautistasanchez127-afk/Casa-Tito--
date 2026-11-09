# Rediseño visual premium · v3 — informe

Fecha: 2026-11-09 · Rama: `claude/remote-control-mz8xa5` (no publicada en producción)
Base: maqueta «Tienda completa · escritorio» + rediseño anterior (v1) + catálogo vigente.

## v3 · El lienzo como fuente principal
El usuario indicó que el lienzo de diseño **«Casa Tito Premium Cinematográfico»** (claude.ai, tableros «Tienda completa · escritorio», «· celular», «Entrada cinematográfica», «Storyboard» y «Sistema visual y estados») es el que más le gustó, y pidió tomarlo como la fuente más fuerte. Sus tableros `Main` e `IntroCinema` son idénticos a los del zip; además trae el sistema visual y el storyboard de la entrada.

Cambios de la v3 respecto de la v2, para seguir el lienzo con fidelidad:
- **Escena anclada de la portada**, portada desde la lógica del lienzo a JS simple (`transform`/`opacity`, `requestAnimationFrame`). Mientras se baja:
  - la banda azul sube desde el 79 % hasta el 45 % de la pantalla;
  - el sello se desvanece y la góndola se achica y se corre;
  - la tira de destacados entra de costado y «DESDE 1953» cruza detrás de la góndola;
  - aparecen el contador «01 de 05 · Producto destacado» y la barra de progreso;
  - los títulos se revelan con un barrido blanco → rojo.
  
  Lo mueve el scroll nativo, sin frenarlo ni secuestrarlo. Con teclado, enfocar una tarjeta lleva la página hasta mostrarla. En el celular no se remide cuando la barra del navegador cambia el alto.
- **Sin escena** (movimiento reducido o pantallas muy bajas o altas): sello, góndola y banda con carrusel nativo y flechas.
- **Medidas y texturas del lienzo**: encabezado de 68 px (58 en el celular), góndola apoyada sobre el filo rojo de la banda, puntos claros del tablero en la banda, las categorías y la historia, y fondo de puntos oscuros en la presentación. Las tarjetas no se elevan al pasar el cursor; sólo cambian borde y sombra. Contacto en azul oscuro con énfasis rojo. Botón rojo en las tarjetas de destacados.
- **Presentación según el storyboard**: herramientas en metal (rojo y acero) sobre el tablero, foco de luz, logotipo y sello, y la casa que se abre con un borde de luz.

Se mantuvieron dos excepciones al lienzo porque el brief las marca como innegociables:
1. **El logotipo original** en lugar del texto «CASA TITO».
2. **La paleta institucional** (#173B70, #102947, #D62839, #F2C230) en lugar de los tonos del lienzo (#173657, #102943, #B52B32). Están centralizados en `:root` de `assets/css/casa-tito.css`: pasar a los tonos del lienzo es cambiar esas variables.

Del sistema visual del lienzo no se publicó el «molde de oferta» con [PRECIO] y [FECHA A CONFIRMAR], porque no hay datos confirmados de ofertas. Tampoco se muestran categorías que no existen en los datos (Plomería, Sanitarios), como indica el propio lienzo.

## Dirección de arte
El motivo material es el **tablero perforado de ferretería**. Aparece en la presentación, la banda de destacados, las categorías y la historia. Une todo en un mismo sistema sin caer en una plantilla genérica. El azul manda; el rojo aparece en los filos, en WhatsApp y en los énfasis; el amarillo queda como acento (sello, punto «Próximamente», año actual).

## De la maqueta se tomó
- Portada blanca con el sello «Casa Tito · 73 años · Desde 1953», el título «Todo empieza con una buena elección.», un buscador y una **góndola con fotos reales** de producto sobre un estante azul con filo rojo. Detrás, «DESDE 1953» en tipografía gigante.
- Banda oscura de **Productos destacados** con filo rojo y tarjetas editoriales separadas por líneas finas.
- **3 categorías grandes** con collage de fotos reales y la cantidad de productos; las 5 restantes como recuadros «Próximamente».
- Tarjetas de catálogo con etiqueta de marca, **botón directo de WhatsApp** y botón «Elegir presentación / Ver producto» con flecha.
- Barra de búsqueda y filtros fija al desplazarse, y un fundido breve al cambiar de categoría.
- Ficha de producto con fondo de chapa clara, que en el celular se abre como hoja inferior.
- Pie con «Ver la presentación otra vez».
- De la presentación, el concepto: tablero en penumbra, herramientas, foco de luz y apertura con forma de casa.

## Qué se corrigió de la maqueta
- El logotipo estaba **recreado en texto** («CASA TITO» con techo). Ahora se usa siempre el **logotipo original** (`logo-casa-tito.png`, optimizado a WebP/JPG sin alterarlo) en la presentación, el encabezado y el pie.
- Se reemplazó la paleta anterior (#173657 / #b52b32) por la institucional (#173B70 / #102947 / #D62839 / #F2C230).
- La presentación usaba **WebGL**. Se rehízo en CSS liviano (tablero, foco, herramientas en SVG y apertura con `clip-path`), sin bibliotecas.
- (v2) La escena anclada se había simplificado. En la v3 se recuperó tal como la propone el lienzo, siempre con scroll nativo.
- Se sacaron React y el runtime de la herramienta de diseño. El sitio sigue siendo HTML + CSS + JS simple, y los productos se editan igual que antes en `index.html`.

## Del rediseño v1 se conservó
- La historia con la **casita iluminada**, que ahora se construye al entrar en pantalla, sobre un panel de tablero, junto a la **línea de tiempo** 1953 → 73 años → año actual.
- El sistema de variables, el revelado al desplazarse, el menú con sección activa y el respeto por el movimiento reducido.

## Presentación (≈2,2 s)
Tablero en penumbra → el foco cruza hacia el centro y se dejan ver las herramientas → aparece el logotipo original sobre su placa → entra el sello «73 años · Desde 1953» → la escena **se abre con forma de casa** y deja ver la portada, cuyos elementos entran escalonados.
- Se ve una vez por sesión. Se puede omitir con el botón, una tecla, la rueda o un toque, y repetir desde el pie.
- No aparece con movimiento reducido, sin JavaScript ni al entrar a una sección (#catalogo).

## Qué no se tocó
Productos, precios, códigos, categorías, número y enlaces de WhatsApp, correo, buscador, filtros, ficha, bandeja de consulta y mensaje de WhatsApp. Se verificó automáticamente que `SITE_CONFIG`, `categories` y `products` son idénticos al original. El botón directo de WhatsApp de cada tarjeta usa el mismo número y el mismo formato de mensaje que la ficha.

## Textos
No se inventaron datos. «Sucesores de Pablo Antonini» sale del propio logotipo y se aprobó para usarlo como firma en la historia.

## Verificado (Chromium; escritorio 1920/1440/1280/1024, tablet 820, móvil 390/360/320)
- Sin errores de consola y sin desbordamiento horizontal.
- La presentación completa con apertura en forma de casa; omitir, no repetirla en la sesión y volver a verla desde el pie.
- El buscador de la portada sincronizado con el del catálogo.
- Filtros (`aria-pressed`), tarjetas de categoría, carrusel de destacados y WhatsApp directo con el mensaje correcto.
- Ficha con presentaciones, «Sumar a mi consulta», bandeja y apertura de WhatsApp.
- La casita que se construye al llegar, el menú activo, el menú móvil y la ficha como hoja inferior en el celular.
- Con movimiento reducido no hay presentación y todo se ve quieto; sin JavaScript se ven la portada y los encabezados, junto con el aviso del catálogo que ya existía.

## No verificado
- Safari/iOS y Firefox reales. Los efectos que dependen del scroll en CSS (portada que se aleja, «DESDE 1953» que se desliza) no corren en Firefox: queda estático, a propósito. La apertura en forma de casa necesita `@property`; sin soporte, se abre de golpe.
- Dispositivos físicos y red lenta real.

## Pendiente sugerido
- Optimizar las fotos de producto a WebP (4,1 MB en PNG). Implica cambiar rutas del catálogo.
- Logo maestro vectorial.
