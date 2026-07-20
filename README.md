# 포코레아노 POKOREANO

Juego estilo Pokémon para aprender coreano. Overworld caminable, batallas de vocabulario,
gimnasios-examen, medallas y cajas estilo CS/LoL con skins.

## Jugar

Sirve la carpeta con cualquier servidor estático y abre `index.html`:

```
npx http-server -p 8123 .
```

(Abrir el archivo directamente con doble clic también funciona en la mayoría de navegadores.)

## Guardianes (수호신)

12 criaturas del folclore coreano viven en los **arbustos** de cada bioma (pradera,
bosque, costa) y en las **rocas de la cueva**. Al pisar uno puede aparecer un guardián:
responde una racha de preguntas sin fallar para capturarlo (las rarezas altas exigen
racha más larga). Arma tu **equipo de 3** en el menú Guardianes — cada uno da una
habilidad en los exámenes de gimnasio (eliminar opciones, saltar pregunta, escudo,
reintento…), con **doble uso si su tipo coincide con el gimnasio** (afinidad) y usos
extra al **evolucionar** (nivel 5, ganando XP con tus respuestas correctas).

El Gimnasio Maestro está escondido dentro de la **cueva** del bosque (noreste).

## Modo historia

El **pueblo 마을** (puerta oeste del mapa) tiene ahora una plaza con fuente y varios
edificios que puedes visitar:
- **시청 Alcaldía** — la alcaldesa te da las misiones.
- **카페 Café** — un menú de comida: identifica el plato coreano y ganas monedas.
- **학원 Academia** — clase de repaso de 5 preguntas (repasa tu vocabulario, ganas XP).

También tienes la **집 Casa de Karol** en la pradera noroeste del mapa: es tu base, con
un gato y un punto de guardado 💾.

La **alcaldesa** (alcaldía 시청, en el pueblo 마을 tras la puerta oeste) te da las misiones
de cada capítulo: hablar con personajes, vencer palabras, capturar guardianes y pescar
en el **muelle** de la playa. Cada capítulo desbloquea un gimnasio, que además exige un
**nivel mínimo de estudiante** (⭐ ganas XP con cada respuesta correcta). La misión actual
se ve siempre en el banner del mapa.

## Tienda y mascotas

La **tienda 상점** está junto al cruce de caminos: entra por la puerta y habla con el
tendero. Con monedas puedes comprar **mascotas** (병아리 pollito, 토끼 conejo, 고양이 gato,
강아지 perrito) que te siguen por el mapa, o una **caja de skins** (200 monedas).
En la **Mochila** gestionas mascotas, skins y ves tus medallas.

## Controles

- **Flechas / WASD** — caminar (D-pad táctil en móvil)
- **Hierba alta** — encuentros con palabras salvajes
- **Casas** — gimnasios (exámenes). Se desbloquean en orden ganando medallas.
- **NPCs** (con burbuja "…") — camina hacia ellos para hablar: frases en coreano
  con romanización y subtítulo en español, leídas en voz alta (TTS). Avanza con
  espacio/clic, cierra con Esc.
- Cada medalla abre una **caja** con skins por rareza (común → mítico). La skin
  activa también recolorea a tu personaje en el mapa.

## Animaciones de Karol

Karol tiene animaciones propias (hechas en Spriterrific, en `assets/spriterrific-karol/`):
- **Caminar** animado (8 frames) al moverse a los lados.
- **Correr**: mantén **Shift** mientras caminas — más veloz y con su animación de carrera.
- **En batalla**: al acertar hace su animación de **ataque**; al fallar, la de **daño**.

## Práctica de pronunciación 🎤

En el **Vocabudex**, cada palabra descubierta tiene un botón **🎤 Pronunciar**: di la
palabra al micrófono y el juego la compara con el coreano real (reconocimiento de voz
del navegador, `ko-KR`). Si la pronuncias bien: +2 XP. Requisitos: **Chrome o Edge**,
conexión a internet y dar permiso de micrófono la primera vez.

La voz también está integrada en el juego:
- **Batallas**: botón *🎤 ¡Grítala!* — pronuncia la palabra salvaje y haces un
  **golpe crítico x2** (fallar el grito no penaliza).
- **Gimnasios**: cuando la respuesta correcta es coreana, aparece
  *🎤 Responder con la voz* — pronúnciala en vez de tocarla (+1 XP extra).
