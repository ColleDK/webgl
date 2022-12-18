window.onload = function init(){
    for(let i = 1; i < 6; i++){
        var ii = document.getElementById("p_"+i);
        ii.addEventListener("click", () => {
            window.location.href = "../lektion1/P"+i+"/W01P"+i+".html"
        })
    }
}