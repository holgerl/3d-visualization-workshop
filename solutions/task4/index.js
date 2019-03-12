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

let scene, camera, renderer, analyser, spheres, t0, displacement, noise;

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

const NUM_SPHERES = 32;

const UNIFORMS = {
  time: { value: 0.0 }
};

function init() {
  scene = new THREE.Scene();
  t0 = Date.now() * 0.01;

  initSpheres();
  initCamera();
  initRenderer();

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
      fragmentShader: fragmentShaderCode,
      transparent: true,
      uniforms: UNIFORMS
    });
    let geometry = new THREE.SphereBufferGeometry(1, 128, 64);
    let displacement = new Float32Array(geometry.attributes.position.count);

    for (let i = 0; i < displacement.length; i++) {
      displacement[i] = Math.random();
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
    spheres.push(sphere);
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
  UNIFORMS.time.value = (Date.now() * 0.01) - t0; // time in seconds
}

function updateDisplacement(sphere, f) {
  let time = Date.now() * 0.01; // time in s;
  let displacement = sphere.geometry.attributes.displacement;

  for (let i = 0; i < displacement.count; i++) {
    displacement.array[i] = f * Math.sin(0.1 * i + time);
  }

  displacement.needsUpdate = true;
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
