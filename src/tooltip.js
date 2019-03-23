import BaseUIElement from './base';
import {tooltipTimestampToString} from './utils';


export default class Tooltip extends BaseUIElement {
    constructor(canvas, chart, options) {
        super(canvas, options);
        this.labels = chart.labels;
        this.datasets = chart.datasets;
        this.maxValue = chart.maxValue;
        this.chart = chart;
        this.offsetX = 25;
        this.lastIndex = 0;

        this.create();
        canvas.canvas.addEventListener('mousemove', this.onMouseMove.bind(this), true);
        canvas.canvas.addEventListener('mouseout', this.onMouseOut.bind(this), true);
    }

    updateOptions(options) {
        super.updateOptions(options);
        this.title.style.color = options.textColor;
    }

    create() {
        const div = document.createElement('div');
        div.classList.add('telegram-chart-tooltip');
        const title = document.createElement('div');
        title.classList.add('telegram-chart-tooltip-title');
        const allDatasetsContainers = document.createElement('div');
        allDatasetsContainers.classList.add('telegram-chart-tooltip-group');

        const datasetContainers = [];
        const datasetValues = [];

        for (const dataset of this.datasets) {
            const datasetContainer = document.createElement('div');
            datasetContainer.classList.add('telegram-chart-tooltip-dataset');
            datasetContainer.style.color = dataset.color;
            datasetContainers.push(datasetContainer);

            const value = document.createElement('div');
            value.classList.add('telegram-chart-tooltip-value');
            datasetValues.push(value);

            const name = document.createElement('div');
            name.classList.add('telegram-chart-tooltip-name');
            name.innerText = dataset.name;
            datasetContainer.appendChild(value);
            datasetContainer.appendChild(name);
            allDatasetsContainers.appendChild(datasetContainer);
        }
        div.appendChild(title);
        div.appendChild(allDatasetsContainers);
        this.chart.container.appendChild(div);
        this.mainContainer = div;
        this.title = title;
        this.containers = datasetContainers;
        this.values = datasetValues;
    }

    placeTooltip(x) {
        const width = this.canvas.width;
        const container = this.mainContainer;
        const containerWidth = container.clientWidth;
        const preferredPosition = x - this.offsetX;
        let position;
        if (preferredPosition < 5) {
            position = 5;
        } else if (preferredPosition + containerWidth > width - 5) {
            position = width - containerWidth - 5;
        } else {
            position = preferredPosition;
        }
        container.style.left = position + 'px';
    }

    clear() {
        const {canvas, ctx} = this;
        const [x, h] = canvas.translatePoint(this.lastIndex, 0);
        ctx.clearRect(x - 15, 0, 30, h);
    }

    onMouseMove(e) {
        const {canvas, chart: {labels}, datasets, options} = this;
        this.mainContainer.style.display = 'block';
        this.mainContainer.style.backgroundColor = this.options.backgroundColor;
        const x = e.offsetX - canvas.canvas.offsetLeft;
        const index = Math.floor((x / canvas.width) * labels.length);
        this.title.textContent = tooltipTimestampToString(labels[index]);
        this.clear();
        canvas.drawLine([[index, 0], [index, this.maxValue]], options.color, 2);
        for (let i = 0; i < datasets.length; i++) {
            const dataset = datasets[i];
            const container = this.containers[i];
            if (!dataset.isDisplayed) {
                container.style.display = 'none';
                continue;
            } else {
                container.style.display = 'block';
            }
            this.values[i].textContent = dataset.data[index];
            this.canvas.drawArc(index, dataset.data[index], 4, dataset.color, 4, options.backgroundColor);
        }
        this.placeTooltip(x);
        this.lastIndex = index;
    }

    onMouseOut() {
        this.clear();
        this.mainContainer.style.display = 'none';
    }
}
