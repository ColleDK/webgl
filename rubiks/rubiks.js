const numObjects = 9
var angle = 0.0;
var radius = 20;
var spacing = 0.1;
var cubeSize = 2.0;
var num_of_sides = 3;
var current_time_spent = 0;
var cubePoints = []

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
    canvas.height = window.innerHeight / 100 * 70;

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
    gl.programcube = initShaders(gl, "vertex-shader-cube", "fragment-shader-cube");
    gl.useProgram(gl.program);

    gl.program.a_Position = gl.getAttribLocation(gl.program, "a_Position");
    gl.program.a_Color = gl.getAttribLocation(gl.program, "a_Color");
    gl.program.u_model = gl.getUniformLocation(gl.program, "u_model");
    gl.program.u_view = gl.getUniformLocation(gl.program, "u_view");
    gl.program.u_projection = gl.getUniformLocation(gl.program, "u_projection");

    var cube = new RubiksCube()
    cube.create(num_of_sides);

    var rot_l_btn = document.getElementById("rot_l");
    rot_l_btn.addEventListener("click", () => {
        cube.turnFace(MOVES.L)
    })

    var rot_l_rev_btn = document.getElementById("rot_rev_l");
    rot_l_rev_btn.addEventListener("click", () => {
        cube.turnFace(MOVES.REV_L)
    })

    var rot_m_btn = document.getElementById("rot_m");
    rot_m_btn.addEventListener("click", () => {
        cube.turnFace(MOVES.M)
    })

    var rot_m_rev_btn = document.getElementById("rot_rev_m");
    rot_m_rev_btn.addEventListener("click", () => {
        cube.turnFace(MOVES.REV_M)
    })

    var rot_r_btn = document.getElementById("rot_r");
    rot_r_btn.addEventListener("click", () => {
        cube.turnFace(MOVES.R)
    })

    var rot_r_rev_btn = document.getElementById("rot_rev_r");
    rot_r_rev_btn.addEventListener("click", () => {
        cube.turnFace(MOVES.REV_R)
    })

    var rot_b_btn = document.getElementById("rot_b");
    rot_b_btn.addEventListener("click", () => {
        cube.turnFace(MOVES.B)
    })

    var rot_b_rev_btn = document.getElementById("rot_rev_b");
    rot_b_rev_btn.addEventListener("click", () => {
        cube.turnFace(MOVES.REV_B)
    })

    var rot_e_btn = document.getElementById("rot_e");
    rot_e_btn.addEventListener("click", () => {
        cube.turnFace(MOVES.E)
    })

    var rot_e_rev_btn = document.getElementById("rot_rev_e");
    rot_e_rev_btn.addEventListener("click", () => {
        cube.turnFace(MOVES.REV_E)
    })

    var rot_t_btn = document.getElementById("rot_t");
    rot_t_btn.addEventListener("click", () => {
        cube.turnFace(MOVES.T)
    })

    var rot_t_rev_btn = document.getElementById("rot_rev_t");
    rot_t_rev_btn.addEventListener("click", () => {
        cube.turnFace(MOVES.REV_T)
    })

    var rot_f_btn = document.getElementById("rot_f");
    rot_f_btn.addEventListener("click", () => {
        cube.turnFace(MOVES.F)
    })

    var rot_f_rev_btn = document.getElementById("rot_rev_f");
    rot_f_rev_btn.addEventListener("click", () => {
        cube.turnFace(MOVES.REV_F)
    })

    var rot_s_btn = document.getElementById("rot_s");
    rot_s_btn.addEventListener("click", () => {
        cube.turnFace(MOVES.S)
    })

    var rot_s_rev_btn = document.getElementById("rot_rev_s");
    rot_s_rev_btn.addEventListener("click", () => {
        cube.turnFace(MOVES.REV_S)
    })

    var rot_k_btn = document.getElementById("rot_k");
    rot_k_btn.addEventListener("click", () => {
        cube.turnFace(MOVES.K)
    })

    var rot_k_rev_btn = document.getElementById("rot_rev_k");
    rot_k_rev_btn.addEventListener("click", () => {
        cube.turnFace(MOVES.REV_K)
    })

    var q_rot = new Quaternion();
    var q_inc = new Quaternion();
    var reset_view_btn = document.getElementById("reset_view");
    reset_view_btn.addEventListener("click", () => {
      q_rot = new Quaternion();
      q_inc.setIdentity();
    })

    initEventHandlers(canvas, q_rot, q_inc);
    setup_timer();

    var cubeBuffer = setupCube(gl);

    function tick(){q_rot = q_rot.multiply(q_inc);render(gl, cube, q_rot, cubeBuffer); requestAnimationFrame(tick); }
    tick();
}

