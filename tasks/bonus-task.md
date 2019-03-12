# Bonus Task: `dat.gui`

![dat.GUI](./img/dat.GUI.png)

`dat.gui` is a handy little tool to put into creative sketch-programs. It gives you a little control panel which you can put arbitrary value inputs into. You can hook those inputs to parameters in your program and make it re-render when you alter any of them. So it gives you a very quick way to test various parameters in your running program.

## Getting started

The first thing we need to do is to load the `dat.gui`-module. It should already be installed, so all you have to do is to require and initialize it.

```js
const dat = require("dat.gui");

const GUI = new dat.GUI();
```

## Adding parameters

The first thing we want is some where to store our parameters, so that we can get to them easily in our code.

```js
let parameters = {
  value: 1.0 // initial value
}
```

When we have this object, we can add inputs to `dat.gui` to control given parameters.

```js
gui.add(parameters, "value", 0.1, 2.0, 0.1); // min = 0.1, max = 2.0, step = 0.1
```

This piece of code will give you a slider in your `dat.gui` that controls the `value` parameter.

`dat.gui` has lots of other types of input. Like color-pickers, input fields, boolean toggles. Take a look at the [documentation](http://workshop.chromeexperiments.com/examples/gui/#1--Basic-Usage) for more information.

## Using parameters in your code

`dat.gui` will take care of updating the value in the `parameters` object for you, all you have to do is read the updated value when you need it.

If you use a parameter in your render loop you generally don't have to do anything special, the value will be read each time you call render.

```js
let parameters = {
  displacementFactor: 2
}
gui.add(parameters, "displacementFactor", 1, 5, 0.5);

function render() {
  requestAnimationFrame(render);

  // This will always be the most recent value
  displace(parameters.displacementFactor);
  renderer.render();
}

render()
```

But if you use the value in a function that only gets called during the init, you will have to tell your code to re-init when the value changes.

```js
let parameters = {
  numberOfObjects: 16
}
let objects = [];
gui.add(parameters, "numberOfObjects", 2, 32, 1).onChange(reInit);

// Imagine that you have a three.js setup here

function initObjects() {
  for(let i = 0; i < parameters.numberOfObjects; i++) {
    let object = // create some 3D object here
    objects.push(object);
  }
}

function reInit() {
  // Gotta remove all the objects in order to re initialize them
  objects.forEach(object => scene.remove(object));

  initObjects();
}
```

## Using parameters in shaders

You can also use parameters in shaders. Just declare a uniform or an attribute for it. Just remember to tag the attribute as `needsUpdate` when a parameter changes.

## Your turn

Now you know how to parameterize your own program. The tricky part is selecting which parameters to tweak, but look in your code for places where you assign an arbitrary number to something. Those are often good places to tweak.
