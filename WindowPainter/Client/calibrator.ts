﻿window.opener.onbeforeunload = () => window.close();
document.getElementById("done-button").addEventListener("click", () => {
    window.opener.applyOffsets(screenX, screenY);
    window.close();
}, false);
window.addEventListener("keydown", ev => {
    console.log(ev, ev.keyCode);
    switch (ev.keyCode) {
    case 37: moveBy(-1, 0); break;
    case 38: moveBy(0, -1); break;
    case 39: moveBy(1, 0); break;
    case 40: moveBy(0, 1); break;
    }
}, false);