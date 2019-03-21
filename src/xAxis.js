import {Animation} from './animation';
import {timestampToString, getTickSpacing} from './utils';


export default class XAxis {
    constructor(canvas, labels, totalTicks=6) {
        this.canvas = canvas;
        this.ctx = canvas.ctx;
        this.totalTicks = totalTicks;
        this.animation = new Animation(this.canvas.ctx, 250);

        this.totalLabels = labels.length;
        this.allLabels = labels;

        this.start = 0;
        this.end = labels.length;

        this.previousTicks = [];
        this.ticksShouldAppear = [];
        this.previousSpacing = 0;

        this.cache = {};
    }

    renderLabel(value) {
        let val = this.cache[value];
        if (!val) {
            val = timestampToString(value);
            this.cache[value] = val;
        }
        return val;
    }

    setSelection(start, end) {
        this.start = start;
        this.end = end;
    }

    setAbsoluteValues(maxX, maxY) {
        this.canvas.setAbsoluteValues(maxX, maxY);
        // this.canvas.ctx.save();
        // this.canvas.ctx.translate(this.start * this.canvas.xRatio, 0);
        // console.log(this.start * this.canvas.xRatio);
        // this.canvas.ctx.restore();
    }

    clear() {
        this.ctx.clearRect(0, this.canvas.height - 20, this.canvas.width, 20);
    }

    draw(labels) {
        const animation = this.animation;
        this.clear();
        const font = '15px Arial';
        const ticksSpacing = getTickSpacing(0, labels.length, 8);
        console.log(ticksSpacing);
        const start = Math.round((labels.length - ticksSpacing * 6) / 2);

        // this.canvas.ctx.save();
        // this.canvas.ctx.translate(this.start * this.canvas.xRatio, 0);

        const offset = -this.start * this.canvas.xRatio;

        if (this.previousSpacing !== ticksSpacing) {
            const ticks = [];
            const newTicks = [];
            for (let i = 0; i < this.totalLabels/ ticksSpacing; i++) {
                const index = i * ticksSpacing;
                if (this.previousTicks.indexOf(index) === -1) {
                    newTicks.push(index);
                    // ticks.push(index);
                    continue;
                }
                ticks.push(index);
                const tick = this.allLabels[index];
                this.canvas.putText(index, 0, this.renderLabel(tick).toString(), font, offset);
            }

            const ticksForRemoving = this.previousTicks.filter((tick) => {return ticks.indexOf(tick) === -1});

            if(newTicks) {
                animation.cancel();
                animation.run((progress) => {
                    this.clear();
                    this.canvas.ctx.save();
                    const offset = -this.start * this.canvas.xRatio;
                    this.canvas.ctx.globalAlpha = progress;
                    for (const index of newTicks) {
                        const tick = this.allLabels[index];
                        this.canvas.putText(index, 0, this.renderLabel(tick).toString(), font, offset);
                    }
                    this.canvas.ctx.globalAlpha = 1 - progress;
                    for (const index of ticksForRemoving) {
                        const tick = this.allLabels[index];
                        this.canvas.putText(index, 0, this.renderLabel(tick).toString(), font, offset);
                    }
                    this.canvas.ctx.restore();
                    for (const index of this.previousTicks) {
                            const tick = this.allLabels[index];
                            this.canvas.putText(index, 0, this.renderLabel(tick).toString(), font, offset);
                        }
                }, () => {
                    this.previousTicks = this.previousTicks.concat(this.ticksShouldAppear);
                    this.ticksShouldAppear = [];
                })
            }

            this.ticksShouldAppear = newTicks;
            this.previousTicks = ticks;
            this.previousSpacing = ticksSpacing;
            return;
        }
        for (const index of this.previousTicks) {
            const tick = this.allLabels[index];
            this.canvas.putText(index, 0, this.renderLabel(tick).toString(), font, offset);
        }
        // this.canvas.ctx.translate(-this.start * this.canvas.xRatio, 0);
        // this.canvas.ctx.restore();
    }

    animatedDraw(labels) {
        const {animation} = this;
        const font = '15px Arial';
        const visibleArea = labels.length;
        const ticksSpacing = getTickSpacing(0, labels.length, 6);
        const ctx = this.canvas.ctx;
        animation.cancel();
        animation.run(ctx, (progress) => {

        })
    }
}