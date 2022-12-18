/**
 * The list of objects added to the view
 */
var objects = []

/**
 * Type of objects supported currently
 */
var types = {
    CUBE: "cube",
    SPHERE: "sphere"
}

/**
 * WebGL init function
 */
window.onload = function init(){
    var canvas = document.getElementById("c");
    canvas.width  = window.innerWidth / 100 * 90;
    canvas.height = window.innerHeight / 100 * 90;

    var gl = canvas.getContext("webgl");

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.enable(gl.DEPTH_TEST);

    var ext = gl.getExtension('OES_element_index_uint');
    if (!ext) {
        console.log('Warning: Unable to use an extension');
    }

    gl.program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(gl.program);

    gl.program.a_Position = gl.getAttribLocation(gl.program, "a_Position");

    var sphere_btn = document.getElementById("sphere_btn");

    sphere_btn.addEventListener("click", (event) => {
        createNewObj(types.SPHERE, gl)
        objects[objects.length - 1].move((objects.length - 1) * 0.3, 0, 0)
        objects[objects.length - 1].scale(1-(objects.length - 1) * 0.1, 1 - (objects.length - 1) * 0.1, 1- (objects.length - 1) * 0.1)
    })

    var background_picker = document.getElementById("color_background");
    background_picker.addEventListener("input", (event) => {
        console.log(event.target.value)
        let color = event.target.value
        let rgb = hexToRgbA(color)
        console.log(rgb)
        gl.clearColor(rgb[0] / 255, rgb[1] / 255, rgb[2] / 255, 1.0);
    })

    canvas.addEventListener("click", (event) => {
        // Get mouse position in draw area
        var bbox = event.target.getBoundingClientRect();
        var mousepos = vec2(
            (2 * ((event.clientX - bbox.left) / canvas.width)) - 1,
            (2 * ((canvas.height - (event.clientY - bbox.top) - 1) / canvas.height)) - 1
        )

        checkRayIntersection(mousepos[0], mousepos[1])
    })

    var q_rot = new Quaternion();
    var q_inc = new Quaternion();

    initEventHandlers(canvas, q_rot, q_inc);

    function tick(){q_rot = q_rot.multiply(q_inc); render(gl, q_rot); requestAnimationFrame(tick); }
    tick();
}

/**
 * Function for rendering objects
 */
function render(gl, q_rot){
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
   /* 
    var vertices = []

    objects.forEach(o => {
        o.vertices.forEach(e => {
            vertices.push(e)
        })
    });

    var fov = 90;
    var apsectRatio = gl.canvas.clientWidth / gl.canvas.clientHeight;
    var projection = perspective(fov, apsectRatio, 1, 100);

    var uProjection = gl.getUniformLocation(gl.program, "u_projection");
    gl.uniformMatrix4fv(uProjection, false, flatten(projection));

    var eye = [1, 1, 1];
    var at = [0,0,0];
    var up = [0,1,0];
    var view = lookAt(eye, at, up);

    var uView = gl.getUniformLocation(gl.program, "u_view");
    gl.uniformMatrix4fv(uView, false, flatten(view));

    var uModel = gl.getUniformLocation(gl.program, "u_model");
    gl.uniformMatrix4fv(uModel, false, flatten(mat4()));

    var buffer = createEmptyArrayBuffer(gl, gl.program.a_Position, 3, gl.FLOAT)
    initArrayBuffer(gl, buffer, vertices)

    gl.drawArrays(gl.TRIANGLES, 0, vertices.length);
*/
    
    objects.forEach(obj => {
        gl.useProgram(obj.program)
        initArrayBuffer(gl, obj)

        var fov = 90;
        var apsectRatio = gl.canvas.clientWidth / gl.canvas.clientHeight;
        var projection = perspective(fov, apsectRatio, 1, 100);

        var uProjection = gl.getUniformLocation(obj.program, "u_projection");
        gl.uniformMatrix4fv(uProjection, false, flatten(projection));

        var eye = vec3(0, 0, 7);
        var at = vec3(0,0,0);
        var up = vec3(0,1,0);
        var view = lookAt(add(q_rot.apply(eye), at), at, q_rot.apply(up));

        var uView = gl.getUniformLocation(obj.program, "u_view");
        gl.uniformMatrix4fv(uView, false, flatten(view));

        var uModel = gl.getUniformLocation(obj.program, "u_model");
        gl.uniformMatrix4fv(uModel, false, flatten(obj.model));

        gl.drawArrays(gl.TRIANGLES, 0, obj.vertices.length);
    });
}


/**
 * Function for creating a new object of a cube or sphere
 */
function createNewObj(type, gl){
    var obj = new OBJ();

    obj.program = initShaders(gl, "vertex-shader", "fragment-shader");
    obj.vBuffer = createEmptyArrayBuffer(gl, obj.program.a_Position, 3, gl.FLOAT)
    obj.program.a_Position = gl.getAttribLocation(obj.program, "a_Position")

    switch(type){
        case types.CUBE:
            //obj.createCube();
            break;
        case types.SPHERE:
            obj.createSphere();
            break;
        default:
            break;
    }

    objects.push(obj)
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
function initArrayBuffer(gl, obj) {
    // Write date into the buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, obj.vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(obj.vertices), gl.STATIC_DRAW);
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
 * Get background color from picker
 */
function getRGBColor(color){
    console.log(hexToRgb(color.value))
}

/**
 * Convert hex color code to RGB
 */
function hexToRgbA(hex){
    var c;
    if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
        c= hex.substring(1).split('');
        if(c.length== 3){
            c= [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c= '0x'+c.join('');
        return [(c>>16)&255, (c>>8)&255, c&255];
    }
    throw new Error('Bad Hex');
}