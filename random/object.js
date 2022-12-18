var OBJ = function () {
    this.vertices = []; // Vertices for the object
    this.normals = []; // Normals for the object
    this.model = mat4(); // Model matrix for the object
    this.vBuffer = null; // Position buffer
    this.program = null; // Linked program
}

/**
 * Function that sets the vertices to display a sphere
 */
OBJ.prototype.createSphere = function() {
    this.vertices = []
    let polygon = [
        vec3(0, 0, 1),
        vec3(0, (2 * Math.sqrt(2)) / 3, -1/3),
        vec3(-Math.sqrt(6) / 3, -Math.sqrt(2) / 3, -1/3),
        vec3(Math.sqrt(6) / 3, -Math.sqrt(2) / 3, -1/3)
    ]

    for (let index = 0; index < polygon.length; index++) {
        divideTriangle(polygon[index], polygon[(index+1)%polygon.length], polygon[(index+2)%polygon.length], 5, this.vertices)
    }
}

/**
 * Function that moves the current object and stores the model matrix
 */
OBJ.prototype.move = function(x, y, z){
    let move_model = translate(x, y, z);

    this.model = mult(this.model, move_model);
}

OBJ.prototype.scale = function(x, y, z){
    let scale_model = scalem(x, y, z);

    this.model = mult(this.model, scale_model);
}

/**
 * Helper functions for subdividing into a sphere
 */
function divideTriangle(a, b, c, numOfTimes, vertices){
    if(numOfTimes === 0){
        triangle(a, b, c, vertices);
    } else {
        var ab = mix(a, b, 0.5);
        var ac = mix(a, c, 0.5);
        var bc = mix(b, c, 0.5);

        ab = normalize(ab)
        ac = normalize(ac)
        bc = normalize(bc)

        numOfTimes--;
        divideTriangle(a, ab, ac, numOfTimes, vertices);
        divideTriangle(b, bc, ab, numOfTimes, vertices);
        divideTriangle(c, ac, bc, numOfTimes, vertices);
        divideTriangle(ab, ac, bc, numOfTimes, vertices);
    }
}

function triangle(a, b, c, vertices){
    vertices.push(a, b, c)
}

function normalize(vec){
    const length = Math.sqrt(Math.pow(vec[0], 2) + Math.pow(vec[1], 2) + Math.pow(vec2[2], 2))
    
    return vec3(vec[0] / length, vec[1] / length, vec[2] / length);
}