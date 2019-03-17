import FadeInDownAnimation from './animation';


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
        this.isDisplayed = true;
    }

    draw() {
        if (this.isDisplayed) {
            this.canvas.clear();
            this.canvas.drawLine(Array.from(this.dataset.data.entries()), this.color);
        } else {
            this.appear();
        }
    }
}