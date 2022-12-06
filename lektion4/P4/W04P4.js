var points = []
var angle = 0;
var radius = 3;
var currentSubDivides = 0;
var shouldOrbit = true;

var diffuse = 1.0;
var emission = 0.5;
var ambient = 0.5;
var specular = 0.5;
var shininess = 5000;

window.onload = function init(){
    var canvas = document.getElementById("c");
    var gl = canvas.getContext("webgl");

    var subdivideButton = document.getElementById("subdivide_btn");
    var coarsenButton = document.getElementById("coarsen_btn");
    var orbitButton = document.getElementById("orbit_btn");
    var diffuseSlider = document.getElementById("diffuse");
    var emissionSlider = document.getElementById("radiance");
    var ambientSlider = document.getElementById("ambient");
    var specularSlider = document.getElementById("specular");
    var shininessSlider = document.getElementById("shininess");

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.enable(gl.DEPTH_TEST);

    gl.program = initShaders(gl, "vertex-shader", "fragment-shader");
    console.log("Program is ", gl.program)
    gl.useProgram(gl.program);

    var vertices = [
        vec3(0, 0, 1),
        vec3(0, (2 * Math.sqrt(2)) / 3, -1/3),
        vec3(-Math.sqrt(6) / 3, -Math.sqrt(2) / 3, -1/3),
        vec3(Math.sqrt(6) / 3, -Math.sqrt(2) / 3, -1/3),
    ];

    gl.vBuffer = null;
    initSphere(gl, vertices, currentSubDivides);

    var numObjects = 1;

    var fov = 45;
    var apsectRatio = gl.canvas.clientWidth / gl.canvas.clientHeight;
    var projection = perspective(fov, apsectRatio, 1, 10);

    var uProjection = gl.getUniformLocation(gl.program, "u_projection");
    gl.uniformMatrix4fv(uProjection, false, flatten(projection));

    var uLightPosition = gl.getUniformLocation(gl.program, "u_lightPosition");
    gl.uniform4fv(uLightPosition, flatten(vec4(0, 0, -1, 0)));

    subdivideButton.addEventListener("click", (event) => {
        currentSubDivides = Math.min(currentSubDivides+1, 8)
        initSphere(gl, vertices, currentSubDivides);
    })

    coarsenButton.addEventListener("click", (event) => {
        currentSubDivides = Math.max(currentSubDivides-1, 0)
        initSphere(gl, vertices, currentSubDivides);
    })

    orbitButton.addEventListener("click", (event) => {
        shouldOrbit = !shouldOrbit;
    })

    diffuseSlider.addEventListener("input", (event) => {
        diffuse = event.target.value;
    })

    emissionSlider.addEventListener("input", (event) => {
        emission = event.target.value;
    })

    ambientSlider.addEventListener("input", (event) => {
        ambient = event.target.value;
    })

    specularSlider.addEventListener("input", (event) => {
        specular = event.target.value;
    })
    
    shininessSlider.addEventListener("input", (event) => {
        shininess = event.target.value;
    })

    function tick(){ if(shouldOrbit){angle+=0.01}; render(gl, points.length, numObjects); requestAnimationFrame(tick); }
    tick();
}

function render(gl, numPoints, numObjects){
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    var eye = [radius * Math.sin(angle), 0, radius * Math.cos(angle)];
    var at = [0,0,0];
    var up = [0,1,0]
    var view = lookAt(eye, at, up);

    var uView = gl.getUniformLocation(gl.program, "u_view");
    gl.uniformMatrix4fv(uView, false, flatten(view));

    var uDiffusePosition = gl.getUniformLocation(gl.program, "u_diffuse");
    gl.uniform3fv(uDiffusePosition, flatten(vec3(diffuse, diffuse, diffuse)));

    var uEmissionPosition = gl.getUniformLocation(gl.program, "u_emission");
    gl.uniform3fv(uEmissionPosition, flatten(vec3(emission, emission, emission)));

    var uAmbientPosition = gl.getUniformLocation(gl.program, "u_ambient");
    gl.uniform3fv(uAmbientPosition, flatten(vec3(ambient, ambient, ambient)));

    var uSpecularPosition = gl.getUniformLocation(gl.program, "u_specular");
    gl.uniform3fv(uSpecularPosition, flatten(vec3(specular, specular, specular)));

    var uShininessPosition = gl.getUniformLocation(gl.program, "u_shininess");
    gl.uniform1f(uShininessPosition, shininess);

    // Draw object
    for(var i = 0; i < numObjects; i++){
        var rotation = rotateY(0);
        var scale = scalem(0.5, 0.5, 0.5);
        var move = translate(0, 0, 0);
        var model2 = mult(move, rotation);

        var uModel = gl.getUniformLocation(gl.program, "u_model");
        gl.uniformMatrix4fv(uModel, false, flatten(model2));

        // Get position attribute location
        var vPosition = gl.getAttribLocation(gl.program, "a_Position");
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