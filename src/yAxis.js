import Animation from './animation';


export default class YAxis {
    constructor(canvas, totalTicks=6) {
        this.canvas = canvas;
        this.totalTicks = totalTicks;
        this.previousTicks = [];
        this.font = '15px Arial';
        this.textOffset = -5;
        this.resizeAnim = new Animation();

        this.maxY = 0;
    }

    draw(labels, maxValue) {
        const totalTicks = this.totalTicks,
            spacing = maxValue / (totalTicks - 1),
            canvas = this.canvas,
            ticks = [];
        canvas.clear();
        for (let i = 0; i < totalTicks; i++) {
            const value = i * spacing;
            ticks.push(value);
            this.canvas.putText(0 , value, value.toString(), this.font, 0, this.textOffset);
            this.canvas.drawLine([[0 , value], [labels.length, value]], '#eee', 1);
        }
        this.previousTicks = ticks;
    }

    animatedDraw(labels, maxY) {
        const animation = this.resizeAnim,
            totalTicks = this.totalTicks,
            spacing = maxY / (totalTicks - 1),
            canvas = this.canvas,
            ctx = canvas.ctx,
            newTicks = [],
            xRatio = canvas.computeXRatio(labels.length - 1),
            yRatio = canvas.computeYRatio(maxY),
            currentYRatio = canvas.yRatio,
            stepY = yRatio - currentYRatio,
            textOffset = this.textOffset,
            font = this.font;
        if (this.maxY === maxY) {
            return
        }
        this.maxY = maxY;
        animation.cancel();
        for (let i = 0; i < totalTicks; i++) {
            newTicks.push(i * spacing);
        }
        canvas.xRatio = xRatio;
        animation.run(ctx, (progress) => {
            canvas.clear();
            canvas.yRatio = currentYRatio + (progress * stepY);
            ctx.globalAlpha = 1 - progress;
            for (const tick of this.previousTicks) {
                canvas.putText(0 , tick, tick.toString(), font, 0, textOffset);
                canvas.drawLine([[0 , tick], [labels.length, tick]], '#eee', 1);
            }
            ctx.globalAlpha = progress;
            for (const tick of newTicks) {
                canvas.putText(0 , tick, tick.toString(), font, 0 ,textOffset);
                canvas.drawLine([[0 , tick], [labels.length, tick]], '#eee', 1);
            }
        }, () => {
            canvas.xRatio = xRatio;
            this.draw(labels, maxY);
        });
    }
}