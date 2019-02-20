# Oppgave 1: Intro til WebGL og `three.js`

Du skal lage en snurrende kube. Den ultimate introen til WebGL og three.js

### Komme i gang

Du har fått utdelt noe kode i prosjektet.

```sh
3d-visualization-workshop/
├── electives/                  # Ekstra valgfrie oppgaver
├── slides/                     # Slides som har blitt vist frem
├── solutions/                  # Fasiten på de ulike oppgavene
├── src/                        # Her skal all kildekoden vi skriver være
|   ├── fragmentshader.glsl     # (Brukes i oppgave 3)
|   ├── index.html              # HTML-fila som kjører koden vår
|   ├── index.js                # JS-fila som blir kjørt
|   └── vertexshader.glsl       # (Brukes i oppgave 3)
├── tasks/                      # Oppgavetekstene, inkludert den du leser nå
├── README.md                   # Readme for hele workshopen
├── package-lock.json           # Oversikt over versjonsnummere, etc
└── package.json                # Avhengigheter, etc
```

For å sparke i gang utviklingsprosessen, gjør følgende i en terminal i rotmappen til prosjektet:

```sh
npm install
npm start
```

Så åpner du `http://localhost:9966` i din utvalgte nettleser.

Du skal da kunne se teksten `Velkommen til kurs!` på skjermen.

### Skrive kode

All kode kan skrives i `index.js`-fila du finner i `src`. Prosessen du startet i sted vil sørge for at nettleseren blir oppdatert med nyeste kode når du lagrer den fila.

For å holde oppsettet så enkelt som mulig, har vi droppet å dra inn rammeverk som React eller Vue, så her er det bare å kjøre på med helt vanlig moderne JavaScript.

I `index.js`-fila er det laget en veldig enkel boilerplate:

```js
// Henter inn three.js
const THREE = require("three");

function init() {
  // Her kan du putte kode som bare skal gjøres én gang
}

function render() {
  // sørger for å køe et nytt kall til render
  requestAnimationFrame(render);

  // Her kan du putte kode som skal gjøres hver "frame",
  // som feks renderer.render();
  // eller box.position.x += 10
}

// Kall init-koden
init();
// Spark i gang render-loopen
render();
```

Hvordan du strukturerer koden videre er opp til deg, dette er kun ment som forslag. I oppgaveteksten under vil det stå korte kodesnutter for å illustrere hvordan API-et til three.js funker, hvor du velger å kalle de funksjonene og legge variabel-deklarasjoner er opp til deg selv. Det kan være greit å huske på hvordan scoping fungerer i JavaScript hvis du ønsker å benytte en variabel i flere funksjoner. Vi er glade i globale variabler for så små prosjekter som vi skal lage i dette kurset.

### Lage `three.js` renderer, scene og kamera

De første tingene du må lage for å komme i gang med `three.js` er:

- en renderer til å tegne ting på skjermen
- en scene som kan holde på elementene du vil tegne
- et kamera som styrer hva du "ser" i scena.

