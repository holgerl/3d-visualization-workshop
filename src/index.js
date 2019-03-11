const THREE = require("three");

function init() {
  // You can delete these three lines when you begin coding
  const hello = document.createElement("p");
  hello.innerText = "Welcome to the workshop!";
  document.body.appendChild(hello);
}

function render() {
  requestAnimationFrame(render);
}

init();
render();
