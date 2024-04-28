//About: This file contains the main application code for the FluidsGL project, 
//which initializes the application, sets up the GUI, and defines the simulation and rendering functions.

"use strict";

// Namespace declaration for FluidsGL, creating it if it doesn't already exist
var FluidsGL = FluidsGL || {};

// Initialize window size using the inner width and height
var windowSize = new THREE.Vector2(window.innerWidth, window.innerHeight);

// Create a WebGLRenderer instance
var GLRenderer = new THREE.WebGLRenderer();
GLRenderer.autoClear = false;
GLRenderer.sortObjects = false;
GLRenderer.clearBeforeRender = false;
GLRenderer.setPixelRatio(window.devicePixelRatio);
GLRenderer.setSize(windowSize.x, windowSize.y);
// Append renderer element to the document body
document.body.appendChild(GLRenderer.domElement);

// Create a Stats instance for performance monitoring
var stats = new Stats();
stats.setMode(0);
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = '0px';
stats.domElement.style.top = '0px';
document.body.appendChild(stats.domElement);

// Declaration of variables for GUI controls and parameters
var gui;

// Grid parameters for simulation
var grid = {size: new THREE.Vector2(640, 360), scale: 1};

// Time and simulation parameters
var time = {timestep: 1};
var parameters = {dissipation : 1.0, radius : 0.2, pause : false};

// Settings for display
var displaySettings = {slab: 'velocity'};

// Declaration of display and renderer variables
var scalarDisplay, vectorDisplay;
var renderers;

// Declaration of DoubleBuffer variables
var doubleBuffers;

// Mouse declaration for interaction
var mouse = new FluidsGL.Mouse(grid);

// Function to initialize the application
function init(shaders) {
  // Create GUI for controlling simulation parameters
  gui = new dat.GUI();
  gui.add(
      displaySettings, 'slab',
      ['density', 'velocity', 'divergence', 'pressure']);
  gui.add(time, 'timestep', 1, 10);
  gui.add(parameters, 'dissipation', 0.98, 1.0);
  gui.add(parameters, 'radius', 0, 1.0);
  gui.add(parameters, 'pause');

  // Create scalar and vector displays for visualization
  scalarDisplay = FluidsGL.Renderer.make(
      {
        grid: grid,
        uniforms: {read: {type: 't'}, bias: {type: 'v3'}, scale: {type: 'v3'}}
      },
      shaders.scalardisplay, shaders.basic);

  vectorDisplay = FluidsGL.Renderer.make(
      {grid: grid, uniforms: {read: {type: 't'}}}, shaders.vectordisplay,
      shaders.basic);

  // Create various renderers for simulation
  renderers = {
    mouse: FluidsGL.Renderer.make(
        {
          grid: grid,
          uniforms: {
            read: {type: 't'},
            gridSize: {type: 'v2'},
            color: {type: 'v3'},
            point: {type: 'v2'},
            radius: {type: 'f'}
          }
        },
        shaders.mouse),
    advect: FluidsGL.Renderer.make(
        {
          grid: grid,
          uniforms: {
            velocity: {type: 't'},
            advected: {type: 't'},
            gridSize: {type: 'v2'},
            gridScale: {type: 'f'},
            timestep: {type: 'f'},
            dissipation: {type: 'f'}
          }
        },
        shaders.advect),
    gradient: FluidsGL.Renderer.make(
        {
          grid: grid,
          uniforms: {
            p: {type: 't'},
            w: {type: 't'},
            gridSize: {type: 'v2'},
            gridScale: {type: 'f'}
          }
        },
        shaders.gradient),
    divergence: FluidsGL.Renderer.make(
        {
          grid: grid,
          uniforms: {
            velocity: {type: 't'},
            gridSize: {type: 'v2'},
            gridScale: {type: 'f'}
          }
        },
        shaders.divergence),
    jacobis: FluidsGL.Renderer.make(
        {
          grid: grid,
          uniforms: {
            x: {type: 't'},
            b: {type: 't'},
            gridSize: {type: 'v2'},
            alpha: {type: 'f'},
            beta: {type: 'f'}
          }
        },
        shaders.jacobiscalar)
  };

  // Create double buffers for simulation
  doubleBuffers = {
    velocity: FluidsGL.DoubleBuffer.make(grid.size.x, grid.size.y),
    density: FluidsGL.DoubleBuffer.make(grid.size.x, grid.size.y),
    velocityDivergence: FluidsGL.DoubleBuffer.make(grid.size.x, grid.size.y),
    pressure: FluidsGL.DoubleBuffer.make(grid.size.x, grid.size.y)
  };

  // Add a clear function to the GUI to clear double buffers
  gui.add({ clear:function(){ 
    for (var buffer in doubleBuffers) {
      doubleBuffers[buffer].clear(GLRenderer);
    }
  }}, 'clear');

  // Start the main animation loop
  requestAnimationFrame(update);
}

