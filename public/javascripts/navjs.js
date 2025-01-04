var lines = document.getElementById("lines");
var sidebar = document.getElementById("sidebar");
var baropen = false;
console.log("Entered Js");

lines.addEventListener('click', function(event){
    console.log("Entered Event listener");
    if(!baropen) {
        event.stopPropagation();
        openbar();
    }
    else {
        event.stopPropagation();
        closebar();
    }
});

function openbar(){
    console.log("Entered openbar");
    sidebar.style.width = "100%";
    sidebar.style.height = "100%";
    baropen = true;
};

function closebar(){
    console.log("Entered closebar");
    sidebar.style.width = "0";
    sidebar.style.height = "0";
    baropen = false;
};