window.onload = function init(){
    var canvas = document.getElementById("c");
    var colorSelector = document.getElementById("colorMenu");
    var clearSelector = document.getElementById("clearMenu");
    var clearButton = document.getElementById("clear_btn");
    var drawModeSelector = document.getElementById("drawModeMenu");

    var gl = canvas.getContext("webgl");

    gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    console.log("Program is ", program)
    gl.useProgram(program);

    // Define object data
    var colors = [
        vec4(0.0, 0.0, 0.0, 1.0), // Black
        vec4(1.0, 0.0, 0.0, 1.0), // Red
        vec4(0.0, 1.0, 0.0, 1.0), // Green
        vec4(0.0, 0.0, 1.0, 1.0), // Blue
        vec4(1.0, 1.0, 1.0, 1.0), // White
    ]
    const DRAWMODES = {
        POINT: 0,
        TRIANGLE: 1,
    }
    var maxVertices = 1000;
    var index = 0; var numPoints = 0;
    var triangleVertices = []
    var triangleColors = []
    var triangleIndeces = []


    // Create data buffers
    var vBuffer = gl.createBuffer();
    var cBuffer = gl.createBuffer();

    // Click listener
    canvas.addEventListener("click", (event) => {
        var currentColor = colors[colorSelector.selectedIndex];

        console.log("Current color " + flatten(currentColor))

        // Get mouse position in draw area
        var bbox = event.target.getBoundingClientRect();
        var mousepos = vec2(
            (2 * ((event.clientX - bbox.left) / canvas.width)) - 1,
            (2 * ((canvas.height - (event.clientY - bbox.top) - 1) / canvas.height)) - 1
        )

        // Add the position to the buffer data
        if(drawModeSelector.selectedIndex == DRAWMODES.POINT){
            console.log("Draw mode point")
            while(triangleVertices.length != 0){
                triangleVertices.pop();
                triangleColors.pop();
            }
            gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
            gl.bufferSubData(gl.ARRAY_BUFFER, index * sizeof['vec2'], flatten(mousepos));
            gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
            gl.bufferSubData(gl.ARRAY_BUFFER, index * sizeof['vec4'], flatten(currentColor));
    
            numPoints = Math.max(numPoints, ++index); index %= maxVertices;

        } else if (drawModeSelector.selectedIndex == DRAWMODES.TRIANGLE){
            console.log("Draw mode triangle")
            triangleVertices.push(mousepos);
            triangleColors.push(currentColor);
            if(triangleVertices.length == 3){
                triangleIndeces.push(index);
                for(let i = 0; i < triangleVertices.length; i++){
                    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
                    gl.bufferSubData(gl.ARRAY_BUFFER, index * sizeof['vec2'], flatten(triangleVertices[i]));
                    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
                    gl.bufferSubData(gl.ARRAY_BUFFER, index * sizeof['vec4'], flatten(triangleColors[i]));

                    numPoints = Math.max(numPoints, ++index); index %= maxVertices;
                }
                while(triangleVertices.length != 0){
                    triangleVertices.pop();
                    triangleColors.pop();
                }
            }
        }
    })

    clearButton.addEventListener("click", (event) => {
        var currentColor = colors[clearSelector.selectedIndex];
        gl.clearColor(currentColor[0], currentColor[1], currentColor[2], currentColor[3]);
    })


    // Bind position buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, maxVertices * sizeof['vec2'], gl.STATIC_DRAW);
    
    // Get position attribute location
    var vPosition = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);


    // Bind color buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, maxVertices * sizeof['vec4'], gl.STATIC_DRAW);

    // Get color attribute position
    var vColor = gl.getAttribLocation(program, "aColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    // Draw object
    //gl.drawArrays(gl.TRIANGLES, 0, 3);

    function tick(){ render(gl, numPoints, triangleIndeces); requestAnimationFrame(tick); }
    tick();
}

function render(gl, numPoints, triangleIndeces){
    gl.clear(gl.COLOR_BUFFER_BIT);
    for(let i = 0; i < numPoints; i++){
        console.log("Current i " + i)
        let isTriangle = false
        for(let k = 0; k < triangleIndeces.length; k++){
            console.log(triangleIndeces[k])
            if(triangleIndeces[k] == i){
                isTriangle = true
            }
        }

        if(isTriangle){
            gl.drawArrays(gl.TRIANGLES, i, 3);    
            i += 2;
        } else {
            gl.drawArrays(gl.POINTS, i, 1);
        }
    }
}