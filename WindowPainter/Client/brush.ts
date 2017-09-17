class BrushPopup {
    readonly brushId: number;
    posX: number;
    posY: number;
    color: string;
    constructor() {
        this.brushId = +location.search.substr(1);
        this.color = "black";
        document.documentElement.style.background = this.color;
        this.checkPos();
    }
    paint() {
        window.opener.paint(Object.assign({
            winWidth: innerWidth,
            winHeight: innerHeight
        }, this));
    }
    switchColor() {
        if (this.color === "black")
            this.color = "red";
        else this.color = "black";
        document.documentElement.style.background = this.color;
        this.paint();
    }
    enqueueCheck() {
        window.requestAnimationFrame(() => this.checkPos());
    }
    checkPos() {
        if (this.posX !== screenX || this.posY !== screenY) {
            this.posX = screenX;
            this.posY = screenY;
            this.paint();
        }
        this.enqueueCheck();
    }
}

const popup = new BrushPopup();
document.documentElement.addEventListener("click", () => popup.switchColor(), false);
window.opener.onbeforeunload = () => window.close();
