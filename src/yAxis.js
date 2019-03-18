export default class YAxis {
    constructor(canvas, totalTicks=6) {
        this.canvas = canvas;
        this.totalTicks = totalTicks;
    }

    draw(labels, maxValue) {
        const textOffset = maxValue * 0.01;
        const spacing = maxValue / (this.totalTicks - 1);
        this.canvas.clear();
        const font = '15px Arial';
        for (let i = 0; i < this.totalTicks; i++) {
            const value = i * spacing;
            const y = value;
            this.canvas.putText(0 , y + textOffset, value.toString(), font);
            this.canvas.drawLine([[0 , y], [labels.length, y]], '#eee', 1);
        }
    }
}