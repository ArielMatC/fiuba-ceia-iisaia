# Certificado Oficial de Paciencia

Esta pagina es una app web de broma construida como una parodia de la peor interfaz posible. Simula un tramite absurdo para obtener un "Certificado Oficial de Paciencia", con una UI deliberadamente frustrante: colores estridentes, botones que se mueven, validaciones ridiculas, un captcha falso, mensajes pasivo-administrativos y un modo de "mejorar interfaz" que en realidad la empeora.

La idea no es romper el navegador ni molestar de forma peligrosa, sino crear una experiencia incomoda y graciosa dentro de un archivo local seguro.

## Quien lo construyo

Fue construido por Ariel Cabello con ayuda de Codex, a partir de la consigna de generar una app web one-shot en HTML, CSS y JavaScript con la peor UI posible.

## Como abrirla

Abrir directamente desde un navegador web:

```text
index.html
```

No requiere instalacion, servidor, build step ni dependencias externas.

## Constraints

La app principal cumple estas constraints:

- Un solo archivo de app: `index.html`.
- CSS embebido dentro de `<style>`.
- JavaScript embebido dentro de `<script>`.
- Sin archivos CSS separados.
- Sin archivos JS separados.
- Sin build tools.
- Sin dependencias externas.
- Sin llamadas a red.
- Funciona abriendo el archivo directamente en el navegador.

## Que incluye

- Formulario absurdo de tramite.
- Campo de nombre "aproximado".
- Slider de edad invertida.
- Selector de pais que se reordena con hover.
- Password con reglas imposibles o contradictorias.
- Checkboxes que pueden desmarcarse solos.
- Captcha falso con cuadrados que "juzgan".
- Boton principal que cambia de texto y posicion.
- Modal de ayuda inutil.
- Modo "mejorar interfaz" que empeora la UI.
- Barra de progreso falsa que llega al 99%, falla y vuelve parcialmente.
- Mensajes de error comicos y no ofensivos.

## Prueba realizada

Se probo localmente con Chrome en modo headless cargando:

```text
file:///D:/ariel_D/UBA/IISAIA/index.html
```

Resultado de la carga inicial:

- El titulo de la pagina cargo como `Certificado Oficial de Paciencia`.
- El `h1` principal se renderizo correctamente.
- El mensaje inicial de aviso preventivo aparecio en pantalla.
- Se detecto 1 bloque `<style>` inline.
- Se detecto 1 bloque `<script>` inline.
- No se detectaron assets externos en `script[src]`, `link[rel="stylesheet"]` ni `img[src]`.

Resultado de la prueba interactiva:

- El modo "mejorar interfaz" activo correctamente la clase `worse-mode`.
- El boton de ayuda abrio el modal.
- El captcha falso permitio seleccionar 2 cuadrados.
- El envio del formulario ejecuto la secuencia falsa.
- La barra de progreso termino en `18%`, despues de pasar por el flujo absurdo.
- El estado final fue: `Puede reintentar con menos dignidad cuando el boton lo permita.`
- El boton principal termino con el texto `Reintentar con menos dignidad`.
- No hubo excepciones JavaScript durante la prueba.

## Que funciono

- La pagina funciona como archivo local autocontenido.
- La UI cumple el objetivo de ser intencionalmente mala, caotica y frustrante.
- Las interacciones principales responden: hover, clicks, modal, captcha, modo peor y submit falso.
- El formulario no transmite datos ni depende de servicios externos.
- La app mantiene la broma dentro de limites seguros: no usa popups infinitos, no bloquea el navegador y no recolecta datos reales.

## Que no funciono o quedo limitado

- La validacion del "canvas" se hizo por una alternativa local con Chrome headless y DevTools Protocol, no mediante control directo del browser embebido.
- No se hizo una prueba manual exhaustiva en mobile; el CSS tiene media queries, pero la validacion automatizada se concentro en carga e interacciones principales.
- El formulario siempre falla por diseño. Eso es intencional para la broma, no un bug funcional.
- Algunas decisiones de accesibilidad son deliberadamente malas a nivel UX, aunque se dejaron labels, `aria-live` y texto legible para no convertir la broma en una pagina inutilizable.

## Nota de diseño

La interfaz esta hecha para sentirse "mal hecha" sin que el codigo este roto. El desorden visual, las validaciones absurdas y los mensajes frustrantes son parte del objetivo del ejercicio.
