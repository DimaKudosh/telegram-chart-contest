import BaseUIElement from './base';
import Animation from './animation';
import {timestampToString, niceTicks} from './utils';


const NICE_INTERVAL = [1, 2, 3, 4, 6, 8, 10];


export default class XAxis extends BaseUIElement {
    constructor(canvas, labels, options) {
        super(canvas, options);
        const ctx = this.ctx;
        ctx.textAlign = 'center';
        ctx.font = options.font;
        ctx.fillStyle = options.color;
        this.animation = new Animation(options.animation);
        this.indexOffset = 0.5;
        this.bottomOffset = 5;
        this.height = 25;

        this.allLabels = labels;

        this.start = 0;
        this.end = labels.length;

        this.appearSpacing = null;
        this.hideSpacing = null;
    }

    updateOptions(updatedOptions) {
        super.updateOptions(updatedOptions);
        const {ctx, options} = this;
        ctx.font = options.font;
        ctx.fillStyle = options.color;
        this.simpleDraw(this.appearSpacing);
    }

    setSelection(start, end) {
        this.start = start;
        this.end = end;
    }

    clear() {
        const {canvas, height} = this;
        this.ctx.clearRect(0, canvas.height - height, canvas.width, height);
    }

    draw(labels) {
        const {options: {totalTicks}, appearSpacing} = this;
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
            canvas.putText(index, 0, timestampToString(tick).toString(), offset, -this.bottomOffset);
        }
    }
}
