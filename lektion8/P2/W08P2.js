var angle = 0.0;
var shouldOrbit = true;

window.onload = function init(){
    var canvas = document.getElementById("c");
    var gl = canvas.getContext("webgl");

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

    gl.program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(gl.program);

    gl.program.a_Position = gl.getAttribLocation(gl.program, "a_Position");
    gl.program.a_texturestyle = gl.getAttribLocation(gl.program, "a_texturestyle")
    gl.program.a_shadow = gl.getAttribLocation(gl.program, "a_shadow");

    // Define object data
    var indexedVertices = [
        vec3(-2, -1, -1),
        vec3(2, -1, -1),
        vec3(2, -1, -5),
        vec3(-2, -1, -5),

        // Cube 1
        vec3(0.25, -0.5, -1.25),
        vec3(0.75, -0.5, -1.25),
        vec3(0.75, -0.5, -1.75),
        vec3(0.25, -0.5, -1.75),

        // Cube 2
        vec3(-1, 0, -2.5),
        vec3(-1, -1, -2.5),
        vec3(-1, -1, -3),
        vec3(-1, 0, -3),

        // Cube 1
        vec3(0.25, -0.5, -1.25),
        vec3(0.75, -0.5, -1.25),
        vec3(0.75, -0.5, -1.75),
        vec3(0.25, -0.5, -1.75),
        
        // Cube 2
        vec3(-1, 0, -2.5),
        vec3(-1, -1, -2.5),
        vec3(-1, -1, -3),
        vec3(-1, 0, -3),
    ];

    var faces = [
        0, 1, 2,
        0, 2, 3,

        4, 5, 6,
        4, 6, 7,

        8, 9, 10,
        8, 10, 11,

        12, 13, 14,
        12, 14, 15,

        16, 17, 18,
        16, 18, 19,
    ]

    var textureCoordinates = [
        vec2(0, 0), 
        vec2(1, 0), 
        vec2(1, 1), 
        vec2(0, 1),

        vec2(0, 0), 
        vec2(1, 0), 
        vec2(1, 1), 
        vec2(0, 1),

        vec2(0, 0), 
        vec2(1, 0), 
        vec2(1, 1), 
        vec2(0, 1),

        vec2(0, 0), 
        vec2(1, 0), 
        vec2(1, 1), 
        vec2(0, 1),

        vec2(0, 0), 
        vec2(1, 0), 
        vec2(1, 1), 
        vec2(0, 1),
    ]

    var textureStyles = [
        0.0,
        0.0, 
        0.0,
        0.0,

        1.0,
        1.0,
        1.0,
        1.0,

        1.0,
        1.0,
        1.0,
        1.0,

        1.0,
        1.0,
        1.0,
        1.0,

        1.0,
        1.0,
        1.0,
        1.0,
    ]

    var shadow = [
        0.0,
        0.0, 
        0.0,
        0.0,

        1.0,
        1.0,
        1.0,
        1.0,

        1.0,
        1.0,
        1.0,
        1.0,

        0.0,
        0.0,
        0.0,
        0.0,

        0.0,
        0.0,
        0.0,
        0.0,
    ]
    
    // Create data buffers
    var vBuffer = gl.createBuffer();
    var indexBuffer = gl.createBuffer();
    var texturestyleBuffer = gl.createBuffer();
    var textureShadowBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(
        gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(faces),
        gl.STATIC_DRAW
    )

    // Bind position buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(indexedVertices), gl.STATIC_DRAW);
    
    // Get position attribute location
    gl.vertexAttribPointer(gl.program.a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(gl.program.a_Position);

    gl.bindBuffer(gl.ARRAY_BUFFER, texturestyleBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(textureStyles), gl.STATIC_DRAW);
    
    gl.vertexAttribPointer(gl.program.a_texturestyle, 1, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(gl.program.a_texturestyle);

    gl.bindBuffer(gl.ARRAY_BUFFER, textureShadowBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(shadow), gl.STATIC_DRAW);
    
    gl.vertexAttribPointer(gl.program.a_shadow, 1, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(gl.program.a_shadow);
    
    createTextureBuffer(gl, textureCoordinates)
    loadTexture(gl)
    createTexture(gl)

    var view = mat4()

    var fov = 90;
    var apsectRatio = gl.canvas.clientWidth / gl.canvas.clientHeight;
    var projection = perspective(fov, apsectRatio, 1, 30);

    var uProjection = gl.getUniformLocation(gl.program, "u_projection");
    gl.uniformMatrix4fv(uProjection, false, flatten(projection));

    var uView = gl.getUniformLocation(gl.program, "u_view");
    gl.uniformMatrix4fv(uView, false, flatten(view));

    
    var orbitButton = document.getElementById("orbit_btn");
    orbitButton.addEventListener("click", (event) => {
        shouldOrbit = !shouldOrbit;
    })

    // Draw object
    function tick(){
        if(shouldOrbit){angle+=0.01};
        render(gl, faces); requestAnimationFrame(tick); }
    tick();
}

function render(gl, faces){
    const radius = 2.0
    var lightPos = [radius * Math.sin(angle), 2, radius * Math.cos(angle)];

    var light = lookAt(lightPos, [0, 0, 0], [0, 1, 0])

    const d = -(lightPos[1] - (-1));
    var mp = [
        vec4(1, 0, 0, 0),
        vec4(0, 1, 0, 1/d),
        vec4(0, 0, 1, 0),
        vec4(0, 0, 0, 0),
    ]

    var uMp = gl.getUniformLocation(gl.program, "u_mp");
    gl.uniformMatrix4fv(uMp, false, flatten(mp));
    
    var uLightpos = gl.getUniformLocation(gl.program, "u_lightpos");
    gl.uniformMatrix4fv(uLightpos, false, flatten(light));

    var uLightpos2 = gl.getUniformLocation(gl.program, "u_lightpos2");
    gl.uniform3fv(uLightpos2, lightPos);

    gl.drawElements(gl.TRIANGLES, faces.length, gl.UNSIGNED_SHORT, 0)
}

function createTextureBuffer(gl, coords){
    var texcoordLocation = gl.getAttribLocation(gl.program, "a_texcoord");
    var texturebuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texturebuffer);
    gl.enableVertexAttribArray(texcoordLocation);
    gl.vertexAttribPointer(texcoordLocation, 2, gl.FLOAT, false, 0, 0);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(coords), gl.STATIC_DRAW);
}

function loadTexture(gl) {
    gl.activeTexture(gl.TEXTURE0);
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    var image = document.createElement('img');
    image.crossorigin = 'anonymous';
    image.textarget = gl.TEXTURE_2D;
    image.onload = function(event){
        var image = event.target;
        gl.activeTexture(gl.TEXTURE0);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(image.textarget, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    };
    image.src = './textures/ground.png';
    gl.uniform1i(gl.getUniformLocation(gl.program, "texMap"), 0);
  }

function createTexture(gl) {
    gl.activeTexture(gl.TEXTURE1);
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 1, 1, 0, gl.RGB, gl.UNSIGNED_BYTE, new Uint8Array([255, 0, 0]));
    gl.uniform1i(gl.getUniformLocation(gl.program, "texMap2"), 1);
}