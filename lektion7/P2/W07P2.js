var points = []
var cubePoints = []
var angle = 0;
var radius = 3;
var shouldOrbit = true;
var texSize = 64;
var sphereProjection = [];
var sphereView = [];

window.onload = function init(){
    var canvas = document.getElementById("c");
    var gl = canvas.getContext("webgl");

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.enable(gl.DEPTH_TEST);

    gl.program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.programcube = initShaders(gl, "vertex-shader", "fragment-shader");

    gl.useProgram(gl.program)
    
    var sphereBuffer = setupSphere(gl);
    var cubeBuffer = setupCube(gl);

    function tick(){ if(shouldOrbit){angle+=0.01}; render(gl, points.length, cubePoints.length, sphereBuffer, cubeBuffer); requestAnimationFrame(tick); }
    tick();
}

function render(gl, spherepoints, cubepoints, spherebuffer, cubebuffer){
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    renderSphere(gl, spherepoints, spherebuffer)

    renderCube(gl, cubepoints, cubebuffer)
}

function renderSphere(gl, numPoints, buffer){
    gl.useProgram(gl.program);
    if(g_tex_ready == 6){
        var eye = [-radius * Math.sin(angle), 0, radius * Math.cos(angle)];
        var at = [0,0,0];
        var up = [0,1,0]
        var view = lookAt(eye, at, up);

        sphereView = view;

        var uView = gl.getUniformLocation(gl.program, "u_view");
        gl.uniformMatrix4fv(uView, false, flatten(view));

        var scale = scalem(0.5, 0.5, 0.5);
        var move = translate(0, 0, 0);
        var model2 = mult(move, scale);

        var uModel = gl.getUniformLocation(gl.program, "u_model");
        gl.uniformMatrix4fv(uModel, false, flatten(model2));

        var uViewDirection = gl.getUniformLocation(gl.program, "u_viewDirectionProjectionInverse");
        gl.uniformMatrix4fv(uViewDirection, false, flatten(mat4()));

        var uReflective = gl.getUniformLocation(gl.program, "u_reflective");
        gl.uniform1f(uReflective, 1.0);

        var uEyePosition = gl.getUniformLocation(gl.program, "u_eyePosition");
        gl.uniform3fv(uEyePosition, eye);

        // Get position attribute location
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.vertexAttribPointer(gl.program.a_Position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(gl.program.a_Position);

        gl.drawArrays(gl.TRIANGLES, 0, numPoints);
    }
}

function renderCube(gl, numPoints, buffer){
    gl.useProgram(gl.programcube);
    if(g_tex_ready_cube == 6){
        var uView = gl.getUniformLocation(gl.programcube, "u_view");
        gl.uniformMatrix4fv(uView, false, flatten(mat4()));

        var uModel = gl.getUniformLocation(gl.programcube, "u_model");
        gl.uniformMatrix4fv(uModel, false, flatten(mat4()));

        var invView = inverse(sphereView);

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

function setupCube(gl){
    gl.useProgram(gl.programcube);
    gl.programcube.a_Position = gl.getAttribLocation(gl.programcube, "a_Position");
    var buffer = initVertexBuffers(gl, gl.programcube)

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

function setupSphere(gl){
    gl.useProgram(gl.program);
    gl.program.a_Position = gl.getAttribLocation(gl.program, "a_Position");
    var buffer = initVertexBuffers(gl, gl.program)
    var vertices = [
        vec3(0, 0, 1),
        vec3(0, (2 * Math.sqrt(2)) / 3, -1/3),
        vec3(-Math.sqrt(6) / 3, -Math.sqrt(2) / 3, -1/3),
        vec3(Math.sqrt(6) / 3, -Math.sqrt(2) / 3, -1/3),
    ];

    initSphere(gl, vertices, 8, buffer);

    initSphereTexture(gl);

    var fov = 45;
    var apsectRatio = gl.canvas.clientWidth / gl.canvas.clientHeight;
    var projection = perspective(fov, apsectRatio, 1, 10);

    sphereProjection = projection;

    var uProjection = gl.getUniformLocation(gl.program, "u_projection");
    gl.uniformMatrix4fv(uProjection, false, flatten(projection));

    var uLightPosition = gl.getUniformLocation(gl.program, "u_lightPosition");
    gl.uniform4fv(uLightPosition, flatten(vec4(0, 0, -1, 0)));

    var uLightEmission = gl.getUniformLocation(gl.program, "u_lightEmission");
    gl.uniform3fv(uLightEmission, flatten(vec3(1, 1, 1)));

    return buffer
}

function initSphere(gl, polygon, numOfSubdivs, buffer){
    for (let index = 0; index < polygon.length; index++) {
        divideTriangle(polygon[index], polygon[(index+1)%polygon.length], polygon[(index+2)%polygon.length], numOfSubdivs)
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
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

var g_tex_ready = 0;
function initSphereTexture(gl)
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
            ++g_tex_ready;
        };
        image.src = cubemap[i];
    }
    gl.uniform1i(gl.getUniformLocation(gl.program, "texMap"), 0);
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


function normalize(vec){
    const length = Math.sqrt(Math.pow(vec[0], 2) + Math.pow(vec[1], 2) + Math.pow(vec2[2], 2))
    
    return vec3(vec[0] / length, vec[1] / length, vec[2] / length);
}

function initVertexBuffers(gl, program) {
    return createEmptyArrayBuffer(gl, program.a_Position, 3, gl.FLOAT);
}

function createEmptyArrayBuffer(gl, a_attribute, num, type) {
    var buffer = gl.createBuffer(); // Create a buffer object

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
    gl.enableVertexAttribArray(a_attribute); // Enable the assignment
    return buffer
}