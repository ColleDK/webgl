window.onload = function init(){
    for(let i = 1; i < 3; i++){
        var ii = document.getElementById("p_"+i);
        ii.addEventListener("click", () => {
            window.location.href = "../lektion3/P"+i+"/W03P"+i+".html"
        })
    }
}