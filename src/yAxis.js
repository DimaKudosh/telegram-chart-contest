import { Animation } from './animation';


export default class YAxis {
    constructor(canvas, totalTicks=6) {
        this.canvas = canvas;
        this.totalTicks = totalTicks;

        this.previousTicks = [];


        this.resizeAnim = new Animation(canvas, 250);
    }

    draw(labels, maxValue) {
        const textOffset = maxValue * 0.01;
        const spacing = maxValue / (this.totalTicks - 1);
        this.canvas.clear();
        const font = '15px Arial';
        const ticks = [];
        for (let i = 0; i < this.totalTicks; i++) {
            const value = i * spacing;
            ticks.push(value);
            const y = value;
            this.canvas.putText(0 , y + textOffset, value.toString(), font);
            this.canvas.drawLine([[0 , y], [labels.length, y]], '#eee', 1);
        }
        this.previousTicks = ticks;
    }

    animatedDraw(labels, maxX, maxY) {
        const animation = this.resizeAnim;
        animation.cancel();
        const spacing = maxY / (this.totalTicks - 1);
        const canvas = this.canvas;
        const ctx = canvas.ctx;
        let newTicks = [];
        for (let i = 0; i < this.totalTicks; i++) {
            newTicks.push(i * spacing);
        }
        const font = '15px Arial';

        const xRatio = (canvas.width - canvas.offsets['left'] - canvas.offsets['right']) / maxX;
        const yRatio = (canvas.height - canvas.offsets['top'] - canvas.offsets['bottom']) / maxY;
        const currentRatioY = canvas.yRatio;
        const currentRatioX = canvas.xRatio;
        const stepX = xRatio - currentRatioX;
        const stepY = yRatio - currentRatioY;
        canvas.xRatio = xRatio;

        const textOffset = currentRatioY * 0.01;

        animation.run((progress) => {
            canvas.clear();
            canvas.yRatio = currentRatioY + (progress * stepY);
            ctx.globalAlpha = 1 - progress;
            for (const tick of this.previousTicks) {
                canvas.putText(0 , tick + textOffset + 200, tick.toString(), font, 1 - progress);
                canvas.drawLine([[0 , tick], [labels.length, tick]], '#eee', 1);
            }
            ctx.globalAlpha = progress;
            for (const tick of newTicks) {
                canvas.putText(0 , tick + textOffset, tick.toString(), font, progress);
                canvas.drawLine([[0 , tick], [labels.length, tick]], '#eee', 1);
            }
        }, () => {
            canvas.xRatio = xRatio;
            this.draw(labels, maxY);
        });
    }
}