import {CanvasTransformAnimation, FadeInDownAnimation, FadeOutAnimation} from './animation';


export default class Line {
    constructor(canvas, dataset, labels) {
        this.canvas = canvas;
        this.dataset = dataset;
        this.name = dataset.name;
        this.labels = labels;
        this.color = dataset.color;

        this.animation = new CanvasTransformAnimation();

        this.isDisplayed = false;
    }

    animatedResize(maxX, maxY) {
        // this.animation.cancel();
        const canvas = this.canvas;
        const xRatio = (canvas.width - canvas.offsets['left'] - canvas.offsets['right']) / maxX;
        const yRatio = (canvas.height - canvas.offsets['top'] - canvas.offsets['bottom']) / maxY;
        const points = Array.from(this.dataset.data.entries());
        this.animation.animate(this.canvas, xRatio, yRatio, () => {
            this.canvas.clear();
            this.canvas.drawLine(points, this.color);
        });
    }

    appear() {
        const animation = new FadeInDownAnimation();
        animation.animate(this.canvas.ctx, ()=>{
            this.canvas.clear();
            this.canvas.drawLine(Array.from(this.dataset.data.entries()), this.color);
        });
    }

    hide() {
        const animation = new FadeOutAnimation();
        const points = Array.from(this.dataset.data.entries());
        animation.animate(this.canvas.ctx, () => {
            this.canvas.clear();
            this.canvas.drawLine(points, this.color);
        });
        this.isDisplayed = false;
    }

    draw() {
        if (!this.dataset.isDisplayed) {
            if (this.isDisplayed) {
                this.hide();
            }
            return;
        }
        if (this.isDisplayed) {
            this.canvas.clear();
            this.canvas.drawLine(Array.from(this.dataset.data.entries()), this.color);
        } else {
            this.appear();
        }
        this.isDisplayed = true;
    }
}