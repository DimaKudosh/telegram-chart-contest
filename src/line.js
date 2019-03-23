import Animation from './animation';


export default class Line {
    constructor(canvas, dataset) {
        this.canvas = canvas;
        this.ctx = canvas.getCtx();
        this.dataset = dataset;
        this.color = dataset.color;

        this.isDisplayed = false;
        this.callbacks = [];

        this.animation = new Animation();
    }

    get points() {
        return Array.from(this.dataset.data.entries());
    }

    animate() {
        const {animation, points, callbacks, canvas, ctx} = this;
        animation.cancel();
        animation.run(ctx, (progress) => {
            canvas.clear();
            for (const callback of callbacks) {
                callback(progress);
            }
            canvas.drawLine(points, this.color);
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
        canvas.clear();
        canvas.drawLine(Array.from(this.dataset.data.entries()), this.color);
        this.isDisplayed = true;
    }
}