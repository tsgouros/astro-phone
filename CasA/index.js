
var soundList = [
  "Acceleration",
  "Infrared",
  "Iron",
  "Jets",
  "NeutronStar",
  "OuterBlastOpt",
  "OuterBlastXray"
];

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
    var colorArray = colorData.split(" ").map(Number);
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


// Here is the tour on which our users will go.  Each key in this object
// corresponds to the id of an a-curve object in the html.  Together they
// make up a linked list, with each entry identifying its curve and also
// pointing to the next curve in the list.
var tour = {
  preOrbit:   {dur: "2000",
               next: "firstOrbit",
               audio: "Iron",
               text: "end of preOrbit: You're looking at data from the Cassiopeia A supernova. Click anywhere on the screen to orbit the data and see it from all angles."},
  firstOrbit: {dur: "20000",
               next: "track1",
               audio: "Acceleration",
               text: "end of firstOrbit:  The pink that you see is the shock sphere. Click to begin a tour."},
  track1:     {dur: "5000",
               next: "track2",
               audio: "Iron",
               text: "end of track1: Look to your left to sight down the green jet toward the neutron star in the middle of the supernova.  Click to advance to the next stop."},
  track2:     {dur: "5000",
               next: "track3",
               audio: "Iron",
               text: "end of track2: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut enim ad minim veniam"},
  track3:     {dur: "10000",
               next: "track1",
               audio: "Iron",
               text: "end of track3: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut enim ad minim veniam"}
};
  

AFRAME.registerComponent('alongpathevent', {
  schema: {default: 1.0},
  init: function() {
    this.update.bind(this);

    var clickHandler = function(event) {
      // TBD: This should stop any audio playing, too.
      
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
      var mainCamera = document.getElementById("mainCamera");
      mainCamera.addEventListener('click', clickHandler);

      // What path did we just finish?
      var currentPath = mainCamera.getAttribute("alongpath").curve.substring(1)
      
      // Display the text for the (end of the) path.
      var textHolder = document.getElementById("textHolder");
      var textVal = textHolder.getAttribute("text");
      textVal.value = tour[currentPath].text;
      textHolder.setAttribute("text", textVal);
      var pos = mainCamera.getAttribute("position");
      var textPos = textHolder.getAttribute("position");
      textPos = {x: pos.x, y: pos.y, z: pos.z - 1};
      textHolder.setAttribute("position", textPos);

      // Play the audio for the (end of the) path.
      var sound = document.getElementById(tour[currentPath].audio);
      sound.play();
      sound.addEventListener("ended", function(event) {
        console.log("clip ended");
      });
    });

    // We want the first click to interrupt the movement of the camera, but
    // after that, we want to let each track play to the end.
    var startListener = function(event) {
      var mainCamera = document.getElementById("mainCamera");
      mainCamera.addEventListener('click', clickHandler);
      mainCamera.removeEventListener('movingstarted', startListener);
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
