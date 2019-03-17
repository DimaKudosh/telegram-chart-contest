import {timestampToString} from './utils';


export default class XAxis {
    constructor(canvas, totalTicks=6) {
        this.canvas = canvas;
        this.totalTicks = totalTicks;
    }

    renderLabel(value) {
        return timestampToString(value);
    }

    draw(labels) {
        this.canvas.clear();
        const font = '15px Arial';
        for (let i = 0.5; i < this.totalTicks; i++) {
            const index = Math.floor(labels.length * (i / this.totalTicks));
            const tick = labels[index];
            this.canvas.putText(index, 0, this.renderLabel(tick).toString(), font);
        }
    }
}