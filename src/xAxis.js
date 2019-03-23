import Animation from './animation';
import {timestampToString, niceTicks} from './utils';


const NICE_INTERVAL = [1, 2, 3, 4, 6, 8, 10];


export default class XAxis {
    constructor(canvas, labels, options) {
        const {font, totalTicks = 8} = options;
        this.canvas = canvas;
        const ctx = canvas.getCtx();
        this.ctx = ctx;
        ctx.textAlign = 'center';
        if (font) ctx.font = font;
        this.totalTicks = totalTicks;
        this.animation = new Animation(400);
        this.indexOffset = 0.5;
        this.bottomOffset = 5;
        this.height = 25;

        this.allLabels = labels;

        this.start = 0;
        this.end = labels.length;

        this.appearSpacing = null;
        this.hideSpacing = null;

        this.cache = {};
    }

    setSelection(start, end) {
        this.start = start;
        this.end = end;
    }

    setAbsoluteValues(maxX, maxY) {
        this.canvas.setAbsoluteValues(maxX, maxY);
    }

    clear() {
        const {canvas, height} = this;
        this.ctx.clearRect(0, canvas.height - height, canvas.width, height);
    }

    draw(labels) {
        const {totalTicks, appearSpacing} = this;
        const {spacing: ticksSpacing} = niceTicks(0, labels.length, totalTicks, NICE_INTERVAL);
        if (!appearSpacing || ticksSpacing === appearSpacing) {
            this.appearSpacing = ticksSpacing;
            this.simpleDraw(ticksSpacing);
            return;
        }
        this.hideSpacing = appearSpacing;
        this.appearSpacing = ticksSpacing;
        this.runAnimatedDraw();
    }

    simpleDraw(ticksSpacing) {
        this.clear();
        const indexes = [];
        for (let i = this.indexOffset; i < this.allLabels.length / ticksSpacing; i++) {
            indexes.push(Math.floor(i * ticksSpacing));
        }
        this.drawLabels(indexes);
    }

    runAnimatedDraw() {
        const {animation, ctx, indexOffset} = this;
        if (animation.isRunning) {
            return;
        }
        animation.run(ctx, (progress) => {
            this.clear();
            const {allLabels, appearSpacing, hideSpacing} = this;
            const allAppearIndexes = new Set(),
                allHideIndexes = new Set(),
                labelsLength = allLabels.length;
            for (let i = indexOffset; i < labelsLength / appearSpacing; i++) {
                allAppearIndexes.add(Math.floor(i * appearSpacing));
            }
            for (let i = indexOffset; i < labelsLength / hideSpacing; i++) {
                allHideIndexes.add(Math.floor(i * hideSpacing));
            }
            const sameIndexes = new Set([...allAppearIndexes].filter(i => allHideIndexes.has(i))),
                appearIndexes = new Set([...allAppearIndexes].filter(i => !sameIndexes.has(i))),
                hideIndexes = new Set([...allHideIndexes].filter(i => !sameIndexes.has(i)));
            this.drawLabels(sameIndexes);
            ctx.globalAlpha = progress;
            this.drawLabels(appearIndexes);
            ctx.globalAlpha = 1 - progress;
            this.drawLabels(hideIndexes);
        });
    }

    drawLabels(indexes) {
        const canvas = this.canvas;
        const offset = -this.start * canvas.xRatio;
        for (const index of indexes) {
            const tick = this.allLabels[index];
            canvas.putText(index, 0, this.renderLabel(tick), offset, -this.bottomOffset);
        }
    }

    renderLabel(value) {
        let val = this.cache[value];
        if (!val) {
            val = timestampToString(value).toString();
            this.cache[value] = val;
        }
        return val;
    }
}
