import Canvas from './canvas';
import XAxis from './xAxis';
import YAxis from './yAxis';
import Selection from './selection';
import { niceTicks, nice_intervals } from './utils';
import Dataset from './dataset';
import Tooltip from './tooltip';
import Line from './line';
import Legend from './legend';


const offset = {'top': 20, 'right': 7, 'bottom': 20, 'left': 7};


export class LineChart {
    constructor(container, labels, datasets, options) {
        const width = container.clientWidth,
            height = container.clientHeight;
        this.allLabels = labels;

        this.start = 0;
        this.end = labels.length;

        this.datasets = datasets.map((dataset) => {
            return new Dataset(dataset);
        });
        this.calculateMaxValue();

        this.container = this.createContainer(container);
        this.canvas = new Canvas(width, height);
        this.layers = [this.canvas];

        if (options['xAxis']) {
            const canvas = new Canvas(width, height);
            this.layers.push(canvas);
            this.xAxis = new XAxis(canvas, this.allLabels);
        }
        if (options['yAxis']) {
            const canvas = new Canvas(width, height, false, offset);
            this.layers.push(canvas);
            this.yAxis = new YAxis(canvas);
        }
        if (options['tooltip']) {
            const canvas = new Canvas(width, height, true, offset);
            this.layers.push(canvas);
            this.tooltip = new Tooltip(canvas, this);
        }
        this.lines = this.datasets.map((dataset) => {
            const canvas = new Canvas(width, height, false, offset);
            this.layers.push(canvas);
            return new Line(
                canvas,
                dataset,
                labels
            );
        });
        if (options['selection']) {
            const canvas = new Canvas(width, height);
            this.layers.push(canvas);
            this.selection = new Selection(canvas, this, options['selection']);
        }
        if (options['legend']) {
            this.legend = new Legend(options['legend']['container'], this);
        }

        for (const layer of this.layers) {
            this.container.appendChild(layer.canvas);
            layer.setAbsoluteValues(this.labels.length - 1, this.maxValue);
        }

        container.appendChild(this.container);
        this.draw();
        this.isInitCompleted = true;
    }

    get labels() {
        return this.allLabels.slice(this.start, this.end + 1);
    }

    createContainer(container) {
        const div = document.createElement('div');
        div.style.width = container.clientWidth + 'px';
        div.style.height = container.clientHeight + 'px';
        div.style.position = 'relative';
        return div;
    }

    calculateMaxValue() {
        const previousMax = this.maxValue;
        const maxValue = Math.max(...this.datasets.filter(dataset => dataset.isDisplayed).map(dataset => dataset.getMax()));
        const [lo, hi, spacing] = niceTicks(0, maxValue, 7, nice_intervals);
        this.maxValue = hi;
        return previousMax !== hi;
    }

    draw() {
        if (this.xAxis) {
            this.xAxis.draw(this.labels, this.maxValue);
        }
        if (this.yAxis) {
            this.yAxis.draw(this.labels, this.maxValue);
        }
        if (this.selection) {
            this.selection.draw();
        }
        for (const line of this.lines) {
            line.draw();
        }
    }

    setSelection(start, end) {
        this.start = start;
        this.end = end;
        this.xAxis.setSelection(this.start, this.end);
        for (const dataset of this.datasets) {
            dataset.setRanges(start, end);
        }
        this.calculateMaxValue();
        const
            lines = this.lines,
            labels = this.labels,
            maxX = labels.length - 1,
            maxY = this.maxValue;
        this.yAxis.animatedDraw(labels, maxY);
        this.tooltip.canvas.setAbsoluteValues(maxX, maxY);
        for (const line of lines) {
            if (line.dataset.isDisplayed) {
                line.animatedResize(maxX, maxY).animate();
            } else {
                line.canvas.setAbsoluteValues(maxX, maxY);
            }
        }
        this.xAxis.canvas.setAbsoluteValues(maxX, maxY);
        this.xAxis.draw(labels, maxY);
    }

    emitLegendChange(index) {
        const
            previousMaxY = this.maxValue,
            lines = this.lines,
            changed = this.calculateMaxValue(),
            labels = this.labels,
            maxX = labels.length - 1,
            maxY = this.maxValue || previousMaxY;
        if (changed) {
            this.yAxis.animatedDraw(labels, maxY);
            this.tooltip.canvas.setAbsoluteValues(maxX, maxY);
            for (let i = 0; i < lines.length; i++) {
                let line = this.lines[i];
                if (i === index) {
                    line.toggle();
                } else if (!line.dataset.isDisplayed) {
                    line.canvas.setAbsoluteValues(maxX, maxY);
                    continue;
                }
                line.animatedResize(maxX, maxY).animate();
            }
        } else {
            lines[index].toggle().animate();
        }
    }
}