var texSize = 64;
var myTexels = new Uint8Array(4*texSize*texSize);

window.onload = function init(){
    var canvas = document.getElementById("c");
    var gl = canvas.getContext("webgl");

    var wrappingSelector = document.getElementById("textureWrapping");
    var magnificationSelector = document.getElementById("textureMagnification");
    var minificationSelector = document.getElementById("textureMinification");

    var wrappingModes = [
        gl.CLAMP_TO_EDGE,
        gl.REPEAT
    ]

    var magnificationModes = [
        gl.NEAREST,
        gl.NEAREST + 1
    ]

    var minificationModes = [
        gl.NEAREST,
        gl.NEAREST + 1,
        gl.NEAREST_MIPMAP_NEAREST,
        gl.NEAREST_MIPMAP_NEAREST + 1,
        gl.NEAREST_MIPMAP_NEAREST + 2,
        gl.NEAREST_MIPMAP_NEAREST + 3
    ]

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

    gl.program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(gl.program);

    gl.program.a_Position = gl.getAttribLocation(gl.program, "a_Position");

    // Define object data
    var indexedVertices = [
        vec3(-4, -1, -1),
        vec3(4, -1, -1),
        vec3(4, -1, -21),
        vec3(-4, -1, -21),
    ];

    var faces = [
        0, 1, 2,
        0, 2, 3
    ]

    var textureCoordinates = [
        vec2(-1.5, 0), 
        vec2(2.5, 0), 
        vec2(2.5, 10), 
        vec2(-1.5, 10)
    ]
    
    // Create data buffers
    var vBuffer = gl.createBuffer();
    var indexBuffer = gl.createBuffer();

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
    var vPosition = gl.getAttribLocation(gl.program, "a_Position");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    var view = mat4()

    var fov = 90;
    var apsectRatio = gl.canvas.clientWidth / gl.canvas.clientHeight;
    var projection = perspective(fov, apsectRatio, 1, 30);

    var uProjection = gl.getUniformLocation(gl.program, "u_projection");
    gl.uniformMatrix4fv(uProjection, false, flatten(projection));

    var uView = gl.getUniformLocation(gl.program, "u_view");
    gl.uniformMatrix4fv(uView, false, flatten(view));
    
    bindTexture(gl, textureCoordinates)

    function tick(){
        const wrapmode = wrappingModes[wrappingSelector.selectedIndex];
        const minimode = minificationModes[minificationSelector.selectedIndex];
        const magnimode = magnificationModes[magnificationSelector.selectedIndex];render(gl, faces, wrapmode, minimode, magnimode); requestAnimationFrame(tick); }
    tick();
}

function render(gl, faces, wrapmode, minimode, magnimode){
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapmode);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapmode);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minimode);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, magnimode);
    
    gl.drawElements(gl.TRIANGLES, faces.length, gl.UNSIGNED_SHORT, 0);
}

// Texture part
function bindTexture(gl, coords){
        var texcoordLocation = gl.getAttribLocation(gl.program, "a_texcoord");
        var texturebuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, texturebuffer);
        gl.enableVertexAttribArray(texcoordLocation);
        gl.vertexAttribPointer(texcoordLocation, 2, gl.FLOAT, false, 0, 0);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(coords), gl.STATIC_DRAW);
    
        createCheckerboard();
        
        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, myTexels);
        gl.generateMipmap(gl.TEXTURE_2D);
}

function createCheckerboard() {
    for(var i = 0; i < texSize; ++i){
        for(var j = 0; j < texSize; ++j){
            var patchx = Math.floor(i/(texSize/8));
            var patchy = Math.floor(j/(texSize/8));
            var c = (patchx%2 !== patchy%2 ? 255 : 0);
            var idx = 4*(i*texSize + j);
            myTexels[idx] = myTexels[idx + 1] = myTexels[idx + 2] = c;
            myTexels[idx + 3] = 255;
        }
    }
}