// Function for advecting the velocity and density fields
function advect() {
  // Advect velocity field
  renderers.advect.render(
      GLRenderer, {
        velocity: {value: doubleBuffers.velocity},
        advected: {value: doubleBuffers.velocity},
        gridSize: {value: grid.size},
        gridScale: {value: grid.scale},
        timestep: {value: time.timestep},
        dissipation: {value: 1.0}
      },
      doubleBuffers.velocity);

  // Advect density field
  renderers.advect.render(
      GLRenderer, {
        velocity: {value: doubleBuffers.velocity},
        advected: {value: doubleBuffers.density},
        gridSize: {value: grid.size},
        gridScale: {value: grid.scale},
        timestep: {value: time.timestep},
        dissipation: {value: parameters.dissipation}
      },
      doubleBuffers.density);
}

// Function to add external forces to the simulation
function addForces() {
  var color = new THREE.Vector3(1.0, 1.0, 1.0);
  var point = new THREE.Vector2();
  var force = new THREE.Vector3();

  // Iterate through mouse motions and apply forces
  for (var i = 0; i < mouse.motions.length; i++) {
    var motion = mouse.motions[i];

    point.set(motion.position.x, windowSize.y - motion.position.y);
    
    point.x = (point.x / windowSize.x) * grid.size.x;
    point.y = (point.y / windowSize.y) * grid.size.y;

    if (motion.left) {
      force.set(motion.drag.x, -motion.drag.y, 0);

      renderers.mouse.render(
          GLRenderer, {
            read: {value: doubleBuffers.velocity},
            gridSize: {value: grid.size},
            color: {value: force},
            point: {value: point},
            radius: {value: parameters.radius}
          },
          doubleBuffers.velocity);
    }

    if (motion.right) {
      renderers.mouse.render(
          GLRenderer, {
            read: {value: doubleBuffers.density},
            gridSize: {value: grid.size},
            color: {value: color},
            point: {value: point},
            radius: {value: parameters.radius}
          },
          doubleBuffers.density);
    }
  }
  mouse.motions = [];
}

// Function to enforce divergence-free condition
function project() {
  // Clear pressure buffer
  doubleBuffers.pressure.clear(GLRenderer);
  
  // Compute velocity divergence
  renderers.divergence.render(
      GLRenderer, {
        velocity: {value: doubleBuffers.velocity},
        gridSize: {value: grid.size},
        gridScale: {value: grid.scale}
      },
      doubleBuffers.velocityDivergence);

  // Solve for pressure using Jacobi iterations
  renderers.jacobis.render(
      GLRenderer, {
        x: {value: doubleBuffers.pressure},
        b: {value: doubleBuffers.velocityDivergence},
        gridSize: {value: grid.size},
        alpha: {value: -grid.scale * grid.scale},
        beta: {value: 4}
      },
      doubleBuffers.pressure, 50);

  // Subtract gradient of pressure from velocity to make it divergence-free
  renderers.gradient.render(
      GLRenderer, {
        p: {value: doubleBuffers.pressure},
        w: {value: doubleBuffers.velocity},
        gridSize: {value: grid.size},
        gridScale: {value: grid.scale}
      },
      doubleBuffers.velocity);
}

// Function to advance one simulation step
function step() {
  // Advect velocity and density fields
  if(!parameters.pause)
    advect();
  // Add external forces
  addForces();
  // Enforce divergence-free condition
  if(!parameters.pause)
    project();
}

// Function to update the simulation and rendering
function update() {
  stats.begin();
  // Perform one simulation step
  step();
  // Render the current display
  render();
  stats.end();
  // Request the next animation frame
  requestAnimationFrame(update);
}

// Function to render the current display
function render() {
  switch (displaySettings.slab) {
    case 'velocity':
      vectorDisplay.render(
          GLRenderer, {read: {value: doubleBuffers.velocity.read}});
      break;
    case 'density':
      scalarDisplay.render(GLRenderer, {
        read: {value: doubleBuffers.density.read},
        bias: {value: new THREE.Vector3(0.0, 0.0, 0.0)},
        scale: {value: new THREE.Vector3(1.0, 1.0, 1.0)}
      });
      break;
    case 'divergence':
      scalarDisplay.render(GLRenderer, {
        read: {value: doubleBuffers.velocityDivergence.read},
        bias: {value: new THREE.Vector3(0.5, 0.5, 0.5)},
        scale: {value: new THREE.Vector3(0.5, 0.5, 0.5)}
      });
      break;
    case 'pressure':
      scalarDisplay.render(GLRenderer, {
        read: {value: doubleBuffers.pressure.read},
        bias: {value: new THREE.Vector3(0.5, 0.5, 0.5)},
        scale: {value: new THREE.Vector3(0.5, 0.5, 0.5)}
      });
      break;
  }
}

// Initialize the FileLoader to load shaders
var loader = new FluidsGL.FileLoader('shaders', [
  'advect.fs', 'basic.vs', 'scalardisplay.fs', 'vectordisplay.fs',
  'divergence.fs', 'gradient.fs', 'jacobiscalar.fs', 'jacobivector.fs',
  'mouse.fs'
]);

// Load shaders and initialize the application
loader.run(function(files) {
  var shaders = {};
  for (var name in files) {
    shaders[name.split('.')[0]] = files[name];
  }
  init(shaders);
});
