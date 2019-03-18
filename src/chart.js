import Canvas from './canvas';
import XAxis from './xAxis';
import YAxis from './yAxis';
import Selection from './selection';
import { niceScale } from './utils';
import Dataset from './dataset';
import Tooltip from './tooltip';
import Line from './line';
import Legend from './legend';


const offset = {'top': 20, 'right': 0, 'bottom': 20, 'left': 0};


export class LineChart {
    constructor(container, labels, datasets, options) {
        const width = container.clientWidth,
            height = container.clientHeight;
        this.allLabels = labels;

        this.startIndex = 0;
        this.endIndex = labels.length;

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
            this.xAxis = new XAxis(canvas);
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
        return this.allLabels.slice(this.startIndex, this.endIndex);
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
        const maxValue = Math.max(...this.datasets.map(dataset => dataset.getMax()));
        this.maxValue = niceScale(0, maxValue, 6);
        return previousMax !== this.maxValue;
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
            if (this.isInitCompleted) {
                line.draw();
            } else {
                line.appear();
            }
        }
    }

    setSelection(start, end) {
        this.startIndex = this.allLabels.indexOf(start);
        this.endIndex = this.allLabels.indexOf(end) + 1;
        for (const dataset of this.datasets) {
            dataset.setRanges(this.startIndex, this.endIndex);
        }
        const sizeChanged = this.calculateMaxValue();
        for (const layer of this.layers) {
            layer.setAbsoluteValues(this.labels.length - 1, this.maxValue);
        }
        if (sizeChanged) {
            this.yAxis.draw(this.labels, this.maxValue);
        }
        this.xAxis.draw(this.labels, this.maxValue);
        for (const line of this.lines) {
            line.draw();
        }
        // this.draw();
    }
}