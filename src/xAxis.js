import Animation from './animation';
import {timestampToString, getTickSpacing, niceTicks, int_intervals, nice_intervals} from './utils';


export default class XAxis {
    constructor(canvas, labels, totalTicks=7) {
        this.canvas = canvas;
        this.ctx = canvas.ctx;
        this.ctx.textAlign = "center";
        this.totalTicks = totalTicks;
        this.animation = new Animation(2500);

        this.allLabels = labels;

        this.start = 0;
        this.end = labels.length;

        this.previousIndexes = [];
        this.ticksShouldAppear = [];
        this.lastSize = this.end - this.start;
        this.animationRunning = false;

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
    }

    clear() {
        this.ctx.clearRect(0, this.canvas.height - 25, this.canvas.width, 25);
    }

    draw(labels) {
        const animation = new Animation();
        const font = '15px Arial';
        this.clear();
        const [low, high, ticksSpacing] = niceTicks(0, labels.length, 6,  nice_intervals);
        const size = labels.length;
        const offset = -this.start * this.canvas.xRatio;
        if (this.lastSize !== size) {
            this.lastSize = size;
            const ticks = [];
            const newTicks = [];
            for (let i = 0; i < this.allLabels.length / ticksSpacing; i++) {
                const index = Math.floor(i * ticksSpacing);
                if (this.previousIndexes.indexOf(index) === -1) {
                    newTicks.push(index);
                    continue;
                }
                ticks.push(index);
            }
            const ticksForRemoving = this.previousIndexes.filter((tick) => {return ticks.indexOf(tick) === -1});

            // animation.cancel();
            animation.run(this.canvas.ctx, (progress) => {
                this.clear();
                this.canvas.ctx.save();
                const offset = -this.start * this.canvas.xRatio;
                this.canvas.ctx.globalAlpha = progress;
                for (const index of newTicks) {
                    const tick = this.allLabels[index];
                    this.canvas.putText(index, 15, this.renderLabel(tick).toString(), font, offset);
                }
                this.canvas.ctx.globalAlpha = 1 - progress;
                for (const index of ticksForRemoving) {
                    const tick = this.allLabels[index];
                    this.canvas.putText(index, 15, this.renderLabel(tick).toString(), font, offset);
                }
                this.canvas.ctx.restore();
                // for (const index of ticks) {
                //     const tick = this.allLabels[index];
                //     this.canvas.putText(index, 15, this.renderLabel(tick).toString(), font, offset);
                // }
            }, () => {
                this.animationRunning = false;
                this.previousIndexes = ticks;
            });

            this.animationRunning = true;


            return;
        }
        let ticks = [];
        for (let i = 0; i < this.allLabels.length / ticksSpacing; i++) {
            const index = Math.floor(i * ticksSpacing);
            ticks.push(index);
            const tick = this.allLabels[index];
            this.canvas.putText(index, 15, this.renderLabel(tick).toString(), font, offset);
        }
        this.previousIndexes = ticks;
    }
}