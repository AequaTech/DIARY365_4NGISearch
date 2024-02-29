// Make the DIV element draggable:
dragElement(document.getElementById("diary1"));
dragElement(document.getElementById("diary2"));
// dragElement(document.getElementById("collapsibleFilters"));

let windowHeight = $(window).height();
let windowWidth = $(window).width();

let mydivwidth = $('#diary1').width();
let start = 0
function dragElement(elmnt) {
  var pos1 = 100, pos2 = 200, pos3 = 100, pos4 = 200;
  if (document.getElementById(elmnt.id + "header")) {
    // if present, the header is where you move the DIV from:
    document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
  } else {
    // otherwise, move the DIV from anywhere inside the DIV:
    elmnt.onmousedown = dragMouseDown;
    if (elmnt.id == 'diary1'){
      elmnt.style.top = "90px";
      elmnt.style.left = "50px";
    } else if (elmnt.id == 'diary2'){
      elmnt.style.top = "90px";
      elmnt.style.right = "50px";
    } else if (elmnt.id == 'filters'){
      elmnt.style.top = "250px";
      elmnt.style.left = "50px";
    }
  }

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:

    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    // console.log(e)
    if((elmnt.offsetTop - pos2) < (windowHeight-430) && (elmnt.offsetTop - pos2) > 10){
      elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    }
    if((elmnt.offsetLeft - pos1) > 10 && (elmnt.offsetLeft - pos1) < (windowWidth-mydivwidth-10)){
      elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    } 
  }

  function closeDragElement() {
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
  }
}


var coll = document.getElementsByClassName("collapsible");
var i;

for (i = 0; i < coll.length; i++) {
  coll[i].addEventListener("click", function() {
    this.classList.toggle("active");
    var content = this.nextElementSibling;
    if (content.style.maxHeight){
      content.style.maxHeight = null;
    } else {
      content.style.maxHeight = content.scrollHeight + "px";
    } 
  });
}