var points = []
var normals = []
var angle = 0;
var radius = 3;
var shouldOrbit = true;
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
    var projection = perspective(fov, apsectRatio, 1, 10);

    var uProjection = gl.getUniformLocation(gl.program, "u_projection");
    gl.uniformMatrix4fv(uProjection, false, flatten(mat4()));

    var uLightPosition = gl.getUniformLocation(gl.program, "u_lightPosition");
    gl.uniform4fv(uLightPosition, flatten(vec4(0, 0, -1, 0)));

    var uLightEmission = gl.getUniformLocation(gl.program, "u_lightEmission");
    gl.uniform3fv(uLightEmission, flatten(vec3(1, 1, 1)));

    initTexture(gl);

    function tick(){ if(shouldOrbit){angle+=0.01}; render(gl, points.length, numObjects); requestAnimationFrame(tick); }
    tick();
}

var g_tex_ready = 0;
function initTexture(gl)
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

function render(gl, numPoints, numObjects){
    gl.useProgram(gl.program)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if(g_tex_ready == 6){
        var fov = 90;
        var apsectRatio = gl.canvas.clientWidth / gl.canvas.clientHeight;
        var projection = perspective(fov, apsectRatio, 1, 10);

        var eye = [Math.cos(angle * .5), 0, Math.sin(angle * .5)];
        var at = [0,0,0];
        var up = [0,1,0]
        var camera = lookAt(eye, at, up);

        var uView = gl.getUniformLocation(gl.program, "u_view");
        gl.uniformMatrix4fv(uView, false, flatten(mat4()));

        var view = inverse(camera);
        view[3] = vec4(0, 0, 0, 1)

        var viewDirectionProjectionMatrix = mult(projection, view);
        var viewDirectionProjectionInverseMatrix = inverse(viewDirectionProjectionMatrix);

        var viewDirectionProjectionInverseLocation = gl.getUniformLocation(gl.program, "u_viewDirectionProjectionInverse");
        gl.uniformMatrix4fv(viewDirectionProjectionInverseLocation, false, flatten(viewDirectionProjectionInverseMatrix));

        var rotation = rotateY(0);
        var scale = scalem(0.5, 0.5, 0.5);
        var move = translate(0, 0, 0);
        var model2 = mat4();

        var uModel = gl.getUniformLocation(gl.program, "u_model");
        gl.uniformMatrix4fv(uModel, false, flatten(model2));

        // Get position attribute location
        var vPosition = gl.getAttribLocation(gl.program, "aPosition");
        gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);

        var temp = [
            vec3(-1, -1, 0.999), vec3(1, -1, 0.999),vec3(-1, 1, 0.999),vec3(-1, 1, 0.999),vec3(1, -1, 0.999), vec3(1, 1, 0.999)
        ]

        gl.drawArrays(gl.TRIANGLES, 0, numPoints);
    }
}



function initSphere(gl, polygon, numOfSubdivs){
    points = []
    normals = []

    for (let index = 0; index < polygon.length; index++) {
        divideTriangle(polygon[index], polygon[(index+1)%polygon.length], polygon[(index+2)%polygon.length], numOfSubdivs)
    }

    points.push(vec3(-1, -1, 0.999), vec3(1, -1, 0.999),vec3(-1, 1, 0.999),vec3(-1, 1, 0.999),vec3(1, -1, 0.999), vec3(1, 1, 0.999))

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