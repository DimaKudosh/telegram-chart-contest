import Canvas from './canvas';
import XAxis from './xAxis';
import YAxis from './yAxis';
import Selection from './selection';
import { niceTicks } from './utils';
import Dataset from './dataset';
import Tooltip from './tooltip';
import Lines from './lines';
import Legend from './legend';
import { DEFAULT_OPTIONS } from './options';


export default class LineChart {
    constructor(container, labels, datasets, userOptions) {
        const options = {...DEFAULT_OPTIONS, ...userOptions};
        this.options = options;

        const offsets = options.offsets;
        const width = options.width || container.clientWidth;
        const height = options.height || container.clientHeight;

        this.allLabels = labels;
        this.start = 0;
        this.end = labels.length;

        this.datasets = datasets.map((dataset) => {
            return new Dataset(dataset);
        });
        this.calculateMaxValue();

        this.container = this.constructor.createContainer(width, height);

        const layers = [];
        if (options.xAxis.display) {
            const canvas = new Canvas(width, height, {top: 0, left: 0, right: 0, bottom: 0});
            layers.push(canvas);
            this.xAxis = new XAxis(canvas, this.allLabels, options.xAxis);
        } else {
            this.xAxis = null;
        }

        if (options.yAxis.display) {
            const canvas = new Canvas(width, height, offsets);
            layers.push(canvas);
            this.yAxis = new YAxis(canvas, options.yAxis);
        } else {
            this.yAxis = null;
        }

        if (options.tooltip.display) {
            const canvas = new Canvas(width, height, offsets, true);
            layers.push(canvas);
            this.tooltip = new Tooltip(canvas, this, options.tooltip);
        }

        const linesCanvas = new Canvas(width, height, offsets);
        layers.push(linesCanvas);
        this.lines = new Lines(linesCanvas, this.datasets, {});

        if (options.selection.display) {
            const canvas = new Canvas(width, height, offsets, true);
            layers.push(canvas);
            this.selection = new Selection(canvas, options.target, options.selection);
        } else {
            this.selection = null;
        }

        for (const layer of layers) {
            this.container.appendChild(layer.canvas);
            layer.setAbsoluteValues(this.labels.length - 1, this.maxValue);
        }
        container.appendChild(this.container);

        if (options.preview.display) {
            const previewOptions = options.preview;
            previewOptions.target = this;
            this.preview = new LineChart(container, labels, datasets, previewOptions);
        } else {
            this.preview = null;
        }

        if (options.legend.display) {
            this.legend = new Legend(container, this, options.legend);
        } else {
            this.legend = null;
        }

        this.draw();
    }

    get labels() {
        return this.allLabels.slice(this.start, this.end + 1);
    }

    static createContainer(width, height) {
        const div = document.createElement('div');
        div.classList.add('telegram-chart-container');
        div.style.width = width + 'px';
        div.style.height = height + 'px';
        return div;
    }

    updateOptions(options) {
        const newOptions = {...this.options, ...options};
        const {tooltip, xAxis, yAxis, selection, legend, preview} = this;
        if (tooltip) tooltip.updateOptions(newOptions.tooltip);
        if (xAxis) xAxis.updateOptions(newOptions.xAxis);
        if (yAxis) yAxis.updateOptions(newOptions.yAxis);
        if (selection) selection.updateOptions(newOptions.selection);
        if (legend) legend.updateOptions(newOptions.legend);
        if (preview) preview.updateOptions(newOptions.preview);
        this.options = newOptions;
    }

    calculateMaxValue() {
        const previousMax = this.maxValue;
        const maxValue = Math.max(...this.datasets.filter(dataset => dataset.isDisplayed).
            map(dataset => dataset.getMax()));
        const {high} = niceTicks(0, maxValue, this.options.yAxis.totalTicks);
        this.maxValue = high;
        return previousMax !== high;
    }

    draw() {
        if (this.xAxis) this.xAxis.draw(this.labels, this.maxValue);
        if (this.yAxis) this.yAxis.draw(this.labels, this.maxValue);
        if (this.selection) this.selection.draw();
        this.lines.draw();
    }

    setSelection(start, end) {
        this.start = start;
        this.end = end;
        const {labels, xAxis, yAxis, tooltip, datasets} = this;
        const maxX = labels.length - 1;
        for (const dataset of datasets) {
            dataset.setRanges(start, end);
        }
        if (xAxis) {
            xAxis.setSelection(start, end);
            xAxis.setAbsoluteValues(maxX, this.maxValue);
            xAxis.draw(labels);
        }
        if (!datasets.some(d => d.isDisplayed)) {
            return;
        }
        const changed = this.calculateMaxValue();
        const maxY = this.maxValue;
        if (changed && yAxis) {
            yAxis.animatedDraw(labels, maxY);
        }
        if (tooltip) tooltip.setAbsoluteValues(maxX, maxY);

        this.lines.animatedResize(maxX, maxY).animate();
    }

    emitLegendChange(index, isDisplayed) {
        const {maxValue:previousMaxY, lines, labels, preview, yAxis, tooltip, datasets} = this;
        datasets[index].isDisplayed = isDisplayed;
        const changed = this.calculateMaxValue();
        const maxX = labels.length - 1;
        const maxY = this.maxValue || previousMaxY;
        lines.toggle(index);
        if (preview) preview.emitLegendChange(index, isDisplayed);
        if (changed) {
            if (yAxis) yAxis.animatedDraw(labels, maxY);
            if (tooltip) tooltip.setAbsoluteValues(maxX, maxY);
            lines.animatedResize(maxX, maxY);
        }
        lines.animate();
    }
}