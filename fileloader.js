//About: This file contains the FileLoader constructor function, which is used to load a batch of files from a specified path and invoke a callback when all files are loaded. 
// Namespace declaration for FluidsGL, if it doesn't already exist
var FluidsGL = FluidsGL || {};

"use strict";

// FileLoader constructor function: loads a batch of files from a specified path
// and invokes a callback when all files are loaded.
FluidsGL.FileLoader = function(path, names) {
    // Path to the files
    this.path = path;
    // Queue to hold file objects with their names and URLs
    this.queue = [];
    // Loop through each file name and create a corresponding file object in the queue
    for (var i = 0; i < names.length; i++) {
        var name = names[i];
        var url = path + "/" + name;
        var file = {
            name: name,
            url: url
        };
        // Add file object to the queue
        this.queue.push(file);
    }
};

// Prototype methods for FileLoader objects
FluidsGL.FileLoader.prototype = {
    constructor: FluidsGL.FileLoader,

    // Method to load files from the queue and call the 'onDone' callback
    run: function(onDone) {
        // Object to store loaded file contents
        var files = {};
        // Counter for files remaining to be loaded
        var filesRemaining = this.queue.length;

        // Function to handle loaded files
        var fileLoaded = function(file) {
            // Store file contents in 'files' object
            files[file.name] = file.text;
            // Decrement the count of remaining files
            filesRemaining--;
            // If all files are loaded, invoke the 'onDone' callback
            if (filesRemaining === 0) {
                onDone(files);
            }
        };

        // Function to load a single file
        var loadFile = function(file) {
            var request = new XMLHttpRequest();
            request.onload = function() {
                // Check if file is successfully loaded (status code 200)
                if (request.status === 200) {
                    // Store the response text in the file object
                    file.text = request.responseText;
                }
                // Handle the loaded file
                fileLoaded(file);
            };
            // Send a GET request to load the file asynchronously
            request.open("GET", file.url, true);
            request.send();
        };

        // Iterate through the queue and load each file
        for (var i = 0; i < this.queue.length; i++) {
            loadFile(this.queue[i]);
        }
        // Clear the queue after loading all files
        this.queue = [];
    }
};
