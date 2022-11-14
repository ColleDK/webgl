window.onload = function init(){
    var canvas = document.getElementById("c");
    var gl = canvas.getContext("webgl");

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    console.log("Program is ", program)
    gl.useProgram(program);

    // Define object data
    var indexedVertices = [
        vec3(-1.0, -1.0, -1.0),
        vec3(-1.0, -1.0, 1.0),
        vec3(-1.0, 1.0, -1.0),
        vec3(-1.0, 1.0, 1.0),
        vec3(1.0, -1.0, -1.0),
        vec3(1.0, -1.0, 1.0),
        vec3(1.0, 1.0, -1.0),
        vec3(1.0, 1.0, 1.0),
    ];

    var faces = [
        0, 6, 4,
        0, 2, 6,
        0, 3, 2, 
        0, 1, 3,
        2, 7, 6,
        2, 3, 7,
        4, 6, 7,
        4, 7, 5,
        0, 4, 5,
        0, 5, 1,
        1, 5, 7,
        1, 7, 3
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
    var vPosition = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    var eye = [0,5,-5];
    var at = [0,0,0];
    var up = [0,1,0]
    var view = lookAt(eye, at, up);

    console.log("View " + view);
    var uView = gl.getUniformLocation(program, "u_view");
    gl.uniformMatrix4fv(uView, false, flatten(view));

    var fov = 90;
    var apsectRatio = gl.canvas.clientWidth / gl.canvas.clientWidth;
    var projection = perspective(fov, apsectRatio, -1, 1);

    console.log("Projection " + projection);
    var uProjection = gl.getUniformLocation(program, "u_projection");
    gl.uniformMatrix4fv(uProjection, false, flatten(projection));

    // Draw object
    for(var i = 0; i < 3; i++){
        var scale = scalem(0.5, 0.5, 0.5);
        var move = translate(-1 + i + 0.33 * i, 0, 0);
        var model2 = mult(move, scale);

        console.log("Model " + model2);
        var uModel = gl.getUniformLocation(program, "u_model");
        gl.uniformMatrix4fv(uModel, false, flatten(model2));

        gl.drawElements(gl.LINES, faces.length, gl.UNSIGNED_SHORT, 0);
    }
}