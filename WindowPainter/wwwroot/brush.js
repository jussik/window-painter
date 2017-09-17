window.opener.onbeforeunload = function () { return window.close(); };
var id = +location.search.substr(1);
var posX, posY;
var color = "black";
document.documentElement.style.background = color;
document.documentElement.addEventListener("click", function () {
    if (color === "black")
        color = "red";
    else
        color = "black";
    document.documentElement.style.background = color;
    paint();
}, false);
function paint() {
    window.opener.paint(posX, posY, innerWidth, innerHeight, color, id);
}
function checkPos() {
    if (posX !== screenX || posY !== screenY) {
        posX = screenX;
        posY = screenY;
        paint();
    }
    window.requestAnimationFrame(checkPos);
}
window.requestAnimationFrame(checkPos);
//# sourceMappingURL=brush.js.map