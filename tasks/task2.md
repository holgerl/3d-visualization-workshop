## Oppgave 2: Dancing cubes!

Du skal gjøre om din snurrende kube til et ensemble av dansende kuber!

### Før du starter

Hvis du ikke kom helt i mål med forrige oppgave kan du starte ferskt ved å kopiere fasiten som du finner i `solutions/task1/index.js`. Du kan også ta en titt på fasiten ved å kjøre:

```sh
npm run solution:1
```

### OrbitControls

Det første vi skal gjøre er å bruke et kjekt triks fra `three.js` som gjør det litt enklere å jobbe med 3D-kode. [`OrbitControls`](https://threejs.org/docs/index.html#examples/controls/OrbitControls) er en tilleggsmodul til `three.js` som gir oss et kamera som kan kontrolleres med mus. Da kan vi zoome og bevege oss rundt i scena litt som vi vil. Kjekt hvis du feks "mister" et objekt et sted 😅

For å bruke `OrbitControls` må vi først laste inn modulen det ligger i. Det gjør vi på følgende måte:

```js
const OrbitControlsModule = require("three-orbit-controls");
const OrbitControls = OrbitControlsModule(THREE);
```

Legg spesielt merke til at vi sender inn `THREE` som et argument til modulen for å få en konstruktør som er bundet til den samme instansen av `THREE` vi bruker til resten av koden.

Når vi har en `OrbitControls`-konstruktør kan vi koble den til kameraet vårt for å koble på mus-navigasjon.

```js
let controls;

controls = new OrbitControls(camera);
```

Nå kan du bevege deg fritt rundt i scena du har laga.

### Multiplisere kubene

For å lage et ensemble av dansende kuber trenger vi fler kuber enn vi har til nå.

Det er ikke noe hokus-pokus i `three.js` for å gjøre dette, bare god gammeldags JavaScript. Dette er koden som ble brukt i oppgave 1 for å lage en kube:

```js
function makeCube(width, height, depth) {
  let geometry = new THREE.BoxGeometry(width, height, depth);
  let material = new THREE.MeshNormalMaterial();
  return new THREE.Mesh(geometry, material);
}
```

Det du må gjøre er å repetere dette så mange ganger du har lyst til. Om du foretrekker `for`-løkker eller `forEach`/`map` er opp til deg selv. Men det vil være en fordel å kunne refere til hver enkelt kube i stegene som kommer etterpå, så lagre alle kubene du lager i en liste 👍

Du kan prøve å skrive om koden som du laga for å rotere kuben i oppgave 1 til å rotere alle kubene du nå har laga.

### Posisjonering av kuber

Litt avhengig av hvordan du gjorde det forrige steget vil kubene havne litt rundt omkring eller kanskje rett oppå hverandre hvis alle fikk samme posisjon.

Nå må du finne en formel for hvordan du ønsker å plassere kubene dine. Du kan plassere hver av dem manuelt hvis du ønsker, men da blir det fort komplisert å endre på hvor mange kuber du har.

Vårt forslag til deg er å lage en funksjon som lar deg beregne posisjonen til en kube gitt nummeret i rekken av kuber og utgangsposisjonen.

```js
const startPosition = -10;
const distanceBetween = 1.25;

// hvor cubeNumber er 1, 2, 3, osv for hver kube
const position = startPosition + cubeNumber * distanceBetween;

cube.position.x = position;
```

Her kan du velge å holde det enkelt og kun posisjonere kuber langs en av aksene (feks X-aksen), men det er fritt frem å være litt kreativ her. Det viktigste er at du får sett alle kubene.

Her kan det også være en god ide å endre utgangsposisjonen til kameraet, f.eks. ved å flytte det enda litt lengre ut:

```js
camera.position.z = 40;
```

Da vil du se en større del av scena du har laga og forhåpentligvis alle kubene dine.

### Koble på lyd

Det er nå det morsomme starter, koble på input for å endre på ting 🎶 Vi har laga en ferdig liten modul til deg som du kan bruke for å hente input fra mikrofonen på laptopen din:

```js
const initAnalyser = require("../solutions/task2/soundanalyser.js");
```

Den modulen kan du bruke på denne måten:

```js
init(); // Kaller init-funksjonen din som vanlig for å sette opp ting

let analyser; // Ta vare på en referanse til analyseren

// Sett opp analyseren med et callback
initAnalyser(function(a) {
  // Når analyse-funksjonen har kobla seg til mikrofonen
  // vil denne koden bli kjørt

  // Da får du en referanse til analyseren, som du bør ta vare på
  analyser = a;

  // Så kan du kalle render-funksjonen din
  // som kicker i gang render-loopen som før
  render();
});
```

> Hvis du lurer på hvordan den modulen ser ut kan du scrolle litt lengre ned, der finner du en kommentert utgave av kildekoden.

Analyser-objektet du får tilbake fra `initAnalyser`-funksjonen har en kjekk metode som heter `analyser.frequencies()`. Den gir deg en liste av decibel-verdier for de ulike frekvensene mikrofonen plukker opp. Frekvensene blir regnet ut med en Fast Fourier Transform (FFT), som i dette tilfellet vil gi deg tilbake en liste med `32` decibel-verdier som representerer alle frekvensene.

I tillegg kan du også lese ut max og min verdien til decibelene mikrofonen plukker opp. De finner du slik:

```js
const maxDecibels = analyser.analyser.maxDecibels;
const minDecibels = analyser.analyser.minDecibels;
```

> Her er det en del rariteter mellom datamaskiner. Hvis du får veldig rar oppførsel med verdiene over kan det lønne seg å bytte dem ut med 0 og 255.

De verdiene er kjekke å ha for å kunne normalisere decibel-verdien til en frekvens. Normalisering er navnet på å regne om en gitt nummer range til en `[0,1]` range.

```js
function normalise(min, max, value) {
  return (value - min) / max;
}
```

Denne funksjonen gir deg tilbake et tall mellom `0` og `1` som svarer til hvor nærme min (nærmere 0) eller max (nærmere 1) value er. Dette er nyttig for å begrense verdiene du jobber med til noe som er innenfor en bestemt range.

Nå som du har noen tall som svarer til hvor mange decibel av en gitt frekvens mikrofonen din har plukket opp kan vi koble disse til kubene vi har laga.

Vi bytter ut koden som snurrer på kubene med noe som heller skalerer kubene etter hvor mye lyd som blir plukka opp.

```js
let frequencies = analyser.frequencies();

function scaleCube(cube, cubeNumber) {
  let frequency = frequencies[cubeNumber];
  let scaleFactor = normalise(minDecibels, maxDecibels, frequency);

  cube.scale.y = scaleFactor;
}
```

Dette vil skalere kuben din i y-retning med en `scaleFactor` som er mellom `0` og `1`. Her er det bare å leke seg 🤹‍♂️

Hvis du har gjort ting riktig vil du nå se at kubene dine danser i takt med det mikrofonen din plukker opp. Gratulerer, du har nå en fiks ferdig musikk visualisering 👍

> Hvis du ikke får mikrofonen til å plukke opp noe, sjekk at du er på `localhost:9966` og ikke IP-en til datamaskinen din. `localhost` er fritatt for en del av sikkerhetsmekanismene til nettleseren.

Noen forslag til ting du kan endre på og leke med:

- Skalere kuben i ulike retninger med ulike verdier
- Endre start-størrelsen til kubene dine, kanskje du heller vil ha stolper?
- Endre på posisjoneringen til kubene dine

### Bonus: Forklaring av soundanalyser-modulen

```js
// Bruker en modul som lager en web-audio AnalyserNode for oss
const createAnalyser = require("web-audio-analyser");

// Eksporter en funksjon fra modulen
// Optional options for å enable flere enn 32 frekvenser
module.exports = function initAnalyser(callback, options = { fftSize: 64 }) {
  // Vi ber nettleseren om lov til å bruke en mediaDevice
  // Dette er en del av WebRTC APIet
  navigator.mediaDevices
    // Vi ønsker bare audio, ikke video
    .getUserMedia({ video: false, audio: true })
    // Hvis vi får tilgang, får vi et stream-objekt av mikrofonens input
    .then(function(stream) {
      // Så bruker vi mikrofon-streamen til å lage en analyser
      const analyser = createAnalyser(stream, { stereo: false, audible: false });

      // Vi setter fftSizen til analysern i henhold til det vi sendte inn
      analyser.analyser.fftSize = options.fftSize;

      // Så kaller vi callback-funksjonen som ble sendt inn
      callback(analyser);
    })

    // Hvis vi ikke får tilgang til mikrofonen logger vi en feilmelding
    .catch(function(error) {
      console.error(error);
    });
};
```
