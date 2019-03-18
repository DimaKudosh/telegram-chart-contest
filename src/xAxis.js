import {timestampToString} from './utils';


export default class XAxis {
    constructor(canvas, totalTicks=6) {
        this.canvas = canvas;
        this.ctx = canvas.ctx;
        this.totalTicks = totalTicks;

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

    clear() {
        this.ctx.clearRect(0, this.canvas.height - 20, this.canvas.width, 20);
    }

    draw(labels) {
        this.clear();
        const font = '15px Arial';
        for (let i = 0.5; i < this.totalTicks; i++) {
            const index = Math.floor(labels.length * (i / this.totalTicks));
            const tick = labels[index];
            this.canvas.putText(index, 0, this.renderLabel(tick).toString(), font);
        }
    }
}