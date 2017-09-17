var paintingId = location.pathname.split('/').pop();

var brushes = [];
function openBrush() {
    var brush = <any>{};
    var brushId = brushes.push(brush) - 1;
    brush.win = window.open("/brush.html?" + brushId,
        "_blank",
        "top=" + (window.screenY + 100) +
        ",left=" + (window.screenX + 100) +
        ",width=" + (200 * devicePixelRatio) +
        ",height=" + (200 * devicePixelRatio));;
    brush.shadow = document.createElement("div");
    brush.shadow.classList.add("shadow");
    document.body.appendChild(brush.shadow);
    brush.win.onbeforeunload = () => {
        brush.shadow.parentNode.removeChild(brush.shadow);
        delete brush.win;
        delete brush.shadow;
    }
}
function closeAllBrushes() {
    while (brushes.length) {
        var brush = brushes.pop();
        if (brush.win) {
            brush.win.close();
        }
    }
}
document.getElementById("new-brush").addEventListener("click", openBrush, false);
document.getElementById("close-brushes").addEventListener("click", closeAllBrushes, false);

var offsetX = +localStorage.offsetX || 0;
var offsetY = +localStorage.offsetY || 0;
var offsetTarget = document.getElementById("offset-target");
window["applyOffsets"] = (winX, winY) => {
    var offsetRect = offsetTarget.getBoundingClientRect();
    offsetX = (winX - screenX) / devicePixelRatio - offsetRect.left;
    offsetY = (winY - screenY) / devicePixelRatio - offsetRect.top;
    localStorage.offsetX = offsetX;
    localStorage.offsetY = offsetY;
}
var modal = document.getElementById("calibration-modal");
document.getElementById("calibrate").addEventListener("click", _ => {
    modal.classList.add("is-active");
    var calibrator = window.open("/calibrator.html",
        "_blank",
        "top=" + (window.screenY + 100) +
        ",left=" + (window.screenX + 100) +
        ",width=" + (200 * devicePixelRatio) +
        ",height=" + (200 * devicePixelRatio));
    calibrator.onbeforeunload = () => {
        modal.classList.remove("is-active");
    }
}, false);
document.getElementById("cancel-calibration").addEventListener("click", _ => modal.classList.remove("is-active"), false);

var colors = {
    black: 0xff000000,
    white: 0xffffffff,
    red: 0xff0000ff
}

var nav = document.getElementById("nav");
var canvas = <HTMLCanvasElement>document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var image;
var pixels;

function save() {
    var req = new XMLHttpRequest();
    req.open("PUT", "/api/paintings/" + paintingId, true);
    req.setRequestHeader("Content-Type", "application/octet-stream");
    req.send(image.data.buffer);
}
document.getElementById("save").addEventListener("click", save, false);

function draw() {
    if (image != null) {
        ctx.putImageData(image, 0, 0);
    }
}

function resize() {
    var availableHeight = innerHeight - nav.clientHeight;
    var size = Math.min(innerWidth, availableHeight) - 20;
    canvas.style.top = nav.clientHeight + (availableHeight - size >> 1) + "px";
    canvas.style.left = (innerWidth - size >> 1) + "px";
    canvas.style.width = size + "px";
    canvas.style.height = size + "px";
    canvas.width = 100;
    canvas.height = 100;

    draw();
}
window.addEventListener("resize", () => {
    window.requestAnimationFrame(resize);
});
resize();

fetch("/api/paintings/" + paintingId)
    .then(res => res.arrayBuffer())
    .then(arr => {
        image = new ImageData(new Uint8ClampedArray(arr), 100, 100);
        pixels = new Uint32Array(image.data.buffer);
        draw();
    })
    .then(draw);

window["paint"] = (winX, winY, winWidth, winHeight, color, id) => {
    var left = (winX - screenX) / devicePixelRatio - offsetX;
    var top = (winY - screenY) / devicePixelRatio - offsetY;
    var width = winWidth;
    var height = winHeight;
    var shadow = brushes[id].shadow;
    if (shadow != null) {
        shadow.style.left = left - 3 + "px";
        shadow.style.top = top - 3 + "px";
        shadow.style.width = width + "px";
        shadow.style.height = height + "px";
    }

    var canvasRect = canvas.getBoundingClientRect();
    var minY = 100 * (top - canvasRect.top) / canvasRect.height >> 0;
    var minX = 100 * (left - canvasRect.left) / canvasRect.width >> 0;
    var maxY = minY + 100 * height / canvasRect.height >> 0;
    var maxX = minX + 100 * width / canvasRect.width >> 0;
    if (maxX >= 0 && minY < 100 && maxY >= 0 && minX < 100) {
        var mMinY = Math.max(0, minY);
        var mMinX = Math.max(0, minX);
        var mMaxY = Math.min(99, maxY);
        var mMaxX = Math.min(99, maxX);
        var value = colors[color];
        for (var y = mMinY; y <= mMaxY; y++) {
            for (var x = mMinX; x <= mMaxX; x++) {
                pixels[x + 100 * y] = value;
            }
        }

        draw();
    }
}