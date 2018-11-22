
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

AFRAME.registerComponent('gltf-color', {
  schema: {default: {r: 0.5, g: 0.5, b: 0.6}},
  init: function() {
    console.log("This is this:", this);
    console.log("gltf-color1:", this.data.split(" ").map(Number));
    
    this.el.addEventListener('model-loaded', function(event) {
      console.log("no, this is this:", this, event);
      var mesh = event.target.getObject3D('mesh');
      if (!mesh) { console.log("********* oops, no mesh"); return; }
      //var colorArray = this.data.split(" ").map(Number);
      mesh.traverse(function(node) {
        if (node.isMesh) {
          node.material.color = {r: 0.1, //colorArray[0],
                                 g: 0.5, //colorArray[1],
                                 b: 0.8}; //colorArray[2]};
          node.material.transparent = true;
          node.material.needsUpdate = true;
        }
      });
    });
  },
  setColor: function(mesh, color) {
    // Accepts an object (mesh) and a string with three numbers (0-1)
    // in it, and sets the color of the given asset accordingly.
    var colorArray = d.split(" ").map(Number);
    mesh.traverse(function(node) {
      if (node.isMesh) {
        node.material.color = {r: colorArray[0],
                               g: colorArray[1],
                               b: colorArray[2]},
        node.material.transparent = true;
        node.material.needsUpdate = true;
      }
    });
  }
});
                            

AFRAME.registerComponent('alongpathevent', {
  schema: {default: 1.0},
  init: function() {
    this.update.bind(this);
    this.el.addEventListener('movingended', function(event) {
      console.log("object event:", event);
      console.log(this);
      var el = event.target;
      console.log(this);
      console.log(el);
    });
    this.el.addEventListener('movingstarted', function(event) {
      console.log("object event:", event);});
    this.el.addEventListener('click', function(event) {
      console.log("click!!!", event);
      var el = document.getElementById("mainCamera");
      el.setAttribute("alongpath", "curve: #track2; dur: 5000");
    });

  },
  update: function() {
    console.log("something happened!");
  }
});
