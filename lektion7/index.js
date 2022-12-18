window.onload = function init(){
    for(let i = 1; i < 4; i++){
        var ii = document.getElementById("p_"+i);
        ii.addEventListener("click", () => {
            window.location.href = "../lektion7/P"+i+"/W07P"+i+".html"
        })
    }
}