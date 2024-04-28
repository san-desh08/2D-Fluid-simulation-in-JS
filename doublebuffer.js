// About: This file contains the DoubleBuffer class definition for the FluidsGL library.

"use strict";

// Namespace declaration for FluidsGL
var FluidsGL = FluidsGL || {};

// Constructor function for DoubleBuffer objects
FluidsGL.DoubleBuffer = function(width, height, options) {
  // Creating a WebGLRenderTarget for reading and writing
  this.read = new THREE.WebGLRenderTarget(width, height, options);
  // Cloning the read buffer for writing
  this.write = this.read.clone();
};

// Prototype methods for DoubleBuffer objects
FluidsGL.DoubleBuffer.prototype = {
  constructor: FluidsGL.DoubleBuffer,
  
  // Method to flip the read and write buffers
  flip: function() {
      var tmp = this.read;
      this.read = this.write;
      this.write = tmp;
  },
  
  // Method to clear the write buffer using the provided GLRenderer
  clear: function(GLRenderer){
    // Clearing the write buffer
    GLRenderer.clearTarget(this.write, true, false, false);
    // Flipping the buffers after clearing
    this.flip();
  }
};

// Static method to create a DoubleBuffer object with specified width and height
FluidsGL.DoubleBuffer.make = function(width, height) {
  // Default options for the DoubleBuffer
  var options = {
    wrapS: THREE.ClampToEdgeWrapping,
    wrapT: THREE.ClampToEdgeWrapping,
    magFilter: THREE.NearestFilter,
    minFilter: THREE.NearestFilter,
    format: THREE.RGBAFormat,
    type: THREE.FloatType,
    depthBuffer: false,
    stencilBuffer: false,
    generateMipmaps: false,
    shareDepthFrom: null
  };
  // Creating and returning a new DoubleBuffer object
  return new FluidsGL.DoubleBuffer(width, height, options);
}