For å lage en renderer bruker du [`WebGLRenderer`](https://threejs.org/docs/index.html#api/renderers/WebGLRenderer) fra `three.js`. Hvis du ikke sender inn noen parametre til den vil den automatisk opprette et `canvas`-element for deg, som vil fungere som kontekst for WebGL-visualiseringen din.

```js
let renderer;
renderer = new THREE.WebGLRenderer();
```

Du kan også sette høyde og bredde på renderen. En veldig vanlig ting å gjøre her er å sette høyde og bredde til størrelsen på browservinduet.

```js
const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;
renderer.setSize(WIDTH, HEIGHT);
```

Renderen oppretter som sagt et `canvas`-element for deg, hvis du ønsker å se noe som helst må du legge til det elementet på nettsiden.

```js
document.body.appendChild(renderer.domElement);
```

Men for at renderen skal kunne rendre noe må den ha en scene og et kamera.

En [`Scene`](https://threejs.org/docs/index.html#api/scenes/Scene) er en gruppering av objekter som visualiseringen din består av. Å initiere en scene kan du gjøre på denne måten:

```js
let scene;

scene = new THREE.Scene();
```

Senere kommer vil også til å legge til objekter i scenen, men dette holder for nå.

Vi trenger også et kamera til å beskue scenen. Det finnes mange ulike kamera som har ulike egenskaper, men for vårt formål passer et [`PerspectiveCamera`](https://threejs.org/docs/index.html#api/cameras/PerspectiveCamera) utmerket. Det er laget for å ligne måten vi mennesker ser ting og det har forholdsvis enkle egenskaper.

```js
let camera;

camera = new THREE.PerspectiveCamera(fov, WIDTH / HEIGHT, near, far);
```

`PerspectiveCamera` tar fire argumenter:

1.  Field of View. Hvor mange grader er synsfeltet til kameraet?
2.  Aspect Ratio. Hva er forholdet mellom høyde og bredde?
3.  Near. Hvor nærme må noe være for å være nærme? Dette påvirker synligheten til objekter.
4.  Far. Hvor langt unna må noe være for å være langt unna? Dette påvirker også synligheten til objekter.

`fov` er gjerne en verdi mellom 0 og 90 grader. For vårt formål er en verdi mellom 45 og 70 godt egna. I motsetning til de fleste andre vinkelmål er denne altså i grader, men det er ellers vanlig med radianer.

`near` og `far` styrer hvilke objekter kameraet ser. For vårt formål er `0.01` og `1000` egna verdier. Da vil objekter som befinner seg mellom `0.01` og `1000` i koordinatsystemet være synlige.

Nå som vi har både en scene og et kamera kan vi be rendereren om å tegne ting

```js
renderer.render(scene, camera);
```

Det er fortsatt ikke stort å se, for vi har ingen objekter i scenen. Men hvis du får en svart skjerm og ingen feilmeldinger i loggen er sannsynligheten stor for at ting er OK.

### Hello Cube!

Vår første oppgave er å få en cube til å vises på skjermen. For å få til det trenger vi å lage en cube. En cube er et objekt, og de fleste objekter i `three.js` består av en geometri og et materiale. Geometrien avgjør formen på objektet og materiale avgjør utseende.

Den enkleste objekttypen er noe som kalles [`Mesh`](https://threejs.org/docs/index.html#api/objects/Mesh) som består av en masse trekanter, som vi vet WebGL er veldig glad i. Det er denne objekttypen vi vil bruke til å lage cuben vår.

Som nevnt trenger vi også en geometri, `three.js` har en hendig metode klar til bruk som heter [`BoxGeometry`](https://threejs.org/docs/#api/geometries/BoxGeometry). Den metoden tar inn tre verdier (høyde, bredde og dybde) og gir oss tilbake en geometri som representerer en boks (eller en cube) med de samme verdiene. Her er det bare å leke seg med verdiene og se på effekten.

```js
let geometry = new THREE.BoxGeometry(1, 1, 1);
```

Vi trenger også et materiale. `three.js` kommer med mange ulike materialer ut av boksen, men et veldig enkelt materiale som lar oss se full 3D-effekt er [`MeshNormalMaterial`](https://threejs.org/docs/#api/materials/MeshNormalMaterial). Det fargelegger geometrien basert på hvilken vei normal-vektoren peker.

```js
let material = new THREE.MeshNormalMaterial();
```

Nå kan vi kombinere de tre tingene og lage en ferdig kube

```js
function makeCube(height, width, depth) {
  let geometry = new THREE.BoxGeometry(height, width, depth);
  let material = new THREE.MeshNormalMaterial();
  return new THREE.Mesh(geometry, material);
}
```

For at kuben skal vises i visualiseringen vår må vi legge den til scena

```js
scene.add(cube);
```

Men du ser antageligvis ingenting! Det er fordi kameraet vårt for øyeblikket befinner seg på akkurat samme posisjon som kuben. Og er dermed inni den! Hvis vi flytter kameraet et stykke bakover, vil ting bli synlig.

```js
camera.position.z = 5;
```

Det var kanskje litt uimponerende, kuben ser helt flat ut. Men det kan vi fikse på ved å rotere kuben litt.

### Rotere kuben

Alle objekter i `three.js` har noen attributter som styrer hvor de befinner seg, hvor store de er og hvilken vei de er rotert. Vi har allerede sett et eksempel på dette når vi endret posisjonen til kameraet for å se kuben.

For å endre på hvilken vei kuben vår er rotert kan vi sette noen verdier på rotasjonen til kuben.

```js
cube.rotation.x = 1;
cube.rotation.y = 0.5;
cube.rotation.z = 1.25;
```

Da vil du kunne se at kuben har distinkte sider og faktisk er et 3D-objekt!

Men vi kan ta dette et steg videre og la kuben spinne av seg selv. For å få til det må vi endre rotasjonen litt hver frame og be rendereren om å tegne ting på nytt.

```js
const SPEED = 0.01;

function rotateCube() {
  cube.rotation.x -= SPEED;
  cube.rotation.y -= SPEED;
  cube.rotation.z -= SPEED;
}
```

Denne funksjonen kan du kalle inne i den funksjonen som blir kalt hver frame (hvis du har beholdt boilerplaten så heter den `render`), sammen med et nytt kall til rendererens render-metode:

```js
renderer.render(scene, camera);
```

Gratulerer, du har nå en snurrende kube!

Lek deg litt med de ulike verdiene og se hva som skjer med kuben. Noen forslag fra vår side:

- Gi kuben ulik rotasjonshastighet i de ulike retningene
- Endre størrelsen på kubens geometri
- Endre på attributtene til kameraet (near, far, where ever you are 🎶)
- Endre på posisjonen til kameraet.
