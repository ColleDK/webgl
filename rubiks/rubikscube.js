var Cube = function() {
    this.vertices = [];
    this.colors = [];
    this.indeces = [];
    this.position = [0, 0, 0]
    this.axis = [vec3(-1,0,0),vec3(0,-1,0),vec3(0,0,-1)];
    this.internalMatrix = null;
}

Cube.prototype.init = function(i, j, k){
    this.vertices.push(
        vec3(-1,-1,-1),     vec3(1,-1,-1),      vec3(1, 1,-1),      vec3(-1, 1,-1),
        vec3(-1,-1, 1),     vec3(1,-1, 1),      vec3(1, 1, 1),      vec3(-1, 1, 1),
        vec3(-1,-1,-1),     vec3(-1, 1,-1),     vec3(-1, 1, 1),     vec3(-1,-1, 1),
        vec3(1,-1,-1),      vec3(1, 1,-1),      vec3(1, 1, 1),      vec3(1, -1, 1),
        vec3(-1,-1,-1),     vec3(-1,-1, 1),     vec3(1,-1, 1),      vec3(1,-1,-1),
        vec3(-1, 1,-1),     vec3(-1, 1, 1),     vec3(1, 1, 1),      vec3(1, 1,-1),
    )

    this.internalMatrix = mat4();

    this.indeces.push(
        // Front
        0,1,2, 0,2,3,
        // Back
        4,5,6, 4,6,7,
        // Left
        8,9,10, 8,10,11,
        // Right
        12,13,14, 12,14,15,
        // Bottom
        16,17,18, 16,18,19,
        // Top
        20,21,22, 20,22,23
    )

    this.position = [i-1, j-1, k-1]
}

Cube.prototype.setNormal = function(normals){
    this.normals = normals
}

Cube.prototype.rotate = function(x, y, z){
    let rot_x = rotateX(x);
    let rot_y = rotateY(y);
    let rot_z = rotateZ(z);
    let rotation = mult(rot_x, mult(rot_y, rot_z))

    this.internalMatrix = mult(this.internalMatrix, rotation);
}

var RubiksCube = function(){
    this.cubes = []
}

const AXIS = {
    X: 0,
    Y: 1,
    Z: 2
}

const MOVES = {
    L: "L", 
    REV_L: "l", 
    M: "M", 
    REV_M: "m", 
    R: "R", 
    REV_R: "r", 
    B: "B", 
    REV_B: "b", 
    E: "E",
    REV_E: "e", 
    T: "T", 
    REV_T: "t", 
    F: "F", 
    REV_F: "f",
    S: "S", 
    REV_S: "s", 
    K: "K", 
    REV_K: "k"
}

RubiksCube.prototype.swap = function(x, y, z, swap1, swap2){
    let current_cube = this.cubes[x][y][z]
    var tmp = current_cube.position[swap1];
    current_cube.position[swap1] = current_cube.position[swap2];
    current_cube.position[swap2] = -tmp;
    tmp = current_cube.axis[swap2];
    current_cube.axis[swap2] = negate(current_cube.axis[swap1]);
    current_cube.axis[swap1] = tmp;
}

RubiksCube.prototype.updatePosition = function(face){
    var i, j, k, val;
    switch (face){
      case "L":
        i = AXIS.X; j = AXIS.Z; k = AXIS.Y; val = -1;
        break;
      case "l":
        i = AXIS.X; j = AXIS.Y; k = AXIS.Z; val = -1;
        break;
      case "R":
        i = AXIS.X; j = AXIS.Y; k = AXIS.Z; val = 1;
        break;
      case "r":
        i = AXIS.X; j = AXIS.Z; k = AXIS.Y; val = 1;
      break;
      case "T":
        i = AXIS.Y; j = AXIS.Z; k = AXIS.X; val = 1;
      break;
      case "t":
        i = AXIS.Y; j = AXIS.X; k = AXIS.Z; val = 1;
      break;
      case "B":
        i = AXIS.Y; j = AXIS.X; k = AXIS.Z; val = -1;
      break;
      case "b":
        i = AXIS.Y; j = AXIS.Z; k = AXIS.X; val = -1;
      break;
      case "E":
        i = AXIS.Y; j = AXIS.X; k = AXIS.Z; val = 0;
      break;
      case "e":
        i = AXIS.Y; j = AXIS.Z; k = AXIS.X; val = 0;
      break;
      case "F":
        i = AXIS.Z; j = AXIS.X; k = AXIS.Y; val = 1;
      break;
      case "f":
        i = AXIS.Z; j = AXIS.Y; k = AXIS.X; val = 1;
      break;
      case "S":
        i = AXIS.Z; j = AXIS.X; k = AXIS.Y; val = 0;
      break;
      case "s":
        i = AXIS.Z; j = AXIS.Y; k = AXIS.X; val = 0;
      break;
      case "K":
        i = AXIS.Z; j = AXIS.Y; k = AXIS.X; val = -1;
      break;
      case "k":
        i = AXIS.Z; j = AXIS.X; k = AXIS.Y; val = -1;
      break;
      case "M":
        i = AXIS.X; j = AXIS.Z; k = AXIS.Y; val = 0;
      break;
      case "m":
        i = AXIS.X; j = AXIS.Y; k = AXIS.Z; val = 0;
      break;
    }

    this.cubes.forEach( (c1, x) => {
        c1.forEach((c2, y) => {
            c2.forEach((c3, z) => {
                if (c3.position[i] == val) {
                    this.swap(x, y, z, j, k, val)
                }
            })
        })
    })
}

