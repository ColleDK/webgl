const numObjects = 9
var angle = 0.0;
var radius = 20;
var spacing = 0.2;
var cubeSize = 2.0;

/**
 * WebGL init function
 */
window.onload = function init(){
    var canvas = document.getElementById("c");
    canvas.width  = window.innerWidth / 100 * 90;
    canvas.height = window.innerHeight / 100 * 90;

    var gl = canvas.getContext("webgl");

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.enable(gl.DEPTH_TEST);

    var ext = gl.getExtension('OES_element_index_uint');
    if (!ext) {
        console.log('Warning: Unable to use an extension');
    }

    gl.program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(gl.program);

    gl.program.a_Position = gl.getAttribLocation(gl.program, "a_Position");
    gl.program.a_Normal = gl.getAttribLocation(gl.program, "a_Normal");

    let cube = new RubiksCube()
    cube.create();
    console.log(cube.vertices)

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

    var fov = 90;
    var apsectRatio = gl.canvas.clientWidth / gl.canvas.clientHeight;
    var projection = perspective(fov, apsectRatio, 1, 100);

    var uProjection = gl.getUniformLocation(gl.program, "u_projection");
    gl.uniformMatrix4fv(uProjection, false, flatten(projection));

    var eye = vec3(0, 0, 17);
    var at = vec3(0,0,0);
    var up = vec3(0,1,0);
    var view = lookAt(add(q_rot.apply(eye), at), at, q_rot.apply(up));
    var view_move = translate(-(cubeSize + spacing), -(cubeSize + spacing), -(cubeSize + spacing))
    var new_view = mult(view, view_move)

    var uView = gl.getUniformLocation(gl.program, "u_view");
    gl.uniformMatrix4fv(uView, false, flatten(new_view));

    var uModel = gl.getUniformLocation(gl.program, "u_model");
    gl.uniformMatrix4fv(uModel, false, flatten(mat4()));

    // Draw object
    for(var i = 0; i < 3; i++){
        for(var j = 0; j < 3; j++){
            for(var k = 0; k < 3; k++){
                if(i === 1 && j === 1 && k === 1){
                    // Exclude the inner most point
                } else {
                    const current_cube = cube.cubes[i][j][k];
                    switch(i){
                        case 0:
                            current_cube.setNormal([
                                vec3(1.0, 0.0, 0.0),
                                vec3(1.0, 0.0, 0.0),
                                vec3(1.0, 0.0, 0.0),
                                vec3(1.0, 0.0, 0.0),
                                vec3(1.0, 0.0, 0.0),
                                vec3(0.0, 0.0, 0.0),
                                vec3(0.0, 0.0, 0.0),
                                vec3(0.0, 0.0, 0.0),
                            ])
                            break;
                        case 1:
                            break;
                        case 2:
                            current_cube.setNormal([
                                vec3(0.0, 0.0, 0.0),
                                vec3(0.0, 0.0, 0.0),
                                vec3(0.0, 0.0, 0.0),
                                vec3(0.0, 1.0, 0.0),
                                vec3(0.0, 1.0, 0.0),
                                vec3(0.0, 1.0, 0.0),
                                vec3(0.0, 1.0, 0.0),
                                vec3(0.0, 1.0, 0.0),
                            ])
                            break;
                    }
                    var indexBuffer = gl.createBuffer();

                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
                    gl.bufferData(
                        gl.ELEMENT_ARRAY_BUFFER,
                        new Uint16Array(current_cube.indeces),
                        gl.STATIC_DRAW
                    )
                    var normalBuffer = createEmptyArrayBuffer(gl, gl.program.a_Normal, 3, gl.FLOAT)
                    initArrayBuffer(gl, normalBuffer, current_cube.normals)

                    var buffer = createEmptyArrayBuffer(gl, gl.program.a_Position, 3, gl.FLOAT)
                    initArrayBuffer(gl, buffer, current_cube.vertices)

                    var move = translate(i*(cubeSize + spacing), j*(cubeSize + spacing), k*(cubeSize + spacing));
                    if(i === 1 && j === 2){
                        //var rotation = rotateY(90);
                        //move = mult(move, rotation)
                    }
        
                    var uModel = gl.getUniformLocation(gl.program, "u_model");
                    gl.uniformMatrix4fv(uModel, false, flatten(move));
                
                    gl.drawElements(gl.TRIANGLES, current_cube.indeces.length, gl.UNSIGNED_SHORT, 0);
                }
            }
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