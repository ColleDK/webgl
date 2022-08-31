window.onload = function init(){
    var canvas = document.getElementById("c");
    var gl = canvas.getContext("webgl");
    gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    console.log("Program is ", program)
    gl.useProgram(program);

    // Define object data

    var n = 50;
    var r = 0.5;

    var positions = [vec2(0.0, 0.0)];
    var colors = [vec4(0.0, 1.0, 0.0, 1.0)];
    
    for (let index = 0; index < n + 1; index++) {
        const theta = 2 * Math.PI * (index % n) / n;

        const x = r * Math.cos(theta);
        const y = r * Math.sin(theta);
        positions.push(vec2(x, y))
        colors.push(vec4(0.0, 0.7, 0.0, 1.0));
    }

    // Create data buffers
    var vBuffer = gl.createBuffer();
    var cBuffer = gl.createBuffer();

    // Bind position buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(positions), gl.STATIC_DRAW);
    
    // Get position attribute location
    var vPosition = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);


    // Bind color buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    // Get color attribute position
    var vColor = gl.getAttribLocation(program, "aColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    // Draw object
    gl.drawArrays(gl.TRIANGLE_FAN, 0, positions.length);
}