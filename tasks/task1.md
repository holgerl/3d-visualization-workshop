# Task 1: Intro to WebGL and `three.js`

In this task, you'll make a spinning cube - The ultimate introduction to WebGL and `three.js`.

### Getting started

You'll find a lot of stuff in this project. Here is an overview:

```sh
3d-visualization-workshop/
├── electives/                  # Optional tasks for the ambitious student
├── slides/                     # The slides that the tutors will go through
├── solutions/                  # Suggested solutions to all the tasks
├── src/                        # This is where your code will be written!
|   ├── fragmentshader.glsl     # (Used in later tasks)
|   ├── index.html              # The HTML file that runs the code
|   ├── index.js                # The JavaScript code you will write
|   └── vertexshader.glsl       # (Used in later tasks)
├── tasks/                      # The task assignement text
├── README.md                   # Readme for this workshop
└── package.json                # Dependencies and build scripts
```

To get going with the task, do the following in a terminal at the project root folder:

```sh
npm install
npm start
```

Then, open `http://localhost:9966` in your favorite web browser

You'll see the text `Velcome to the workshop` on the screen. Better open the developer tools (F12) right away so that you will see any error messages during the workshop.

### Writing code

All code will go into the `index.js` file in the `src/` folder. Any updates saved to these files will trigger an automatic refresh in the browser, so you can see the effects right away.

Note that we have purposely avoided using any web frameworks like React or Vue to keep things as simple as possible. We will be using pure and modern JavaScript.

In `index.js` there is some simple boilerplate code:

```js
// Retrieve the three.js dependency
const THREE = require("three");

function init() {
  // Here you'll put code that should run once at startup
}

function render() {
  // Make sure another call to this function is queued up for the browser to make (making it loop):
  requestAnimationFrame(render);

  // Here you'll put code that is run every "frame" in the loop
  // Typically renderer.render()
  // or box.position += 10
}

// Call the init function:
init();

// Start the render loop:
render();
```

It is up to you how you structure your code. In this text there are many code snippets that illustrates how the `three.js` API is used, but where the function calls and variable declarations will go you have to figure out yourself. It is important to remember how scoping works in JavaScript if you have to use a variable several places. In a project of this size, the authors prefer a lot of global variables.

### Make a `three.js` renderer, scene and camera

The first things you have to make to get started with `three.js` is:

- a renderer to draw stuff on the screen
- a scene that holds the elements to be drawn
- a camera that controls what you "see" in the scene

To make a renderer, use [`WebGLRenderer`](https://threejs.org/docs/index.html#api/renderers/WebGLRenderer) from `three.js`. If you don't pass any parameters, it will internally create a `canvas` element that will work as a context for your WebGL visualization.

```js
let renderer;
renderer = new THREE.WebGLRenderer();
```

You can set the height and with of the renderer, and you'll probably want to use the entire available browser window space:

```js
const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;
renderer.setSize(WIDTH, HEIGHT);
```

To actually see the rendered image, the created `canvas` element need to be added to the document. It is available in the `domElement` field:

```js
document.body.appendChild(renderer.domElement);
```

The scene and camera is also needed to make the setup complete.

A [`Scene`](https://threejs.org/docs/index.html#api/scenes/Scene) is group of objects in space that make up your visualization. It is simple to initialize:

```js
let scene;

scene = new THREE.Scene();
```

Later, you will add object to that scene, but this will hold for now.

Last, will make a camera to behold our scene. There exists multiple cameras with different properties, but for our purpose the [`PerspectiveCamera`](https://threejs.org/docs/index.html#api/cameras/PerspectiveCamera) will be excellent. It mimics the way the human eye works, and is easy to work with.

```js
let camera;

camera = new THREE.PerspectiveCamera(fov, WIDTH / HEIGHT, near, far);
```

`PerspectiveCamera` takes four parameters:

1.  Field of View. How wide or narrow is the area visible to the camera?
2.  Aspect Ratio. What is the ratio between the height and width of the rendered image?
3.  Near. How close to the camera can an object be and still be visible?
4.  Far. How far away can an object be and still be visible?

`fov` is usually a value between 0 and 90 degrees. For our purpose a value between 45 and 70 will look "normal". In contrast to almost all other angle values in WebGL, this is in degrees. Other angles will usually be expressed in radians.

Yo'll notice that the camera is agnostic to resolution of the rendered image. That is a property of the renderer. The camera will use the field of view and aspect ratio for its projections, and then at the end the renderer will smear the pixels over the given resolution.

`near` and `far` controls which parts of the scene are ignored by the camera. This can speed things up if a lot of objects are too far away to make any difference. And it can avoid the entire screen being filled with an object that flows too close to the camera. For our purposes, the values `0.01` and `1000` will be suitable. This means that things between these values in the coordinate system will be visible. 

What is the unit, you might ask? It is really just "a distance". As long as all distances are in the same coordinate system, it does not matter mathematically if `1.0` is a meter, a thousand meters or a foot. But it is often smart to just settle on it being a meter, and then try to stick to this when modelling real things in the visualization. And we all know the meter is the superior unit.

Now that we have a scene and a camera, we can ask the renderer to draw things:

```js
renderer.render(scene, camera);
```

There will not be a lot to see, because we don't have any objects in the scene. But if you get a black screen without errors, you have probably done everything correctly.

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
