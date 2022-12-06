var diffuse = 1.0;
var emission = 0.5;
var ambient = 0.5;
var specular = 0.5;
var shininess = 5000;

var radius = 1;
var angle = 0;

window.onload = function init(){
    var canvas = document.getElementById("c");
    var gl = canvas.getContext("webgl");

    var diffuseSlider = document.getElementById("diffuse");
    var emissionSlider = document.getElementById("radiance");
    var ambientSlider = document.getElementById("ambient");
    var specularSlider = document.getElementById("specular");
    var shininessSlider = document.getElementById("shininess");

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

    var ext = gl.getExtension('OES_element_index_uint');
    if (!ext) {
        console.log('Warning: Unable to use an extension');
    }

    gl.program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(gl.program);

    gl.program.a_Position = gl.getAttribLocation(gl.program, "a_Position");
    gl.program.a_Normal = gl.getAttribLocation(gl.program, "a_Normal");
    gl.program.a_Color = gl.getAttribLocation(gl.program, "a_Color");
    
    var model = initVertexBuffers(gl);

    readOBJFile('../../resources/donut2.obj', gl, model, 3, false)

    var eye = [1, 1, 1];
    var at = [0,0,0];
    var up = [0,1,0];
    var view = lookAt(eye, at, up);

    console.log("View " + view);
    var uView = gl.getUniformLocation(gl.program, "u_view");
    gl.uniformMatrix4fv(uView, false, flatten(view));

    var fov = 45;
    var apsectRatio = gl.canvas.clientWidth / gl.canvas.clientHeight;
    var projection = perspective(fov, apsectRatio, 1, 10);

    console.log("Projection " + projection);
    var uProjection = gl.getUniformLocation(gl.program, "u_projection");
    gl.uniformMatrix4fv(uProjection, false, flatten(projection));

    var uLightPosition = gl.getUniformLocation(gl.program, "u_lightPosition");
    gl.uniform4fv(uLightPosition, flatten(vec4(0, 0, -1, 0)));

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

    function tick(){angle+=0.01; render(gl, view, model); requestAnimationFrame(tick); }
    tick();
}

function initVertexBuffers(gl) {
    var o = new Object();
    o.vertexBuffer = createEmptyArrayBuffer(gl, gl.program.a_Position, 3, gl.FLOAT);
    o.normalBuffer = createEmptyArrayBuffer(gl, gl.program.a_Normal, 3, gl.FLOAT);
    o.colorBuffer = createEmptyArrayBuffer(gl, gl.program.a_Color, 4, gl.FLOAT);
    o.indexBuffer = gl.createBuffer();

    return o;
}

function createEmptyArrayBuffer(gl, a_attribute, num, type) {
    var buffer = gl.createBuffer(); // Create a buffer object

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
    gl.enableVertexAttribArray(a_attribute); // Enable the assignment
    
    return buffer;
}

var g_objDoc = null; // Info parsed from OBJ file
var g_drawingInfo = null; // Info for drawing the 3D model with WebGL

function readOBJFile(fileName, gl, model, scale, reverse) {
    var request = new XMLHttpRequest();
    
    request.onreadystatechange = function() {
        if (request.readyState === 4 && request.status !== 404) {
            onReadOBJFile(request.responseText, fileName, gl, model, scale, reverse);
        }
    }
    request.open('GET', fileName, true); // Create a request to get file
    request.send(); // Send the request
}

function onReadOBJFile(fileString, fileName, gl, o, scale, reverse) {
    var objDoc = new OBJDoc(fileName); // Create a OBJDoc object
    var result = objDoc.parse(fileString, scale, reverse);
    if (!result) {
        g_objDoc = null; g_drawingInfo = null;
        console.log("OBJ file parsing error.");
        return;
    }
    g_objDoc = objDoc;
}

function render(gl, view, model){
    if(!g_drawingInfo && g_objDoc && g_objDoc.isMTLComplete()) {
        g_drawingInfo = onReadComplete(gl, model, g_objDoc)
    }

    if(!g_drawingInfo) return;

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var eye = [radius * Math.sin(angle), 1, radius * Math.cos(angle)];
    var at = [0,0,0];
    var up = [0,1,0];
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

    gl.drawElements(gl.TRIANGLES, g_drawingInfo.indices.length, gl.UNSIGNED_INT, 0);
}

function onReadComplete(gl, model, objDoc) {
    // Acquire the vertex coordinates and colors from OBJ file
    var drawingInfo = objDoc.getDrawingInfo();
    
    // Write date into the buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, model.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, drawingInfo.vertices,gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, model.normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, drawingInfo.normals, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, model.colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, drawingInfo.colors, gl.STATIC_DRAW);

    // Write the indices to the buffer object
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, drawingInfo.indices, gl.STATIC_DRAW);
    
    return drawingInfo;
}