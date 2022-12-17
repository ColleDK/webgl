var Cube = function() {
    this.vertices = [];
    this.colors = [];
    this.indeces = [];
    this.normals = [];
    this.internalMatrix = null;
}

Cube.prototype.init = function(){
    this.vertices.push(
        vec3(-1.0, -1.0, -1.0),
        vec3(-1.0, -1.0, 1.0),
        vec3(-1.0, 1.0, -1.0),
        vec3(-1.0, 1.0, 1.0),
        vec3(1.0, -1.0, -1.0),
        vec3(1.0, -1.0, 1.0),
        vec3(1.0, 1.0, -1.0),
        vec3(1.0, 1.0, 1.0),
    )

    this.indeces.push(
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
    )
}

Cube.prototype.setNormal = function(normals){
    this.normals = normals
}

Cube.prototype.rotate = function(x, y, z){
    this.internalMatrix = rotateX(x);
}

var RubiksCube = function(){
    this.cubes = []
}

RubiksCube.prototype.create = function(){
    for(let i = 0; i < 3; i++){
        this.cubes[i] = new Array(3);
        for(let j = 0; j < 3; j++){
            this.cubes[i][j] = new Array(3)
            for(let k = 0; k < 3; k++){
                this.cubes[i][j][k] = new Cube()
                this.cubes[i][j][k].init();
            }
        }
    }
}