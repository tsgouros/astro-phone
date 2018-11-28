AFRAME.registerComponent('model-r', {
  schema: {default: 1.0},
  init: function () {
    this.el.addEventListener('model-loaded', this.update.bind(this));
  },
  update: function () {
    var mesh = this.el.getObject3D('mesh');
    var data = this.data;
    if (!mesh) { return; }
    mesh.traverse(function (node) {
      if (node.isMesh) {
        node.material.color.r = data;
        node.material.transparent = data < 1.0;
        node.material.needsUpdate = true;
      }
    });
  }
});

/* This needs to have a "set-color" method created to take a color and apply it, 
   and then the init() and update() functions can use that. There must be some
   javascript way to parseFloat() an array of strings into an array of floats,
   look into it. */

setMeshColor = function(mesh, colorData) {
  // Accepts a mesh and a color.  Checks to see if the mesh is really a mesh.
  // The color can be specified as a string (e.g. "0.3 0.2 0.1") or as an
  // array (e.g. [0.3,0.2,0.1]) or an object (e.g. {r: 0.3, g: 0.2, b: 0.1})

  var colors;
  if (typeof(colorData) == 'string') {
    var colorArray = this.data.split(" ").map(Number);
    colors = {r: colorArray[0], g: colorArray[1], b: colorArray[2] };
  } else if (Array.isArray(colorData)) {
    colors = {r: colorData[0], g: colorData[1], b: colorData[2] };
  } else {
    colors = colorData;
  }
  
  if (!mesh) {
    console.log("********* oops, no mesh", mesh, colorData);
    return;
  }

  mesh.traverse(function(node) {
    if (node.isMesh) {
      node.material.color = colors;
      node.material.transparent = true;
      node.material.needsUpdate = true;
    }
  });
};               


AFRAME.registerComponent('gltf-color', {
  schema: {default: {r: 0.5, g: 0.5, b: 0.6}},
  init: function() {

    // Retrieve colors. If they are specified with the gltf-color attribute,
    // they arrive here as a string such as '0.1 0.2 0.3'. Otherwise, they arrive
    // as the default value specifed in the schema attribute above.
    var colorData = this.data;

    // Listen for the model-loaded event, then adjust the color of the object. 
    this.el.addEventListener('model-loaded', function(event) {
      setMeshColor(event.target.getObject3D('mesh'), colorData);
    });
  },
  update: function() {
    // Accepts an object (mesh) and a string with three numbers (0-1)
    // in it, and sets the color of the given asset accordingly.

    var colorData = this.data;
    setMeshColor(this.el.getObject3D('mesh'), colorData);
  }
});


var tour = {
  track1: {dur: "5000", next: "track2"},
  track2: {dur: "5000", next: "track3"},
  track3: {dur: "10000", next: "track1"}
};
  

AFRAME.registerComponent('alongpathevent', {
  schema: {default: 1.0},
  init: function() {
    this.update.bind(this);

    var clickHandler = function(event) {

      // First, stop listening for this event.  We'll start listening
      // again after the next segment is completed.
      var el = document.getElementById("mainCamera");
      el.removeEventListener('click', clickHandler);
      
      // Get the alongpath attribute from the camera entity.
      var alongpath = el.getAttribute("alongpath");

      // What path are we on (without the '#')?
      var currentPath = alongpath.curve.substring(1);
      var nextPath = tour[currentPath].next;
      
      // Change the curve, and restart the animation to follow the new
      // curve.  The setAttribute function restarts the animation in
      // some way that simply modifying alongpath.curve does not.
      el.setAttribute("alongpath",
                      "curve: #" + nextPath +
                      "; dur: " + tour[nextPath].dur + ";");
    };
    
    this.el.addEventListener('movingended', function(event) {

      // All we really need to do at the end of a curve is to await
      // the command to start the next curve.
      var el = document.getElementById("mainCamera");
      el.addEventListener('click', clickHandler);
      
    });

    // We want the first click to interrupt the movement of the camera, but
    // after that, we want to let each track play to the end.
    var startListener = function(event) {
      var el = document.getElementById("mainCamera");
      el.addEventListener('click', clickHandler);
      el.removeEventListener('movingstarted', startListener);
    };
    this.el.addEventListener('movingstarted', startListener);

    // At the moment we are not using the alongpath-trigger-activated
    // events.  But we log them because we're curious.
    this.el.addEventListener('alongpath-trigger-activated', function(event) {
      console.log("trigger event:", event);});

  },
  update: function() {
    console.log("something happened!");
  }
});
