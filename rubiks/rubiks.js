const numObjects = 9
var angle = 0.0;
var radius = 20;
var spacing = 0.1;
var cubeSize = 2.0;
var num_of_sides = 3;

const BLACK = [0.0, 0.0, 0.0, 1.0];
const YELLOW = [1.0, 1.0, 0.0, 1.0];
const WHITE = [1.0, 1.0, 1.0, 1.0];
const ORANGE = [1.0, 0.5, 0.0, 1.0];
const RED = [1.0, 0.0, 0.0, 1.0];
const BLUE = [0.0, 0.0, 1.0, 1.0];
const GREEN = [0.0, 1.0, 0.0, 1.0];
const COLORS = [
  // Back
  YELLOW, YELLOW, YELLOW, YELLOW,
  // Front
  WHITE, WHITE, WHITE, WHITE,
  // Left
  ORANGE, ORANGE, ORANGE, ORANGE,
  // Right
  RED, RED, RED, RED,
  // Bottom
  BLUE, BLUE, BLUE, BLUE,
  // Top
  GREEN, GREEN, GREEN, GREEN,
  // Inside
  BLACK,
];

var vertexColors = [];

/**
 * WebGL init function
 */
window.onload = function init(){
    var canvas = document.getElementById("c");
    canvas.width  = window.innerWidth / 100 * 90;
    canvas.height = window.innerHeight / 100 * 90;

    var gl = canvas.getContext("webgl");

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.enable(gl.DEPTH_TEST);

    var ext = gl.getExtension('OES_element_index_uint');
    if (!ext) {
        console.log('Warning: Unable to use an extension');
    }

    gl.program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(gl.program);

    gl.program.a_Position = gl.getAttribLocation(gl.program, "a_Position");
    gl.program.a_Color = gl.getAttribLocation(gl.program, "a_Color");
    gl.program.u_view = gl.getUniformLocation(gl.program, "u_view");
    gl.program.u_projection = gl.getUniformLocation(gl.program, "u_projection");

    var cube = new RubiksCube()
    cube.create(num_of_sides);

    var rot_x_btn = document.getElementById("rot_x");
    rot_x_btn.addEventListener("click", () => {
        cube.rotateX(2)
    })

    var rot_y_btn = document.getElementById("rot_y");
    rot_y_btn.addEventListener("click", () => {
        cube.rotateY(2)
    })

    var rot_z_btn = document.getElementById("rot_z");
    rot_z_btn.addEventListener("click", () => {
        cube.rotateZ(2)
    })
    /*
    var inc_btn = document.getElementById("inc_btn");
    var red_btn = document.getElementById("red_btn");

    inc_btn.addEventListener("click", () => {
        num_of_sides++;
        var new_cube = new RubiksCube();
        new_cube.create(num_of_sides);

        cube = new_cube;
    })

    red_btn.addEventListener("click", () => {
        num_of_sides--;
        var new_cube = new RubiksCube();
        new_cube.create(num_of_sides);

        cube = new_cube;
    })*/

    var q_rot = new Quaternion();
    var q_inc = new Quaternion();

    initEventHandlers(canvas, q_rot, q_inc);

    function tick(){q_rot = q_rot.multiply(q_inc);render(gl, cube, q_rot); requestAnimationFrame(tick); }
    tick();
}


/**
 * Function for rendering objects
 */
function render(gl, cube, q_rot){
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Create the perspective view
    var fov = 90;
    var apsectRatio = gl.canvas.clientWidth / gl.canvas.clientHeight;
    var projection = perspective(fov, apsectRatio, 1, 100);

    gl.uniformMatrix4fv(gl.program.u_projection, false, flatten(projection));

    var eye = vec3(0, 0, 17);
    var at = vec3(0,0,0);
    var up = vec3(0,1,0);
    // Create translation for quaternion
    var view = lookAt(add(q_rot.apply(eye), at), at, q_rot.apply(up));

    gl.uniformMatrix4fv(gl.program.u_view, false, flatten(view));

    // Iterate all cubes
    cube.cubes.forEach(function (c1, i){
        c1.forEach(function (c2, j){
            c2.forEach(function (_, k){
                const current_cube = cube.cubes[i][j][k]

                // Create the colors to be displayed
                colorDisplay(i, j, k);

                var cBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, flatten(vertexColors), gl.STATIC_DRAW);
                gl.vertexAttribPointer(gl.program.a_Color, 4, gl.FLOAT, false, 0 , 0);
                gl.enableVertexAttribArray(gl.program.a_Color);

                // Create the index buffer
                var indexBuffer = gl.createBuffer();

                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
                gl.bufferData(
                    gl.ELEMENT_ARRAY_BUFFER,
                    new Uint16Array(current_cube.indeces),
                    gl.STATIC_DRAW
                )

                // Create the position buffer
                var buffer = createEmptyArrayBuffer(gl, gl.program.a_Position, 3, gl.FLOAT)
                initArrayBuffer(gl, buffer, current_cube.vertices)

                // Move the cubes away from center point
                var move = translate((i-1)*(cubeSize + spacing), (j-1)*(cubeSize + spacing), (k-1)*(cubeSize + spacing));

                move = mult(current_cube.internalMatrix, move)
        
                var uModel = gl.getUniformLocation(gl.program, "u_model");
                gl.uniformMatrix4fv(uModel, false, flatten(move));
                
                // Draw cube
                gl.drawElements(gl.TRIANGLES, current_cube.indeces.length, gl.UNSIGNED_SHORT, 0);
            });
        });
    });
}

