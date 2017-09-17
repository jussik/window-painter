class Utils {
    static zoom = devicePixelRatio;
    static paintingId = +location.pathname.split("/").pop();
    static drawShadows = true;
}

class Brush {
    static idCounter = 0;
    readonly id: number;
    win: Window;
    shadow: HTMLElement;

    constructor() {
        this.id = ++Brush.idCounter;

        this.win = window.open(
            `/brush.html?${this.id}`,
            "_blank",
            `top=${window.screenY + 100},left=${window.screenX + 100},width=${200 * Utils.zoom},height=${200 * Utils.zoom}`);
        this.win.onbeforeunload = () => this.close();

        if (Utils.drawShadows) {
            this.shadow = document.createElement("div");
            this.shadow.classList.add("shadow");
            document.body.appendChild(this.shadow);
        }
    }
    close() {
        if (this.shadow && this.shadow.parentNode) {
            this.shadow.parentNode.removeChild(this.shadow);
        }
        delete this.shadow;

        if (this.win && !this.win.closed) {
            this.win.close();
        }
        delete this.win;
    }
}

class BrushContainer {
    brushes: Brush[];
    constructor() {
        this.brushes = [];
    }
    open() {
        this.brushes.push(new Brush());
    }
    get(id: number) {
        return this.brushes[id];
    }
    closeAll() {
        this.brushes.forEach(b => b.close());
        this.brushes = [];
    }
}
const brushContainer = new BrushContainer();
document.getElementById("new-brush").addEventListener("click", () => brushContainer.open(), false);
document.getElementById("close-brushes").addEventListener("click", () => brushContainer.closeAll(), false);

class Offsets {
    x: number;
    y: number;
    readonly offsetTarget: HTMLElement;
    constructor(offsetTarget) {
        this.x = +localStorage["offset.x"] || 0;
        this.y = +localStorage["offset.y"] || 0;
        this.offsetTarget = offsetTarget;
    }
    apply(x: number, y: number) {
        const offsetRect = this.offsetTarget.getBoundingClientRect();
        this.x = (x - screenX) / devicePixelRatio - offsetRect.left;
        this.y = (y - screenY) / devicePixelRatio - offsetRect.top;
        localStorage["offset.x"] = this.x;
        localStorage["offset.y"] = this.y;
    }
}
const offsets = new Offsets(document.getElementById("offset-target"));
window["applyOffsets"] = (x, y) => offsets.apply(x, y);

class CalibrationDialog {
    readonly elem: HTMLElement;
    constructor(elem) {
        this.elem = elem;
    }
}

const modal = document.getElementById("calibration-modal");
document.getElementById("calibrate").addEventListener("click", _ => {
    modal.classList.add("is-active");
    const calibrator = window.open(
        "/calibrator.html",
        "_blank",
        `top=${window.screenY + 100},left=${window.screenX + 100},width=${200 * devicePixelRatio},height=${200 * devicePixelRatio}`);
    calibrator.onbeforeunload = () => {
        modal.classList.remove("is-active");
    }
}, false);
document.getElementById("cancel-calibration").addEventListener("click", _ => modal.classList.remove("is-active"), false);

interface PaintRequest {
    winX: number;
    winY: number;
    winWidth: number;
    winHeight: number;
    color: string;
    brushId: number;
}
class Canvas {
    static colors = {
        black: 0xff000000,
        white: 0xffffffff,
        red: 0xff0000ff
    }
    canvas: HTMLCanvasElement;
    getTopOffset: () => number;
    ctx: CanvasRenderingContext2D;
    image: ImageData;
    pixels: Uint32Array;
    constructor(canvas, getTopOffset) {
        this.canvas = canvas;
        this.getTopOffset = getTopOffset;
        this.ctx = canvas.getContext("2d");
    }
    load() {
        fetch(`/api/paintings/${Utils.paintingId}`)
            .then(res => res.arrayBuffer())
            .then(arr => {
                this.image = new ImageData(new Uint8ClampedArray(arr), 100, 100);
                this.pixels = new Uint32Array(this.image.data.buffer);
                this.draw();
            })
            .then(() => this.draw());
    }
    save() {
        if (!this.image)
            return;
        const req = new XMLHttpRequest();
        req.open("PUT", `/api/paintings/${Utils.paintingId}`, true);
        req.setRequestHeader("Content-Type", "application/octet-stream");
        req.send(this.image.data.buffer);
    }
    draw() {
        if (!this.image)
            return;
        this.ctx.putImageData(this.image, 0, 0);
    }
    onResize() {
        const availableHeight = innerHeight - nav.clientHeight;
        const size = Math.min(innerWidth, availableHeight) - 20;
        Object.assign(this.canvas.style, {
            top: nav.clientHeight + (availableHeight - size >> 1) + "px",
            left: (innerWidth - size >> 1) + "px",
            width: size + "px",
            height: size + "px"
        });
        this.draw();
    }
    paint(p: PaintRequest) {
        const left = (p.winX - screenX) / devicePixelRatio - offsets.x;
        const top = (p.winY - screenY) / devicePixelRatio - offsets.y;
        const width = p.winWidth;
        const height = p.winHeight;
        if (Utils.drawShadows) {
            const shadow = brushContainer.get(p.brushId).shadow;
            if (shadow != null) {
                shadow.style.left = left - 3 + "px";
                shadow.style.top = top - 3 + "px";
                shadow.style.width = width + "px";
                shadow.style.height = height + "px";
            }
        }

        const canvasRect = this.canvas.getBoundingClientRect();
        const minY = 100 * (top - canvasRect.top) / canvasRect.height >> 0;
        const minX = 100 * (left - canvasRect.left) / canvasRect.width >> 0;
        const maxY = minY + 100 * height / canvasRect.height >> 0;
        const maxX = minX + 100 * width / canvasRect.width >> 0;
        if (maxX >= 0 && minY < 100 && maxY >= 0 && minX < 100) {
            const mMinY = Math.max(0, minY);
            const mMinX = Math.max(0, minX);
            const mMaxY = Math.min(99, maxY);
            const mMaxX = Math.min(99, maxX);
            const value = Canvas.colors[p.color];
            for (let y = mMinY; y <= mMaxY; y++) {
                for (let x = mMinX; x <= mMaxX; x++) {
                    this.pixels[x + 100 * y] = value;
                }
            }

            this.draw();
        }
    }
}

const nav = document.getElementById("nav");
const getTopOffset = () => nav.clientHeight;
const c = new Canvas(document.getElementById("canvas"), getTopOffset);
c.load();

document.getElementById("save").addEventListener("click", () => c.save(), false);
window.addEventListener("resize", () => window.requestAnimationFrame(() => c.onResize()));
c.onResize();
window["paint"] = (p: PaintRequest) => c.paint(p);