window.onload = function init(){
    var canvas = document.getElementById("c");
    var gl = canvas.getContext("webgl");
    gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    console.log("Program is ", program)
    gl.useProgram(program);

    // Define object data
    var vertices = [];
    var colors = [];
    var maxVertices = 1000;
    var index = 0; var numPoints = 0;

    // Click listener
    canvas.addEventListener("click", (event) => {
        console.log("New click event " + event.clientX + ", " + event.clientY);
        var mousepos = vec2(2*event.clientX/canvas.width - 1, 2*(canvas.height - event.clientY - 1)/canvas.height - 1);
        console.log("Mouse position " + mousepos);
        vertices.push(mousepos);

        gl.bufferSubData(gl.ARRAY_BUFFER, index * sizeof['vec2'], flatten(vertices))
        console.log("Vertices " + flatten(vertices));

        numPoints = Math.max(numPoints, ++index); index %= maxVertices;
    })
    
    // Create data buffers
    var vBuffer = gl.createBuffer();
    var cBuffer = gl.createBuffer();

    // Bind position buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, maxVertices * sizeof['vec2'], gl.STATIC_DRAW);
    
    // Get position attribute location
    var vPosition = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);


    // Bind color buffer
    //gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    //gl.bufferData(gl.ARRAY_BUFFER, maxVertices * sizeof['vec4'], gl.STATIC_DRAW);

    // Get color attribute position
    var vColor = gl.getUniformLocation(program, "aColor");
    var color = vec4(0.0, 0.0, 0.0, 1.0);
    gl.uniform4fv(vColor, flatten(color));

    //gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    //gl.enableVertexAttribArray(vColor);

    // Draw object
    //gl.drawArrays(gl.TRIANGLES, 0, 3);

    function tick(){ render(gl, numPoints); requestAnimationFrame(tick); }
    tick();
}

function render(gl, numPoints){
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.POINT, 0, numPoints);
}