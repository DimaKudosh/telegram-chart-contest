import Canvas from './canvas';
import XAxis from './xAxis';
import YAxis from './yAxis';
import Selection from './selection';
import { niceTicks } from './utils';
import Dataset from './dataset';
import Tooltip from './tooltip';
import Line from './line';
import Legend from './legend';
import { DEFAULT_OPTIONS } from './options';


export class LineChart {
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

        this.lines = this.datasets.map((dataset) => {
            const canvas = new Canvas(width, height, offsets);
            layers.push(canvas);
            return new Line(canvas, dataset, {});
        });

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
        this.options = newOptions
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
        for (const line of this.lines) {
            line.draw();
        }
    }

    setSelection(start, end) {
        this.start = start;
        this.end = end;
        this.xAxis.setSelection(start, end);
        for (const dataset of this.datasets) {
            dataset.setRanges(start, end);
        }
        this.calculateMaxValue();
        const {lines, labels, xAxis, maxValue: maxY} = this;
        const maxX = labels.length - 1;
        this.yAxis.animatedDraw(labels, maxY);
        this.tooltip.canvas.setAbsoluteValues(maxX, maxY);
        for (const line of lines) {
            if (line.dataset.isDisplayed) {
                line.animatedResize(maxX, maxY).animate();
            } else {
                line.canvas.setAbsoluteValues(maxX, maxY);
            }
        }
        xAxis.canvas.setAbsoluteValues(maxX, maxY);
        xAxis.draw(labels, maxY);
    }

    emitLegendChange(index, isDisplayed) {
        this.datasets[index].isDisplayed = isDisplayed;
        const {maxValue:previousMaxY, lines, labels, preview, yAxis, tooltip} = this;
        const changed = this.calculateMaxValue();
        const maxX = labels.length - 1;
        const maxY = this.maxValue || previousMaxY;
        if (preview) preview.emitLegendChange(index, isDisplayed);
        if (changed) {
            if (yAxis) yAxis.animatedDraw(labels, maxY);
            if (tooltip) tooltip.canvas.setAbsoluteValues(maxX, maxY);
            for (let i = 0; i < lines.length; i++) {
                let line = lines[i];
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