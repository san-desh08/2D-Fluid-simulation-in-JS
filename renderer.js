//About: This file contains the Renderer object constructor and prototype methods for rendering the FluidsGL simulation using WebGL shaders.

'use strict';

// Namespace declaration for FluidsGL, creating it if it doesn't already exist
var FluidsGL = FluidsGL || {};

// Constructor function for creating Renderer objects
FluidsGL.Renderer = function(options, fs, vs) {
  // Extracting grid and uniforms options from the provided options
  this.grid = options.grid;
  this.uniforms = options.uniforms;

  // Creating geometry for rendering
  var geometry = new THREE.PlaneBufferGeometry(
      2 * (this.grid.size.x - 2) / this.grid.size.x,
      2 * (this.grid.size.y - 2) / this.grid.size.y);

  // Options for the shader material
  var materialOptions = {
    uniforms: this.uniforms,
    fragmentShader: fs,
    depthWrite: false,
    depthTest: false,
    blending: THREE.NoBlending
  };

  // If a vertex shader is provided, include it in the material options
  if (vs) materialOptions.vertexShader = vs;

  // Creating the shader material and the quad mesh
  this.material = new THREE.ShaderMaterial(materialOptions);
  var quad = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), this.material);

  // Setting up camera and scene
  this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  this.scene = new THREE.Scene();
  this.scene.add(quad);
};

// Prototype methods for Renderer objects
FluidsGL.Renderer.prototype = {
  constructor: FluidsGL.Renderer,

  // Function to render using provided GLRenderer and uniforms values
  render: function(
      GLRenderer, uniformsValues, output = undefined, iterations = 1,
      flip = true) {
    // Iterating through rendering iterations
    for (var i = 0; i < iterations; i++) {
      // Updating uniforms values for each iteration
      for (var uniform in uniformsValues){
        // Handling DoubleBuffer type uniforms differently
        if(uniformsValues[uniform].value instanceof FluidsGL.DoubleBuffer)
          this.uniforms[uniform].value = uniformsValues[uniform].value.read;
        else
          this.uniforms[uniform].value  = uniformsValues[uniform].value; 
      }

      // Rendering to output if provided
      if (output) {
        GLRenderer.render(this.scene, this.camera, output.write, false);
        // Flipping the output buffer if required
        if (flip) output.flip();
      } else {
        // Rendering without output
        GLRenderer.render(this.scene, this.camera);
      }
    }
  }
};

// Static method for creating Renderer objects
FluidsGL.Renderer.make = function(options, fs, vs = undefined) {
  return new FluidsGL.Renderer(options, fs, vs);
}
