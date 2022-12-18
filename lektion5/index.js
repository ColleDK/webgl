window.onload = function init(){
    for(let i = 1; i < 6; i++){
        var ii = document.getElementById("p_"+i);
        ii.addEventListener("click", () => {
            window.location.href = "../lektion5/P"+i+"/W05P"+i+".html"
        })
    }
}