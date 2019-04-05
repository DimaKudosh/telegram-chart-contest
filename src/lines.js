import BaseUIElement from './base';
import Animation from './animation';


export default class Lines extends BaseUIElement {
    constructor(canvas, datasets, options) {
        super(canvas, options);
        this.datasets = datasets;
        this.isDisplayed = false;
        this.callbacks = [];
        this.animation = new Animation();
        this.ctx.lineJoin = 'round';

        this.hiddingDatasets = [];
        this.appearingDatasets = [];
    }

    animate() {
        const {animation, callbacks, ctx} = this;
        animation.cancel();
        animation.run(ctx, (progress) => {
            for (const callback of callbacks) {
                callback(progress);
            }
            this.draw(progress);
        }, () => {
            this.appearingDatasets = [];
            this.hiddingDatasets = [];
        });
        this.callbacks = [];
    }

    animatedResize(maxX, maxY) {
        const canvas = this.canvas;
        const yRatio = canvas.computeYRatio(maxY);
        const currentYRatio = canvas.yRatio;
        const stepY = yRatio - currentYRatio;
        canvas.xRatio = canvas.computeXRatio(maxX);
        this.callbacks.push((progress) => {
            canvas.yRatio = currentYRatio + (progress * stepY);
        });
        return this;
    }

    toggle(index) {
        const {appearingDatasets, hiddingDatasets} = this;
        if (this.datasets[index].isDisplayed) {
            appearingDatasets.push(index);
            hiddingDatasets.splice(hiddingDatasets.indexOf(index), 1);
        } else {
            hiddingDatasets.push(index);
            appearingDatasets.splice(appearingDatasets.indexOf(index), 1);
        }
    }

    drawDataset(dataset) {
        this.canvas.drawLine(Array.from(dataset.data.entries()), dataset.color);
    }

    draw(progress=1) {
        this.clear();
        const {datasets, appearingDatasets, hiddingDatasets, ctx} = this;
        for (let i = 0; i < datasets.length; i++) {
            if (appearingDatasets.indexOf(i) !== -1 ||
                hiddingDatasets.indexOf(i) !== -1 ||
                !datasets[i].isDisplayed) {
                continue;
            }
            this.drawDataset(datasets[i]);
        }
        ctx.save();
        if (appearingDatasets) {
            ctx.globalAlpha = progress;
            for (const i of appearingDatasets) {
                this.drawDataset(datasets[i]);
            }
        }
        if (hiddingDatasets) {
            ctx.globalAlpha = 1 - progress;
            for (const i of hiddingDatasets) {
                this.drawDataset(datasets[i]);
            }
        }
        ctx.restore();
    }
}