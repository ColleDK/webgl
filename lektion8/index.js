window.onload = function init(){
    for(let i = 1; i < 3; i++){
        var ii = document.getElementById("p_"+i);
        ii.addEventListener("click", () => {
            window.location.href = "../lektion8/P"+i+"/W08P"+i+".html"
        })
    }
}