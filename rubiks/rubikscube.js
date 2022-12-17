var Cube = function() {
    this.vertices = [];
    this.colors = [];
    this.indeces = [];
    this.normals = [];
    this.internalMatrix = null;
}

Cube.prototype.init = function(){
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

RubiksCube.prototype.create = function(sideNum){
    for(let i = 0; i < sideNum; i++){
        this.cubes[i] = new Array(sideNum);
        for(let j = 0; j < sideNum; j++){
            this.cubes[i][j] = new Array(sideNum)
            for(let k = 0; k < sideNum; k++){
                this.cubes[i][j][k] = new Cube()
                this.cubes[i][j][k].init();
            }
        }
    }
}

RubiksCube.prototype.rotateY = function(row){
    this.cubes.forEach(function (c1, _){
        c1.forEach(function (c2, j){
            c2.forEach(function (e, _){
                if(j === row){
                    e.rotate(0, 90, 0)
                }
            });
        });
    });
}

RubiksCube.prototype.rotateX = function(row){
    this.cubes.forEach(function (c1, i){
        c1.forEach(function (c2, _){
            c2.forEach(function (e, _){
                if(i === row){
                    e.rotate(90, 0, 0)
                }
            });
        });
    });
}

RubiksCube.prototype.rotateZ = function(row){
    this.cubes.forEach(function (c1, _){
        c1.forEach(function (c2, _){
            c2.forEach(function (e, k){
                if(k === row){
                    e.rotate(0, 0, 90)
                }
            });
        });
    });
}