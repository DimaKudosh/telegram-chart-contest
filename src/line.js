import { FadeInDownAnimation, FadeOutAnimation, Animation } from './animation';


export default class Line {
    constructor(canvas, dataset, labels) {
        this.canvas = canvas;
        this.dataset = dataset;
        this.name = dataset.name;
        this.labels = labels;
        this.color = dataset.color;

        this.isDisplayed = false;

        this.resizeAnim = new Animation(canvas);
    }

    changeMaxValues(maxY, maxX) {
        this.animation = new Animation(canvas, (progress) => {
            canvas.setAbsoluteValues(maxX, maxY);
            canvas.clear();
            this.canvas.drawLine(Array.from(this.dataset.data.entries()), this.color);
        })
    }

    animatedResize(maxX, maxY) {
        const animation = this.resizeAnim;
        animation.cancel();
        // this.animation.cancel();
        const canvas = this.canvas;
        const xRatio = (canvas.width - canvas.offsets['left'] - canvas.offsets['right']) / maxX;
        const yRatio = (canvas.height - canvas.offsets['top'] - canvas.offsets['bottom']) / maxY;
        const points = Array.from(this.dataset.data.entries());
        const currentRatioY = canvas.yRatio;
        const currentRatioX = canvas.xRatio;
        const stepX = xRatio - currentRatioX;
        const stepY = yRatio - currentRatioY;

        canvas.xRatio = xRatio;
        animation.run((progress) => {
            canvas.yRatio = currentRatioY + (progress * stepY);
            // canvas.xRatio = xRatio;
            canvas.clear();
            canvas.drawLine(Array.from(this.dataset.data.entries()));
        }, () => {
            canvas.clear();
            canvas.yRatio = currentRatioY + (1 * stepY);
            // canvas.setAbsoluteValues(maxX, maxY);
            canvas.drawLine(Array.from(this.dataset.data.entries()));
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