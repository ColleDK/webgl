window.onload = function init(){
    for(let i = 1; i < 2; i++){
        var ii = document.getElementById("p_"+i);
        ii.addEventListener("click", () => {
            window.location.href = "../lektion10/P"+i+"/W10P"+i+".html"
        })
    }
}