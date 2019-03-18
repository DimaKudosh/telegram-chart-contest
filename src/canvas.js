export default class Canvas {
    constructor(width, height, isTopLayer=false, offsets={'left': 0, 'right': 0, 'top': 0, 'bottom': 0}) {
        this.width = width;
        this.height = height;
        this.offsets = offsets;
        this.canvas = this.create();
        this.ctx = this.canvas.getContext('2d');
        this.xRatio = 1;
        this.yRatio = 1;

        if (isTopLayer) {
            this.canvas.classList.add('telegram-chart-top-layer');
        }
    }

    create() {
        const canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        canvas.style.position = 'absolute';
        canvas.addEventListener('dragstart', function(e) { e.preventDefault(); });
        return canvas;
    }

    setAbsoluteValues(maxX, maxY) {
        this.xRatio = (this.width - this.offsets['left'] - this.offsets['right']) / maxX;
        this.yRatio = (this.height - this.offsets['top'] - this.offsets['bottom']) / maxY;
    }

    translatePoint(x, y) {
        const canvasHeight = this.height;
        const yOffset = this.offsets.bottom;
        const xOffset = this.offsets.left;
        y = ~~(canvasHeight - y * this.yRatio + 0.5) - yOffset;
        x = ~~(x * this.xRatio + 0.5) + xOffset;
        return [x, y];
    }

    drawLine(points, color, width=3) {
        const ctx = this.ctx;
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.moveTo(...this.translatePoint(...points[0]));
        for (let i = 1; i < points.length; i++) {
            const [x, y] = this.translatePoint(...points[i]);
            ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.closePath();
    }

    drawArc(x, y, radius, color, width=3, fillColor=null) {
        const ctx = this.ctx;
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        [x, y] = this.translatePoint(x, y);
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.stroke();
        if (fillColor) {
            ctx.fillStyle = fillColor;
            ctx.fill();
        }
    }

    putText(x, y, text, font) {
        const ctx = this.ctx;
        ctx.font = font;
        [x, y] = this.translatePoint(x, y);
        ctx.fillText(text, x, y);
    }

    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    clearRegion(x, y, w, h) {
        [x, y] = this.translatePoint(x, y);
        this.ctx.clearRect(x, y, w || this.width, h || this.height);
    }
}