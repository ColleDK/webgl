window.onload = function init(){
    for(let i = 1; i < 11; i++){
        if(i != 9){
            var ii = document.getElementById("l_"+i);
            ii.addEventListener("click", () => {
                window.location.href = "../webgl/lektion"+i+"/index.html"
            })
        }
    }

    var proj = document.getElementById("p_1");
    proj.addEventListener("click", () => {
        window.location.href = "../webgl/rubiks/rubiks.html"
    })
}