/**
 * Function for rendering objects
 */
function render(gl, cube, q_rot, cubebuffer){
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(gl.program)

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

              move = mult(current_cube.internalMatrix, move);
        
              gl.uniformMatrix4fv(gl.program.u_model, false, flatten(move));
                
              // Draw cube
              gl.drawElements(gl.TRIANGLES, current_cube.indeces.length, gl.UNSIGNED_SHORT, 0);
            });
        });
    });

    renderCube(gl, 10, cubebuffer, view, projection)
}

function setupCube(gl){
  gl.useProgram(gl.programcube);
  gl.programcube.a_Position = gl.getAttribLocation(gl.programcube, "a_Position");
  var buffer = createEmptyArrayBuffer(gl, gl.programcube.a_Position, 3, gl.FLOAT);

  initCube(gl, buffer);

  initCubeTexture(gl);

  var uProjection = gl.getUniformLocation(gl.programcube, "u_projection");
  gl.uniformMatrix4fv(uProjection, false, flatten(mat4()));

  var uLightPosition = gl.getUniformLocation(gl.programcube, "u_lightPosition");
  gl.uniform4fv(uLightPosition, flatten(vec4(0, 0, -1, 0)));

  var uLightEmission = gl.getUniformLocation(gl.programcube, "u_lightEmission");
  gl.uniform3fv(uLightEmission, flatten(vec3(1, 1, 1)));

  return buffer
}

function initCube(gl, buffer){
  cubePoints.push(vec3(-1, -1, 0.999), vec3(1, -1, 0.999), vec3(-1, 1, 0.999), vec3(-1, 1, 0.999), vec3(1, -1, 0.999), vec3(1, 1, 0.999))

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(cubePoints), gl.STATIC_DRAW);
}

function renderCube(gl, numPoints, buffer, sphereView, sphereProjection){
  gl.useProgram(gl.programcube);
  if(g_tex_ready_cube == 6){
      var uView = gl.getUniformLocation(gl.programcube, "u_view");
      gl.uniformMatrix4fv(uView, false, flatten(mat4()));

      var uModel = gl.getUniformLocation(gl.programcube, "u_model");
      gl.uniformMatrix4fv(uModel, false, flatten(mat4()));

      var invView = sphereView;

      invView[3] = vec4(0, 0, 0, 1);

      var viewDir = mult(sphereProjection, invView);

      var uViewDirection = gl.getUniformLocation(gl.programcube, "u_viewDirectionProjectionInverse");
      gl.uniformMatrix4fv(uViewDirection, false, flatten(inverse(viewDir)));

      var uReflective = gl.getUniformLocation(gl.programcube, "u_reflective");
      gl.uniform1f(uReflective, 0.0);

      var uEyePosition = gl.getUniformLocation(gl.programcube, "u_eyePosition");
      gl.uniform3fv(uEyePosition, flatten(vec3(0, 0, 0)));

      // Get position attribute location
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.vertexAttribPointer(gl.programcube.a_Position, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(gl.programcube.a_Position);

      gl.drawArrays(gl.TRIANGLES, 0, numPoints);
  }
}

var g_tex_ready_cube = 0;
function initCubeTexture(gl)
{
    var cubemap = ['textures/cm_left.png', // POSITIVE_X
        'textures/cm_right.png', // NEGATIVE_X
        'textures/cm_top.png', // POSITIVE_Y
        'textures/cm_bottom.png', // NEGATIVE_Y
        'textures/cm_back.png', // POSITIVE_Z
        'textures/cm_front.png' // NEGATIVE_Z
    ]; 

    gl.activeTexture(gl.TEXTURE0);
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    for(var i = 0; i < 6; ++i) {
        var image = document.createElement('img');
        image.crossorigin = 'anonymous';
        image.textarget = gl.TEXTURE_CUBE_MAP_POSITIVE_X + i;
        image.onload = function(event)
        {
            var image = event.target;
            gl.activeTexture(gl.TEXTURE0);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            gl.texImage2D(image.textarget, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
            ++g_tex_ready_cube;
        };
        image.src = cubemap[i];
    }
    gl.uniform1i(gl.getUniformLocation(gl.programcube, "texMap"), 0);
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

/**
 * Function for creating a timer
 */
function setup_timer(){
  var downloadTimer = setInterval(function(){
    document.querySelector("#time").textContent = current_time_spent + " seconds";
    current_time_spent += 1;
  }, 1000);
}