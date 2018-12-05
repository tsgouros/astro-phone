
var soundList = [
  "Acceleration",
  "Infrared",
  "Iron",
  "Jets",
  "NeutronStar",
  "OuterBlastOpt",
  "OuterBlastXray"
];

var currentlyPlaying;

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
//
// Components of a tour segment:
//    dur -       The duration (milliseconds) of the flight time.
//    next -      The name (id) of the next curve segment on the tour.
//    audio -     Audio that is to be played *at the end* of the tour segment.
//    playWhile - If true, we can start the next tour segment while the audio
//                is playing.  Note that you probably won't be able to read the
//                text in that case unless you're moving slowly.
//    text -      Text that will appear *at the end* of the tour segment.
var tour = {
  // This segment is just a fake, to get everything loaded and ready to go.
  prepreOrbit:{dur: "1000",
               next: "preOrbit",
               audio: "",
               playWhile: false,
               text: "You're looking at data from the Cassiopeia A supernova. Click anywhere on the screen to orbit the data and see it from all angles.  Clicking will move you along to another stop on the tour.",
               textOffset: {x: 0, y: 0, z: -1}
              },
  preOrbit:   {dur: "1000",
               next: "firstOrbit",
               audio: "Iron", // Should be a CasA overview.
               playWhile: true,
               text: "",
               textOffset: {x: 0, y: 0, z: -1}
              },
  
  firstOrbit: {dur: "20000",
               next: "neutronStar",
               audio: "",
               playWhile: false,
               text: "Click to tour some of the details.",
               textOffset: {x: 0, y: 0, z: -1}
              },
  
  neutronStar:{dur: "5000",
               next: "jetsMatter",
               audio: "NeutronStar",
               playWhile: false,
               text: "Neutron Star: \nAt the center of Cas A is a neutron star, a small \nultra-dense star created by the supernova.",
               textOffset: {x: 0, y: 0, z: -1}
              },
  
  jetsMatter: {dur: "5000",
               next: "revShock",
               audio: "Jets",
               playWhile: false,
               text: "Fiducial Jets: \nIn green, two jets of material are seen. \nThese jets funnel material and energy \nduring and after the explosion.",
               textOffset: {x: 0, y: 0, z: -1}
              },
  
  revShock:   {dur: "5000",
               next: "FeK",
               audio: "Acceleration",
               playWhile: false,
               text: "Reverse Shock Sphere: \nThe Cas A supernova remnant acts like a \nrelativistic pinball machine by accelerating \nelectrons to enormous energies. This \narea shows where the acceleration is taking \nplace in an expanding shock wave generated \nby the explosion.",
               textOffset: {x: 0, y: 0, z: -1}
              },
  
  FeK:        {dur: "5000",
               next: "arSpitzer",
               audio: "Iron",
               playWhile: false,
               text: "FeK (Chandra Telescope): \nThe light blue portions of this model \nrepresent radiation from the element \niron as seen in X-ray light from Chandra. \nIron is forged in the very core of the \nstar but ends up on the outside \nof the expanding ring of debris.",
               textOffset: {x: 0, y: 0, z: -1}
              },

  arSpitzer:  {dur: "5000",
               next: "siChandra",
               audio: "Infrared",
               playWhile: false,
               text: "ArII Spitzer Telescope: \nThe yellow portions of the model represent \ninfrared data from the Spitzer Space Telescope. \nThis is cooler debris that has yet to \nbe superheated by a passing shock wave",
               textOffset: {x: 0, y: 0, z: -1}
              },
  
  siChandra:  {dur: "5000",
               next: "outerKnots",
               audio: "OuterBlastXray",
               playWhile: false,
               text: "Si Chandra Telescope: \nThe dark blue colored elements of the model \nrepresent the outer blast wave of the \nexplosion as seen in X-rays by Chandra.",
               textOffset: {x: 0, y: 0, z: -1}
              },
  
  outerKnots: {dur: "5000",
               next: "endOfJet",
               audio: "OuterBlastOpt",
               playWhile: false,
               text: "Outer Knots: \nThe red colored elements of the model represent \nthe outer blast wave of the explosion as seen in \noptical and infrared light, \nmuch of which is silicon.",
               textOffset: {x: 0, y: 0, z: -1}
              },
  
  endOfJet:   {dur: "5000",
               next: "firstOrbit",
               audio: "",
               playWhile: false,
               text: "Look to your left to sight down the green jet toward the neutron star in the middle of the supernova.  The jet does not point directly at the neutron star because it has moved in the 350 years since CasA exploded.",
               textOffset: {x: 0, y: 0, z: -1}
              }
  
};
  

AFRAME.registerComponent('alongpathevent', {
  schema: {default: 1.0},
  init: function() {
    this.update.bind(this);

    // Moves us onto the next path on the tour and begins playing.
    var advanceTourSegment = function() {
      
      // Get the alongpath attribute from the camera entity.
      var el = document.getElementById("mainCamera");
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
    
    var clickHandler = function(event) {
      // TBD: This should stop any audio playing, too.
      
      // First, stop listening for this event.  We'll start listening
      // again after the next segment is completed.
      document.getElementsByTagName('body')[0]
        .removeEventListener('click', clickHandler);

      advanceTourSegment();
    };
    
    this.el.addEventListener('movingended', function(event) {

      // All we really need to do at the end of a curve is to await
      // the command to start the next curve.
      var mainCamera = document.getElementById("mainCamera");

      document.getElementsByTagName('body')[0]
        .addEventListener('click', clickHandler);

      // What path did we just finish?
      var currentPath = mainCamera.getAttribute("alongpath").curve.substring(1)
      
      // Display the text for the (end of the) path.
      var textHolder = document.getElementById("textHolder");
      var textVal = textHolder.getAttribute("text");
      textVal.value = tour[currentPath].text;
      textHolder.setAttribute("text", textVal);
      var pos = mainCamera.getAttribute("position");
      var textPos = textHolder.getAttribute("position");
      offset = tour[currentPath].textOffset;
      textPos = {x: pos.x + offset.x,
                 y: pos.y + offset.y,
                 z: pos.z + offset.z};
      textHolder.setAttribute("position", textPos);

      // Play the audio for the (end of the) path.
      var sound = document.getElementById(tour[currentPath].audio);

      // If there is sound currently playing, stop it.
      if (currentlyPlaying) {
        currentlyPlaying.pause();
      };

      // Play the sound, and set the currently playing pointer.
      if (sound) {
        sound.play();
        currentlyPlaying = sound;
      };

      // If it's ok to hear the sound while moving, advance the tour.
      if (tour[currentPath].playWhile) {
        advanceTourSegment();
      };
      
      // When the clip is over, remove this listener.
      var endedListener = function(event) {
        sound.removeEventListener("ended", endedListener);
      };

      // Set a listener for the end of the audio.  This isn't doing much now.
      if (sound) {      
        sound.addEventListener("ended", endedListener);
      };
    });

    // We want the first click to interrupt the movement of the camera, but
    // after that, we want to let each track play to the end.
    var startListener = function(event) {

//      document.getElementsByTagName('body')[0]
//        .addEventListener('click', clickHandler);

      document.getElementById("mainCamera")
        .removeEventListener('movingstarted', startListener);
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
