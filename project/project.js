/**
 * The list of objects added to the view
 */
var objects = []

/**
 * Type of objects supported currently
 */
var types = {
    CUBE: "cube",
    SPHERE: "sphere"
}

/**
 * WebGL init function
 */
window.onload = function init(){
    var canvas = document.getElementById("c");
    canvas.width  = window.innerWidth / 100 * 90;
    canvas.height = window.innerHeight / 100 * 90;

    var gl = canvas.getContext("webgl");

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.enable(gl.DEPTH_TEST);

    var ext = gl.getExtension('OES_element_index_uint');
    if (!ext) {
        console.log('Warning: Unable to use an extension');
    }

    gl.program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(gl.program);

    gl.program.a_Position = gl.getAttribLocation(gl.program, "a_Position");

    var sphere_btn = document.getElementById("sphere_btn");

    sphere_btn.addEventListener("click", (event) => {
        createNewObj(types.SPHERE, gl)
        objects[objects.length - 1].move((objects.length - 1) * 0.3, 0, 0)
        objects[objects.length - 1].scale(1-(objects.length - 1) * 0.1, 1 - (objects.length - 1) * 0.1, 1- (objects.length - 1) * 0.1)
    })

    function tick(){render(gl); requestAnimationFrame(tick); }
    tick();
}

/**
 * Function for rendering objects
 */
function render(gl){
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
   /* 
    var vertices = []

    objects.forEach(o => {
        o.vertices.forEach(e => {
            vertices.push(e)
        })
    });

    var fov = 90;
    var apsectRatio = gl.canvas.clientWidth / gl.canvas.clientHeight;
    var projection = perspective(fov, apsectRatio, 1, 100);

    var uProjection = gl.getUniformLocation(gl.program, "u_projection");
    gl.uniformMatrix4fv(uProjection, false, flatten(projection));

    var eye = [1, 1, 1];
    var at = [0,0,0];
    var up = [0,1,0];
    var view = lookAt(eye, at, up);

    var uView = gl.getUniformLocation(gl.program, "u_view");
    gl.uniformMatrix4fv(uView, false, flatten(view));

    var uModel = gl.getUniformLocation(gl.program, "u_model");
    gl.uniformMatrix4fv(uModel, false, flatten(mat4()));

    var buffer = createEmptyArrayBuffer(gl, gl.program.a_Position, 3, gl.FLOAT)
    initArrayBuffer(gl, buffer, vertices)

    gl.drawArrays(gl.TRIANGLES, 0, vertices.length);
*/
    
    objects.forEach(obj => {
        gl.useProgram(obj.program)
        initArrayBuffer(gl, obj)

        var fov = 90;
        var apsectRatio = gl.canvas.clientWidth / gl.canvas.clientHeight;
        var projection = perspective(fov, apsectRatio, 1, 100);

        var uProjection = gl.getUniformLocation(obj.program, "u_projection");
        gl.uniformMatrix4fv(uProjection, false, flatten(projection));

        var eye = [1, 1, 1];
        var at = [0,0,0];
        var up = [0,1,0];
        var view = lookAt(eye, at, up);

        var uView = gl.getUniformLocation(obj.program, "u_view");
        gl.uniformMatrix4fv(uView, false, flatten(view));

        var uModel = gl.getUniformLocation(obj.program, "u_model");
        gl.uniformMatrix4fv(uModel, false, flatten(obj.model));

        gl.drawArrays(gl.TRIANGLES, 0, obj.vertices.length);
    });
}


/**
 * Function for creating a new object of a cube or sphere
 */
function createNewObj(type, gl){
    var obj = new OBJ();

    obj.program = initShaders(gl, "vertex-shader", "fragment-shader");
    obj.vBuffer = createEmptyArrayBuffer(gl, obj.program.a_Position, 3, gl.FLOAT)
    obj.program.a_Position = gl.getAttribLocation(obj.program, "a_Position")

    switch(type){
        case types.CUBE:
            //obj.createCube();
            break;
        case types.SPHERE:
            obj.createSphere();
            break;
        default:
            break;
    }

    objects.push(obj)
}

/**
 * Function for creating an empty array buffer
 */
function createEmptyArrayBuffer(gl, a_attribute, num, type) {
    var buffer = gl.createBuffer(); // Create a buffer object

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
    gl.enableVertexAttribArray(a_attribute); // Enable the assignment
    
    return buffer;
}

/**
 * Function for setting data from object onto array buffer
 */
function initArrayBuffer(gl, obj) {
    // Write date into the buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, obj.vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(obj.vertices), gl.STATIC_DRAW);
}