- **노래방 Norebang** (karaoke, en el pueblo): la DJ te pone 3 frases coreanas;
  escúchalas y repítelas al micrófono. Cada frase acertada da XP y monedas.
  El **capítulo 7** de la historia incluye tu *Debut en el norebang* (sin micrófono,
  la DJ te deja "tararear" para no bloquear la historia).
- **Duelo de pronunciación**: Rina (리나), tu rival, espera junto al norebang del
  pueblo. Pantalla de duelo cara a cara (tú VS Rina) con marcador por rondas:
  3 palabras por turnos, tú las pronuncias al micrófono y ella responde.
  Ganarle da +40 monedas y +5 XP.

## Importar vocabulario de tus libros

Menú → *Importar vocab (CSV)*. Formato una línea por palabra:

```
안녕,annyeong,hola
고양이,goyangi,gato
```

Se guarda en localStorage y entra al pool de encuentros.

## Guardar tu progreso

El juego **auto-guarda** en el navegador (localStorage) cada 30 segundos, al cerrar la
pestaña y en cada evento importante. Además, en el menú **🧪** tienes:

- **⬇ Exportar partida**: descarga un archivo `.json` con todo tu progreso
  (respaldo, o para llevarlo a otra PC/navegador).
- **⬆ Importar partida**: restaura ese archivo.
- **☁ Nube (Supabase)**: sube/baja tu partida con un código propio, desde cualquier
  dispositivo. Para activarla (gratis, ~5 min):
  1. Crea un proyecto en [supabase.com](https://supabase.com).
  2. En *SQL Editor* ejecuta:
     ```sql
     create table saves (
       code text primary key,
       data jsonb not null,
       updated_at timestamptz default now()
     );
     alter table saves enable row level security;
     create policy "lectura publica" on saves for select using (true);
     create policy "escritura publica" on saves for insert with check (true);
     create policy "actualizacion publica" on saves for update using (true);
     ```
  3. Copia la **URL** del proyecto y la **anon key** (Settings → API) y crea
     `js/cloud-config.js`:
     ```js
     const CLOUD_CONFIG = {
       url: "https://TU-PROYECTO.supabase.co",
       key: "TU_ANON_KEY",
     };
     ```
     (Ese archivo está en `.gitignore`: tus claves no se suben a GitHub.)
  4. Recarga el juego: los botones ☁ ya funcionan. Elige un código difícil de
     adivinar (cualquiera con tu código puede leer/escribir esa partida).

## Jugar en línea (GitHub Pages)

El juego está publicado en:

**https://hernanfernandez1.github.io/pokoreano/**

Cada `git push` a `master` actualiza la página automáticamente (tarda ~1 minuto).
El guardado es por navegador (localStorage): usa **Exportar/Importar partida** o la
nube Supabase para llevar tu progreso entre la versión local y la de la página.

**⚠️ Licencia de assets**: el repo es público y contiene los assets de Cute Fantasy
(versión gratuita), cuya licencia **no permite redistribución**. Para estar en regla,
compra la licencia del pack en [itch.io](https://kenmi-art.itch.io/cute-fantasy-rpg)
o reemplaza esos assets por otros libres.

## Créditos de assets

- **Terreno, casas, árboles, animales y decoración**: [Cute Fantasy](https://kenmi-art.itch.io/cute-fantasy-rpg)
  de **Kenmi** — versión gratuita, **solo uso no comercial**, no redistribuir. En `assets/gfx/cute/`.


- **Tiles del overworld y personaje**: ["Zelda-like tilesets and sprites"](https://opengameart.org/content/zelda-like-tilesets-and-sprites)
  por ArMM1998 — **CC0 (dominio público)**. En `assets/gfx/`.
- **Sprites de batalla, medallas y skins**: pixel-art SVG propio generado por código (`js/sprites.js`).

### ¿Quieres el estilo "Pocket Creature Tamer"?

El pack de la referencia es [Pocket Creature Tamer Adventure Kit de Josee](https://n3cloud.itch.io/pocket-creature-tamer-adventure-kit-16-x16-rpg-asset-pack)
(gratis para uso **no comercial**; licencia premium $6.99 para comercial). itch.io requiere
descarga manual con cuenta:

1. Descarga el pack desde itch.io.
2. Copia su tileset y personaje sobre `assets/gfx/Overworld.png` y `assets/gfx/character.png`
   (o ajusta las coordenadas de tiles en `js/world.js`, constante `T`).
