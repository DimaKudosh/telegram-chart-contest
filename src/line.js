import Animation from './animation';


export default class Line {
    constructor(canvas, dataset, labels) {
        this.canvas = canvas;
        this.dataset = dataset;
        this.name = dataset.name;
        this.labels = labels;
        this.color = dataset.color;

        this.isDisplayed = false;
        this.callbacks = [];

        this.animation = new Animation();
    }

    get points() {
        return Array.from(this.dataset.data.entries());
    }

    animate() {
        const animation = this.animation,
            points = this.points,
            callbacks = this.callbacks,
            canvas = this.canvas;
        animation.cancel();
        animation.run(canvas.ctx, (progress) => {
            canvas.clear();
            for (const callback of callbacks) {
                callback(progress);
            }
            canvas.drawLine(points, this.color);
        });
        this.callbacks = [];
    }

    animatedResize(maxX, maxY) {
        const canvas = this.canvas,
            xRatio = canvas.computeXRatio(maxX),
            yRatio = canvas.computeYRatio(maxY),
            currentYRatio = canvas.yRatio,
            stepY = yRatio - currentYRatio;
        canvas.xRatio = xRatio;
        this.callbacks.push((progress) => {
            canvas.yRatio = currentYRatio + (progress * stepY);
        });
        return this;
    }

    appear() {
        const canvas = this.canvas,
            ctx = canvas.ctx,
            step = 1 - ctx.globalAlpha;
        this.callbacks.push((progress) => {
            ctx.globalAlpha = progress;
        });
        return this;
    }

    hide() {
        const canvas = this.canvas,
            ctx = canvas.ctx,
            step = ctx.globalAlpha - 1;
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
        // if (!this.dataset.isDisplayed) {
        //     if (this.isDisplayed) {
        //         this.hide();
        //     }
        //     return;
        // }
        // if (this.isDisplayed) {
            this.canvas.clear();
            this.canvas.drawLine(Array.from(this.dataset.data.entries()), this.color);
        // } else {
        //     this.appear();
        // }
        this.isDisplayed = true;
    }
}