//About: This file contains the Mouse object constructor and prototype methods for handling mouse interactions in the FluidsGL simulation.

"use strict";

// Namespace declaration for FluidsGL, creating it if it doesn't already exist
var FluidsGL = FluidsGL || {};

// Constructor function for Mouse objects, handling mouse interactions
FluidsGL.Mouse = function(grid) {
    // Initialize grid for reference
    this.grid = grid;
    // Flags to track left and right mouse button states
    this.left = false;
    this.right = false;
    // Vector to store mouse position
    this.position = new THREE.Vector2();
    // Array to store mouse motion data
    this.motions = [];

    // Event listeners for mouse actions
    document.addEventListener("mousedown", this.mouseDown.bind(this), false);
    document.addEventListener("mouseup", this.mouseUp.bind(this), false);
    document.addEventListener("mousemove", this.mouseMove.bind(this), false);
    document.addEventListener("contextmenu", this.contextMenu.bind(this), false);
};

// Prototype methods for Mouse objects
FluidsGL.Mouse.prototype = {
    constructor: FluidsGL.Mouse,

    // Function to handle mouse button press
    mouseDown: function(event) {
        // Set mouse position and update button states
        this.position.set(event.clientX, event.clientY);
        this.left = event.button === 0 ? true : this.left;
        this.right = event.button === 2 ? true : this.right;
    },

    // Function to handle mouse button release
    mouseUp: function(event) {
        // Prevent default context menu behavior
        event.preventDefault();
        // Update button states on release
        this.left = event.button === 0 ? false : this.left;
        this.right = event.button === 2 ? false : this.right;
    },

    // Function to handle mouse movement
    mouseMove: function(event) {
        // Prevent default mouse move behavior
        event.preventDefault();
        // Calculate mouse drag and position based on grid scale
        var r = this.grid.scale;
        var x = event.clientX;
        var y = event.clientY;

        // If left or right button is pressed, record motion
        if (this.left || this.right) {
            var dx = x - this.position.x;
            var dy = y - this.position.y;

            var drag = {
                x: Math.min(Math.max(dx, -r), r),
                y: Math.min(Math.max(dy, -r), r)
            };

            var position = {
                x: x,
                y: y
            };

            // Push motion data to motions array
            this.motions.push({
                left: this.left,
                right: this.right,
                drag: drag,
                position: position
            });
        }

        // Update mouse position
        this.position.set(x, y);
    },

    // Function to handle context menu event
    contextMenu: function(event) {
        // Prevent default context menu behavior
        event.preventDefault();
    }
};
