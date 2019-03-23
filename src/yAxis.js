import Animation from './animation';


export default class YAxis {
    constructor(canvas, options) {
        this.options = options;
        const ctx = canvas.getCtx();
        this.canvas = canvas;
        this.ctx = ctx;
        const {font, totalTicks} = options;
        this.totalTicks = totalTicks;
        this.previousTicks = [];
        ctx.font = font;
        this.textOffset = -5;

        this.animation = new Animation(options.animation);

        this.maxY = 0;
    }

    draw(labels, maxValue) {
        const {canvas, totalTicks} = this;
        const spacing = maxValue / (totalTicks - 1);
        const ticks = [];
        canvas.clear();
        for (let i = 0; i < totalTicks; i++) {
            ticks.push(i * spacing);
        }
        this.drawTicks(labels, ticks);
        this.previousTicks = ticks;
    }

    animatedDraw(labels, maxY) {
        if (this.maxY === maxY) {
            return;
        }
        const {animation, totalTicks, ctx, canvas} = this;
        const spacing = maxY / (totalTicks - 1);
        const newTicks = [];
        const xRatio = canvas.computeXRatio(labels.length - 1);
        const yRatio = canvas.computeYRatio(maxY);
        const currentYRatio = canvas.yRatio;
        const stepY = yRatio - currentYRatio;
        this.maxY = maxY;
        animation.cancel();
        for (let i = 0; i < totalTicks; i++) {
            newTicks.push(i * spacing);
        }
        canvas.xRatio = xRatio;
        const animationCallback = () => this.draw(labels, maxY);
        animation.run(ctx, (progress) => {
            canvas.clear();
            canvas.yRatio = currentYRatio + (progress * stepY);
            ctx.globalAlpha = 1 - progress;
            this.drawTicks(labels, this.previousTicks);
            ctx.globalAlpha = progress;
            this.drawTicks(labels, newTicks);
        }, animationCallback, animationCallback);
    }

    drawTicks(labels, ticks) {
        const canvas = this.canvas;
        for (const tick of ticks) {
            canvas.putText(0, tick, tick.toString(), 0, this.textOffset);
            canvas.drawLine([[0, tick], [labels.length, tick]], this.options.underlineColor, 1);
        }
    }
}