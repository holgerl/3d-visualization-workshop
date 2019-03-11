const THREE = require("three");
const OrbitControls = require("three-orbit-controls")(THREE);
const initAnalyser = require("../../src/lib/soundanalyser.js");

const fs = require("fs");
const vertexShaderCode = fs.readFileSync(
  `${__dirname}/vertexshader.glsl`,
  "utf8"
);
const fragmentShaderCode = fs.readFileSync(
  `${__dirname}/fragmentshader.glsl`,
  "utf8"
);

let scene, camera, renderer, analyser;
let spheres;

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

const NUM_SPHERES = 32;

function init() {
  scene = new THREE.Scene();

  initCamera();
  initRenderer();
  initSpheres();

  document.body.appendChild(renderer.domElement);

  renderer.render(scene, camera);
}

function initCamera() {
  camera = new THREE.PerspectiveCamera(45, WIDTH / HEIGHT, 0.1, 1000);
  camera.position.z = 40;

  new OrbitControls(camera);
}

function initRenderer() {
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(WIDTH, HEIGHT);
}

function initSpheres() {
  spheres = [];

  for (let i = 0; i < NUM_SPHERES; i++) {
    let material = new THREE.ShaderMaterial({
      vertexShader: vertexShaderCode,
      fragmentShader: fragmentShaderCode
    });
    let geometry = new THREE.SphereGeometry(1, 128, 64);

    let sphere = new THREE.Mesh(geometry, material);
    let xPos = (i % (NUM_SPHERES / 4)) * 4 - 3.5 * 4;
    let yPos = 0;
    let zPos = Math.floor(i / (NUM_SPHERES / 4)) * 4 - 2 * 4;
    sphere.position.set(xPos, yPos, zPos);

    scene.add(sphere);
    spheres.push(sphere);
  }
}

function normalise(min, max, v) {
  return (v - min) / max;
}

function dance() {
  let min = 0;
  let max = 255;
  let frequencies = analyser.frequencies();

  spheres.forEach(function(sphere, i) {
    let f = 1 + normalise(min, max, frequencies[i]);

    sphere.scale.set(f, f, f);
  });
}

function render() {
  requestAnimationFrame(render);
  dance();
  renderer.render(scene, camera);
}

init();
initAnalyser(function(a) {
  analyser = a;
  render();
});
