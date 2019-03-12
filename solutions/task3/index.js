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

let scene, camera, renderer, cubes, analyser, t0;

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

const NUM_CUBES = 32;

const UNIFORMS = {
  time: { value: 0.0 }
};

function init() {
  scene = new THREE.Scene();
  t0 = Date.now() * 0.01;

  initCubes();
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

function initCubes() {
  cubes = [];

  for (let i = 0; i < NUM_CUBES; i++) {
    let geometry = new THREE.CubeGeometry(1, 1, 1);
    let material = new THREE.ShaderMaterial({
      vertexShader: vertexShaderCode,
      fragmentShader: fragmentShaderCode,
      transparent: true,
      uniforms: UNIFORMS
    });

    let n = i - Math.floor(NUM_CUBES / 2);
    let cube = new THREE.Mesh(geometry, material);

    cube.position.set(n + n * 0.1, 0, 0);

    scene.add(cube);
    cubes.push(cube);
  }
}

function normalize(min, max, v) {
  return (v - min) / (max - min);
}

function dance() {
  let min = 0;
  let max = 255;
  let frequencies = analyser.frequencies();
  cubes.forEach((cube, i) =>
    cube.scale.set(1, 1 + normalize(min, max, frequencies[i]), 1)
  );
  UNIFORMS.time.value = (Date.now() * 0.01) - t0; // time in seconds
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