RubiksCube.prototype.turnFace = function(face){
    var is_clockwise, index, axis;
    switch (face) {
      case "L":
        axis = AXIS.X; index = -1; is_clockwise = 1;
      break;
      case "l":
        axis = AXIS.X; index = -1; is_clockwise = 0;
      break;
      case "M":
        axis = AXIS.X;index = 0;is_clockwise = 1;
      break;
      case "m":
        axis = AXIS.X;index = 0;is_clockwise = 0;
      break;
      case "R":
        axis = AXIS.X; index = 1; is_clockwise = 0;
      break;
      case "r":
        axis = AXIS.X; index = 1; is_clockwise = 1;
      break;
      case "T":
        axis = AXIS.Y;index = 1;is_clockwise = 0;
      break;
      case "t":
        axis = AXIS.Y;index = 1;is_clockwise = 1;
      break;
      case "B":
        axis = AXIS.Y;index = -1;is_clockwise = 1;
      break;
      case "b":
        axis = AXIS.Y;index = -1;is_clockwise = 0;
      break;
      case "E":
        axis = AXIS.Y;index = 0;is_clockwise = 1;
      break;
      case "e":
        axis = AXIS.Y;index = 0;is_clockwise = 0;
      break;
      case "F":
        axis = AXIS.Z;index = 1;is_clockwise = 0;
      break;
      case "f":
        axis = AXIS.Z;index = 1;is_clockwise = 1;
      break;
      case "K":
        axis = AXIS.Z;index = -1;is_clockwise = 1;
      break;
      case "k":
        axis = AXIS.Z;index = -1;is_clockwise = 0;
      break;
      case "S":
        axis = AXIS.Z;index = 0;is_clockwise = 0;
      break;
      case "s":
        axis = AXIS.Z;index = 0;is_clockwise = 1;
      break;
    }

    this.cubes.forEach( function(c1, x){
        c1.forEach(function(c2, y){
            c2.forEach(function(c3, z){
                let current_cube = c3;
                if(current_cube.position[axis] == index){
                    if(!is_clockwise){
                        current_cube.internalMatrix = mult(current_cube.internalMatrix, rotate(90, current_cube.axis[axis]))
                    } else {
                        current_cube.internalMatrix = mult(current_cube.internalMatrix, rotate(90, negate(current_cube.axis[axis])))
                    }
                }
            })
        })
    })
    this.updatePosition(face)
}

const random_amount = 1000;
RubiksCube.prototype.randomize = function(){
    for(let i = 0; i < random_amount; i++){
        var rand = Math.floor(Math.random() * Object.keys(MOVES).length);
        var rand_move = MOVES[Object.keys(MOVES)[rand]];
        this.turnFace(rand_move)
    }
}

RubiksCube.prototype.create = function(sideNum){
    for(let i = 0; i < sideNum; i++){
        this.cubes[i] = new Array(sideNum);
        for(let j = 0; j < sideNum; j++){
            this.cubes[i][j] = new Array(sideNum)
            for(let k = 0; k < sideNum; k++){
                this.cubes[i][j][k] = new Cube()
                this.cubes[i][j][k].init(i, j, k);
            }
        }
    }
    this.randomize();
}