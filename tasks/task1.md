# Task 1: Intro to WebGL and `three.js`

In this task, you'll make a spinning cube - The ultimate introduction to WebGL and `three.js`.

## Getting started

You'll find a lot of stuff in this project. Here is an overview:

```sh
3d-visualization-workshop/
├── electives/                  # Optional tasks for the ambitious student
├── slides/                     # The slides that the tutors will go through
├── solutions/                  # Suggested solutions to all the tasks
├── src/                        # This is where your code will be written!
│   ├── fragmentshader.glsl     # Shader-program used in task 3 & 4
│   ├── index.html              # The HTML file that runs the code
│   ├── index.js                # The JavaScript code you will write
│   ├── lib                     # Some helper code
│   └── vertexshader.glsl       # Shader-program used in task 3 & 4
├── tasks/                      # The task descriptions
├── README.md                   # Readme for this workshop
└── package.json                # Dependencies and build scripts
```

To get going with the task, do the following in a terminal at the project root folder:

```sh
npm install
npm start
```

Then, open `http://localhost:9966` in your favorite web browser.

> It is important in later tasks that you use `localhost` instead of the IP of your local machine. It has to do with the MediaDevices API.

You'll see the text `Welcome to the workshop` on the screen. Better open the developer tools (`F12` or `ctrl/cmd+shift+i`) right away so that you will see any error messages during the workshop.

## Writing code

All code will go into the `index.js` file in the `src/` folder. Any updates saved to these files will trigger an automatic refresh in the browser, so you can see the effects right away.

Note that we have purposely avoided using any web frameworks like React or Vue to keep things as simple as possible. We will be using plain JavaScript which will run in any modern browser.

In `index.js` there is some simple boilerplate code:

```js
// Retrieve the three.js dependency
const THREE = require("three");

function init() {
  // Here you'll put code that should run once at startup
}

function render() {
  // Make sure another call to this function is queued up, making a render loop:
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

We won't tell you exactly how to structure your code. We assume that you have some experience with JavaScript and know how variable scoping works and how to use functions to structure code.

Most of the code in the task description is written to illustrate how a certain `three.js` API can be used, you will have to put it into your own codebase in accordance with your own structure.

> The code in this workshop won't be very complex, so taking advantage of global variables can help you keep the function signatures simple.

## Make a `three.js` renderer, scene and camera

The first things you have to make to get started with `three.js` is:

- a renderer to draw stuff on the screen
- a scene that holds the elements to be drawn
- a camera that determines which part of the scene is visible

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

Last, we will make a camera to behold our scene. There exists multiple cameras with different properties, but for our purpose the [`PerspectiveCamera`](https://threejs.org/docs/index.html#api/cameras/PerspectiveCamera) will be excellent. It mimics the way the human eye works, and is easy to work with.

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

You'll notice that the camera is agnostic to resolution of the rendered image. That is a property of the renderer. The camera will use the field of view and aspect ratio for its projections, and then at the end the renderer will smear the pixels over the given resolution.

`near` and `far` controls which parts of the scene are ignored by the camera. This can speed things up if a lot of objects are too far away to make any difference. And it can avoid the entire screen being filled with an object that flows too close to the camera. For our purposes, the values `0.01` and `1000` will be suitable. This means that things between these values in the coordinate system will be visible.

What is the unit, you might ask? It is really just "a distance". As long as all distances are in the same coordinate system, it does not matter mathematically if `1.0` is a meter, a thousand meters or a foot. But it is often smart to just settle on it being a meter, and then try to stick to this when modelling real things in the visualization. And we all know the meter is the superior unit.

Now that we have a scene and a camera, we can ask the renderer to draw things:

```js
renderer.render(scene, camera);
```

There will not be a lot to see, because we don't have any objects in the scene. But if you get a black screen without errors in the devtools console, you have probably done everything correctly.

## Hello Cube!

Our first task will be to get a cube up on the screen. The cube is an object, and most objects in `three.js` consist of a geometry and a material. The geometry defines the shape of the object, and the material defines the looks.

The simplest object type is the [`Mesh`](https://threejs.org/docs/index.html#api/objects/Mesh). It consists of lot of triangles; and as we know, WebGL loves triangles. We are going to use `Mesh` to make our cube.

We need a geometry, and `three.js` has a neat class ready to use called [`BoxGeometry`](https://threejs.org/docs/#api/geometries/BoxGeometry). This class takes three values (height, width and depth) and returns a geometry representing a box with these dimensions. Play around with the parameters and see the results.

```js
let geometry = new THREE.BoxGeometry(1, 1, 1);
```

We also need a material. `three.js` comes with a lot of those out of the box, but a simple material that lets us see the three dimensions clearly is the [`MeshNormalMaterial`](https://threejs.org/docs/#api/materials/MeshNormalMaterial). It will color the geometry based on the direction each triangle is facing.

```js
let material = new THREE.MeshNormalMaterial();
```

We can now combine these three concepts and make a cube

```js
let geometry = new THREE.BoxGeometry(height, width, depth);
let material = new THREE.MeshNormalMaterial();
let cube = new THREE.Mesh(geometry, material);
}
```

To actually be able to see the cube, we have to add it to the scene:

```js
scene.add(cube);
```

But you will probably not see anything! This is because our camera is at the exact same position as the cube. Meaning that the camera is inside the cube! If we move the camera back, we can see the cube properly:

```js
camera.position.z = 5;
```

The result is perhaps a little underwhelming; the cube looks flat. We can make it more enticing by rotating it.

## Rotating the cube

All objects in `three.js` have attributes controlling where they are, how big they are and which direction they are rotated. We have allready seen this when we moved the camera back to see the cube.

To change the cube's rotation, we change some values on the `.rotation` attribute:

```js
cube.rotation.x = 1;
cube.rotation.y = 0.5;
cube.rotation.z = 1.25;
```

Now you will se that the cube has multiple faces and is actually a 3D object!

We can take this a step further and let the cube rotate over time. To do this, we need to change the rotation a bit every frame and ask the renderer to draw the scene.

```js
const SPEED = 0.01;

function rotateCube() {
  cube.rotation.x -= SPEED;
  cube.rotation.y -= SPEED;
  cube.rotation.z -= SPEED;
}
```

You can call `rotateCube()` inside the function that is called every frame. If you kept the boiler plate code, it is called `render()`. In addition, you should call the render function on the `renderer` to refresh the drawing of the scene:

```js
renderer.render(scene, camera);
```

Congratulations, you now have spinning cube!

Play around with the different values and see what happens with the cube. Be creative! Here are some suggestions:

- Vary the rotational speed of each separate axis
- Change the dimensions of the cube geometry
- Change the camera attributes (near, far, where ever you are 🎶)
- Change the camera position
- Can the camera also be rotated like the cube?
