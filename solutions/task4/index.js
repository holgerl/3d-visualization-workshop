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
let spheres, displacement, noise;

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
    let geometry = new THREE.SphereBufferGeometry(1, 128, 64);
    let displacement = new Float32Array(geometry.attributes.position.count);
    let noise = new Float32Array(displacement.length);

    for (let i = 0; i < noise.length; i++) {
      noise[i] = Math.random() * 5;
    }

    geometry.addAttribute(
      "displacement",
      new THREE.BufferAttribute(displacement, 1)
    );

    let sphere = new THREE.Mesh(geometry, material);
    let xPos = (i % (NUM_SPHERES / 4)) * 4 - 3.5 * 4;
    let yPos = 0;
    let zPos = Math.floor(i / (NUM_SPHERES / 4)) * 4 - 2 * 4;
    sphere.position.set(xPos, yPos, zPos);

    scene.add(sphere);
    spheres.push([sphere, displacement, noise]);
  }
}

function normalize(min, max, v) {
  return (v - min) / (max - min);
}

function dance() {
  let min = 0;
  let max = 255;
  let frequencies = analyser.frequencies();

  spheres.forEach(function(sphere, i) {
    let f = normalize(min, max, frequencies[i]);

    updateDisplacement(sphere, f);
  });
}

function updateDisplacement([sphere, displacement, noise], f) {
  let time = Date.now() * 0.01; // time in s;
  for (let i = 0; i < displacement.length; i++) {
    displacement[i] = f * Math.sin(0.1 * i + time);

    noise[i] += -0.5 + Math.random();
    noise[i] = THREE.Math.clamp(noise[i], -f, f);

    displacement[i] += noise[i];
  }

  sphere.geometry.attributes.displacement.needsUpdate = true;
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
