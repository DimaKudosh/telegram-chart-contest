import BaseUIElement from './base';
import Animation from './animation';


export default class Line extends BaseUIElement {
    constructor(canvas, dataset, options) {
        super(canvas, options);
        this.dataset = dataset;
        this.color = dataset.color;
        this.isDisplayed = false;
        this.callbacks = [];
        this.animation = new Animation();
        this.clearPadding = 10;

        this.lastMinY = 0;
        this.lastMaxY = 0;
    }

    get points() {
        return Array.from(this.dataset.data.entries());
    }

    clear() {
        let {lastMinY, lastMaxY, clearPadding} = this;
        let y = lastMinY - clearPadding;
        let height = lastMaxY - lastMinY + 2 * clearPadding;
        this.ctx.clearRect(0, y < 0 ? 0: y, this.canvas.width, height);
    }

    animate() {
        const {animation, points, callbacks, canvas, ctx} = this;
        animation.cancel();
        animation.run(ctx, (progress) => {
            this.clear();
            for (const callback of callbacks) {
                callback(progress);
            }
            canvas.drawLine(points, this.color);
            this.saveDrawnArea();
        });
        this.callbacks = [];
    }

    animatedResize(maxX, maxY) {
        const canvas = this.canvas;
        const yRatio = canvas.computeYRatio(maxY);
        const currentYRatio = canvas.yRatio;
        const stepY = yRatio - currentYRatio;
        canvas.xRatio = canvas.computeXRatio(maxX);
        this.callbacks.push((progress) => {
            canvas.yRatio = currentYRatio + (progress * stepY);
        });
        return this;
    }

    appear() {
        const ctx = this.ctx;
        this.callbacks.push((progress) => {
            ctx.globalAlpha = progress;
        });
        return this;
    }

    hide() {
        const ctx = this.ctx;
        this.callbacks.push((progress) => {
            ctx.globalAlpha = 1 - progress;
        });
        return this;
    }

    toggle() {
        if (this.dataset.isDisplayed) {
            return this.appear();
        }
        return this.hide();
    }

    draw() {
        const canvas = this.canvas;
        this.clear();
        canvas.drawLine(this.points, this.color);
        this.saveDrawnArea();
        this.isDisplayed = true;
    }

    saveDrawnArea() {
        const {dataset, canvas} = this;
        this.lastMaxY = canvas.translateY(dataset.getMin());
        this.lastMinY = canvas.translateY(dataset.getMax());
    }
}