var Cube = function() {
    this.vertices = [];
    this.indeces = [];
    this.position = [0, 0, 0]
    this.originalAxis = [vec3(-1,0,0),vec3(0,-1,0),vec3(0,0,-1)];
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
    this.originalPosition = [i-1, j-1, k-1]
}

Cube.prototype.setNormal = function(normals){
    this.normals = normals
}

Cube.prototype.rotate = function(angle, v){
    let rotation = rotate(angle, v)

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
    LEFT: "left", 
    REV_LEFT: "rev_left", 
    MIDDLE_Y: "middle_y", 
    REV_MIDDLE_Y: "rev_middle_y", 
    RIGHT: "right", 
    REV_RIGHT: "rev_right", 
    BOTTOM: "bottom", 
    REV_BOTTOM: "rev_bottom", 
    MIDDLE_X: "middle_x",
    REV_MIDDLE_X: "rev_middle_x", 
    TOP: "top", 
    REV_TOP: "rev_top", 
    FRONT: "front", 
    REV_FRONT: "rev_front",
    MIDDLE_Z: "middle_z", 
    REV_MIDDLE_Z: "rev_middle_z", 
    BACK: "back", 
    REV_BACK: "rev_back"
}

RubiksCube.prototype.swap = function(x, y, z, pos1, pos2){
    let current_cube = this.cubes[x][y][z]
    var tmp = current_cube.position[pos1];
    current_cube.position[pos1] = current_cube.position[pos2];
    current_cube.position[pos2] = -tmp;
    tmp = current_cube.axis[pos2];
    current_cube.axis[pos2] = negate(current_cube.axis[pos1]);
    current_cube.axis[pos1] = tmp;
}

RubiksCube.prototype.updateCubes = function(move){
    var i, j, k, val;
    switch (move){
      case MOVES.LEFT:
        i = AXIS.X; j = AXIS.Z; k = AXIS.Y; val = -1;
        break;
      case MOVES.REV_LEFT:
        i = AXIS.X; j = AXIS.Y; k = AXIS.Z; val = -1;
        break;
      case MOVES.RIGHT:
        i = AXIS.X; j = AXIS.Y; k = AXIS.Z; val = 1;
        break;
      case MOVES.REV_RIGHT:
        i = AXIS.X; j = AXIS.Z; k = AXIS.Y; val = 1;
      break;
      case MOVES.TOP:
        i = AXIS.Y; j = AXIS.Z; k = AXIS.X; val = 1;
      break;
      case MOVES.REV_TOP:
        i = AXIS.Y; j = AXIS.X; k = AXIS.Z; val = 1;
      break;
      case MOVES.BOTTOM:
        i = AXIS.Y; j = AXIS.X; k = AXIS.Z; val = -1;
      break;
      case MOVES.REV_BOTTOM:
        i = AXIS.Y; j = AXIS.Z; k = AXIS.X; val = -1;
      break;
      case MOVES.MIDDLE_X:
        i = AXIS.Y; j = AXIS.X; k = AXIS.Z; val = 0;
      break;
      case MOVES.REV_MIDDLE_X:
        i = AXIS.Y; j = AXIS.Z; k = AXIS.X; val = 0;
      break;
      case MOVES.FRONT:
        i = AXIS.Z; j = AXIS.X; k = AXIS.Y; val = 1;
      break;
      case MOVES.REV_FRONT:
        i = AXIS.Z; j = AXIS.Y; k = AXIS.X; val = 1;
      break;
      case MOVES.MIDDLE_Z:
        i = AXIS.Z; j = AXIS.X; k = AXIS.Y; val = 0;
      break;
      case MOVES.REV_MIDDLE_Z:
        i = AXIS.Z; j = AXIS.Y; k = AXIS.X; val = 0;
      break;
      case MOVES.BACK:
        i = AXIS.Z; j = AXIS.Y; k = AXIS.X; val = -1;
      break;
      case MOVES.REV_BACK:
        i = AXIS.Z; j = AXIS.X; k = AXIS.Y; val = -1;
      break;
      case MOVES.MIDDLE_Y:
        i = AXIS.X; j = AXIS.Z; k = AXIS.Y; val = 0;
      break;
      case MOVES.REV_MIDDLE_Y:
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

RubiksCube.prototype.rotateMove = function(move){
    var is_clockwise, index, axis;
    switch (move) {
      case MOVES.LEFT:
        axis = AXIS.X; index = -1; is_clockwise = true;
      break;
      case MOVES.REV_LEFT:
        axis = AXIS.X; index = -1; is_clockwise = false;
      break;
      case MOVES.MIDDLE_Y:
        axis = AXIS.X;index = 0;is_clockwise = true;
      break;
      case MOVES.REV_MIDDLE_Y:
        axis = AXIS.X;index = 0;is_clockwise = false;
      break;
      case MOVES.RIGHT:
        axis = AXIS.X; index = 1; is_clockwise = false;
      break;
      case MOVES.REV_RIGHT:
        axis = AXIS.X; index = 1; is_clockwise = true;
      break;
      case MOVES.TOP:
        axis = AXIS.Y;index = 1;is_clockwise = false;
      break;
      case MOVES.REV_TOP:
        axis = AXIS.Y;index = 1;is_clockwise = true;
      break;
      case MOVES.BOTTOM:
        axis = AXIS.Y;index = -1;is_clockwise = true;
      break;
      case MOVES.REV_BOTTOM:
        axis = AXIS.Y;index = -1;is_clockwise = false;
      break;
      case MOVES.MIDDLE_X:
        axis = AXIS.Y;index = 0;is_clockwise = true;
      break;
      case MOVES.REV_MIDDLE_X:
        axis = AXIS.Y;index = 0;is_clockwise = false;
      break;
      case MOVES.FRONT:
        axis = AXIS.Z;index = 1;is_clockwise = false;
      break;
      case MOVES.REV_FRONT:
        axis = AXIS.Z;index = 1;is_clockwise = true;
      break;
      case MOVES.BACK:
        axis = AXIS.Z;index = -1;is_clockwise = true;
      break;
      case MOVES.REV_BACK:
        axis = AXIS.Z;index = -1;is_clockwise = false;
      break;
      case MOVES.MIDDLE_Z:
        axis = AXIS.Z;index = 0;is_clockwise = false;
      break;
      case MOVES.REV_MIDDLE_Z:
        axis = AXIS.Z;index = 0;is_clockwise = true;
      break;
    }

    var angle = 10;
    var rotationTimer = setInterval(() =>{
        this.cubes.forEach( function(c1, x){
            c1.forEach(function(c2, y){
                c2.forEach(function(c3, z){
                    let current_cube = c3;
                    if(current_cube.position[axis] == index){
                        if(!is_clockwise){
                            current_cube.rotate(10, current_cube.axis[axis])
                        } else {
                            current_cube.rotate(10, negate(current_cube.axis[axis]))
                        }
                    }
                })
            })
        })
        if(angle == 90){
            clearInterval(rotationTimer);
        } 
        angle += 10;
        this.updateCubes(move)
    }, 10);
}

const random_amount = 50;
RubiksCube.prototype.randomize = function(){
    let i = 0;
    var randomTimer = setInterval(() =>{
        if(i == random_amount){
            clearInterval(randomTimer)
        } else {
            var rand = Math.floor(Math.random() * Object.keys(MOVES).length);
            var rand_move = MOVES[Object.keys(MOVES)[rand]];
            this.rotateMove(rand_move)
            i++;
        }
    }, 200);
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