/**
 * Function for getting the color of the cube
 */
function colorDisplay(x, y, z){
    var i;
    for (i = 0; i < vertexColors.length; i++){
      vertexColors[i] = COLORS[i];
    }
    if (x != 0){
      makeBlack(8);
    }
    if (x != num_of_sides - 1){
      makeBlack(12);
    }
    if (y != 0){
      makeBlack(16);
    }
    if (y != num_of_sides - 1){
      makeBlack(20);
    }
    if (z != 0){
      makeBlack(0);
    }
    if (z != num_of_sides - 1){
      makeBlack(4);
    }
    // Any non-surface faces
    function makeBlack(start){
      var i;
      for (i = start; i < start+ 4; i++){
        vertexColors[i] = COLORS[24];
      }
    }
  }

/**
 * Function for creating an empty array buffer
 */
function createEmptyArrayBuffer(gl, a_attribute, num, type) {
    var buffer = gl.createBuffer(); // Create a buffer object

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
    gl.enableVertexAttribArray(a_attribute); // Enable the assignment
    
    return buffer;
}

/**
 * Function for setting data from object onto array buffer
 */
function initArrayBuffer(gl, buffer, data) {
    // Write date into the buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(data), gl.STATIC_DRAW);
}

/**
 * Quaternion rotation
 */
function initEventHandlers(canvas, qrot, qinc) {
    var dragging = false;         // Dragging or not
    var lastX = -1, lastY = -1;   // Last position of the mouse
    var current_action = 0;       // Actions: 0 - none, 1 - orbit
  
    canvas.onmousedown = function (ev) {   // Mouse is pressed
      ev.preventDefault();
      var x = ev.clientX, y = ev.clientY;
      // Start dragging if a mouse is in <canvas>
      var rect = ev.target.getBoundingClientRect();
      if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
        lastX = x; lastY = y;
        dragging = true;
        current_action = ev.button + 1;
      }
    };
  
    canvas.oncontextmenu = function (ev) { ev.preventDefault(); };
  
    canvas.onmouseup = function (ev) {
      var x = ev.clientX, y = ev.clientY;
      if (x === lastX && y === lastY) {
        qinc.setIdentity();
      }
      dragging = false;
      current_action = 0;
    }; // Mouse is released
  
    var g_last = Date.now();
    canvas.onmousemove = function (ev) { // Mouse is moved
      var x = ev.clientX, y = ev.clientY;
      if (dragging) {
        var now = Date.now();
        var elapsed = now - g_last;
        if (elapsed > 20) {
          g_last = now;
          var rect = ev.target.getBoundingClientRect();
          var s_x = ((x - rect.left) / rect.width - 0.5) * 2;
          var s_y = (0.5 - (y - rect.top) / rect.height) * 2;
          var s_last_x = ((lastX - rect.left) / rect.width - 0.5) * 2;
          var s_last_y = (0.5 - (lastY - rect.top) / rect.height) * 2;
          switch (current_action) {
            case 1: { // orbit
              var v1 = new vec3([s_x, s_y, project_to_sphere(s_x, s_y)]);
              var v2 = new vec3([s_last_x, s_last_y, project_to_sphere(s_last_x, s_last_y)]);
              qinc = qinc.make_rot_vec2vec(normalize(v1), normalize(v2));
            }
              break;
          }
          lastX = x, lastY = y;
        }
    }
    };
}

function project_to_sphere(x, y) {
    var r = 2;
    var d = Math.sqrt(x * x + y * y);
    var t = r * Math.sqrt(2);
    var z;
    if (d < r) // Inside sphere
      z = Math.sqrt(r * r - d * d);
    else if (d < t)
      z = 0;
    else       // On hyperbola
      z = t * t / d;
    return z;
}