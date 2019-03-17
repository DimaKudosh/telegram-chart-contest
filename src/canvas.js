export default class Canvas {
    constructor(width, height, isTopLayer=false) {
        this.width = width;
        this.height = height;
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
        this.xRatio = this.canvas.width / maxX;
        this.yRatio = this.canvas.height / maxY;
    }

    translatePoint(x, y) {
        const canvasHeight = this.canvas.height;
        y = ~~(canvasHeight - y * this.yRatio + 0.5);
        x = ~~(x * this.xRatio + 0.5);
        return [x, y];
    }

    drawLine(points, color, width=3) {
        const ctx = this.ctx;
        ctx.save();
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
        ctx.restore();
    }

    drawArc(x, y, radius, color, width=3, fillColor=null) {
        const ctx = this.ctx;
        ctx.save();
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
        ctx.restore();
    }

    putText(x, y, text, font) {
        const ctx = this.ctx;
        ctx.font = font;
        [x, y] = this.translatePoint(x, y);
        ctx.fillText(text, x, y);
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}