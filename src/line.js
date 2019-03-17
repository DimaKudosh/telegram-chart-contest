import { FadeInDownAnimation, FadeOutAnimation } from './animation';


export default class Line {
    constructor(canvas, dataset, labels) {
        this.canvas = canvas;
        this.dataset = dataset;
        this.name = dataset.name;
        this.labels = labels;
        this.color = dataset.color;

        this.isDisplayed = false;
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