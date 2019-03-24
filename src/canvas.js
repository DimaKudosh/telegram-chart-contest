export default class Canvas {
    constructor(width, height, offsets, isTopLayer=false) {
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
        canvas.addEventListener('dragstart', function(e) { e.preventDefault(); });
        return canvas;
    }

    getCtx() {
        return this.ctx;
    }

    computeXRatio(maxX) {
        const offsets = this.offsets;
        return (this.width - offsets.left - offsets.right) / maxX;
    }

    computeYRatio(maxY) {
        const offsets = this.offsets;
        return (this.height - offsets.top - offsets.bottom) / maxY;
    }

    setAbsoluteValues(maxX, maxY) {
        if (maxX) this.xRatio = this.computeXRatio(maxX);
        if (maxY) this.yRatio = this.computeYRatio(maxY);
    }

    translateY(y) {
        return Math.round(this.height - y * this.yRatio) -  this.offsets.bottom;
    }

    translateX(x) {
        return Math.round(x * this.xRatio) + this.offsets.left;
    }

    translatePoint(x, y) {
        return [this.translateX(x), this.translateY(y)];
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

    putText(x, y, text, xOffset, yOffset) {
        const ctx = this.ctx;
        [x, y] = this.translatePoint(x, y);
        ctx.fillText(text, x + (xOffset ? xOffset : 0), y + (yOffset ? yOffset : 0));
    }

    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }
}