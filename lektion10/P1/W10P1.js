var points = []
var normals = []
var radius = 3;
var texSize = 64;

window.onload = function init(){
    var canvas = document.getElementById("c");
    var gl = canvas.getContext("webgl");

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

    gl.program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(gl.program);

    var vertices = [
        vec3(0, 0, 1),
        vec3(0, (2 * Math.sqrt(2)) / 3, -1/3),
        vec3(-Math.sqrt(6) / 3, -Math.sqrt(2) / 3, -1/3),
        vec3(Math.sqrt(6) / 3, -Math.sqrt(2) / 3, -1/3),
    ];

    gl.vBuffer = null;
    initSphere(gl, vertices, 8);

    var numObjects = 1;

    var fov = 45;
    var apsectRatio = gl.canvas.clientWidth / gl.canvas.clientHeight;
    var projection = perspective(fov, apsectRatio, 1, 100);

    var uProjection = gl.getUniformLocation(gl.program, "u_projection");
    gl.uniformMatrix4fv(uProjection, false, flatten(projection));

    var uLightPosition = gl.getUniformLocation(gl.program, "u_lightPosition");
    gl.uniform4fv(uLightPosition, flatten(vec4(0, 0, -1, 0)));

    var uLightEmission = gl.getUniformLocation(gl.program, "u_lightEmission");
    gl.uniform3fv(uLightEmission, flatten(vec3(1, 1, 1)));

    loadTexture(gl);

    var z_eye = 7;
    var pan = vec2(0, 0)
    var q_rot = new Quaternion();
    var q_inc = new Quaternion();

    initEventHandlers(canvas, q_rot, q_inc, z_eye, pan);

    function tick(){q_rot = q_rot.multiply(q_inc);render(gl, points.length, numObjects, q_rot, q_inc, z_eye, pan[0], pan[1]); requestAnimationFrame(tick); }
    tick();
}

function initEventHandlers(canvas, qrot, qinc, z_eye, pan) {
    var dragging = false;         // Dragging or not
    var lastX = -1, lastY = -1;   // Last position of the mouse
    var current_action = 0;       // Actions: 0 - none, 1 - orbit, 2 - dolly, 3 - pan
  
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
            case 2: { // dolly
                z_eye += (s_y - s_last_y) * z_eye
                z_eye = Math.max(z_eye, 0.01);
            }
              break;
            case 3: { // pan
                console.log("x_pan:" + pan[0])
                console.log("y_pan:" + pan[1])
                pan[0] += (s_x - s_last_x) * z_eye * 0.25;
                pan[1] += (s_y - s_last_y) * z_eye * 0.25;
                
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

function loadTexture(gl) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
  
    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    const pixel = new Uint8Array([0, 0, 255, 255]); // opaque blue
    gl.texImage2D(
      gl.TEXTURE_2D,
      level,
      internalFormat,
      width,
      height,
      border,
      srcFormat,
      srcType,
      pixel
    );
  
    const image = new Image();
    image.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(
        gl.TEXTURE_2D,
        level,
        internalFormat,
        srcFormat,
        srcType,
        image
      );

      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    };
    image.src = 'earth.jpg';
  
    return texture;
  }

function render(gl, numPoints, numObjects, q_rot, q_inc, z_eye, x_pan, y_pan){
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    var e = vec3(0, 0, z_eye)
    var a = vec3(0, 0, 0)
    var y = vec3(0, 1, 0)
    var x = vec3(1, 0, 0)

    var c = add(q_rot.apply(x), q_rot.apply(y));
    console.log("c:" + c)

    var c1 = vec3(x_pan * c[0] + y_pan * c[0], x_pan * c[1] + y_pan * c[1], x_pan * c[2] + y_pan * c[2])
    var c2 = vec3(a[0] - c1[0], a[1] - c1[1], a[2] - c1[2])

    var view = lookAt(add(q_rot.apply(e), c2), c2, q_rot.apply(y));

    var uView = gl.getUniformLocation(gl.program, "u_view");
    gl.uniformMatrix4fv(uView, false, flatten(view));

    // Draw object
    for(var i = 0; i < numObjects; i++){
        var scale = scalem(0.5, 0.5, 0.5);
        var move = translate(0, 0, 0);
        var model2 = mult(move, scale);

        var uModel = gl.getUniformLocation(gl.program, "u_model");
        gl.uniformMatrix4fv(uModel, false, flatten(mat4()));

        // Get position attribute location
        var vPosition = gl.getAttribLocation(gl.program, "aPosition");
        gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);

        gl.drawArrays(gl.TRIANGLES, 0, numPoints);
    }
}

function initSphere(gl, polygon, numOfSubdivs){
    points = []
    normals = []

    for (let index = 0; index < polygon.length; index++) {
        divideTriangle(polygon[index], polygon[(index+1)%polygon.length], polygon[(index+2)%polygon.length], numOfSubdivs)
    }

    gl.deleteBuffer(gl.vBuffer);
    gl.vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
    

}

function divideTriangle(a, b, c, numOfTimes){
    if(numOfTimes === 0){
        triangle(a, b, c);
    } else {
        var ab = mix(a, b, 0.5);
        var ac = mix(a, c, 0.5);
        var bc = mix(b, c, 0.5);

        ab = normalize(ab)
        ac = normalize(ac)
        bc = normalize(bc)

        numOfTimes--;
        divideTriangle(a, ab, ac, numOfTimes);
        divideTriangle(b, bc, ab, numOfTimes);
        divideTriangle(c, ac, bc, numOfTimes);
        divideTriangle(ab, ac, bc, numOfTimes);
    }
}

function triangle(a, b, c){
    points.push(a, b, c)
}

function normalize(vec){
    const length = Math.sqrt(Math.pow(vec[0], 2) + Math.pow(vec[1], 2) + Math.pow(vec2[2], 2))
    
    return vec3(vec[0] / length, vec[1] / length, vec[2] / length);
}