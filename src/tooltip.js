import {tooltipTimestampToString} from './utils';


export default class Tooltip {
    constructor(canvas, chart, options) {
        this.canvas = canvas;
        this.labels = chart.labels;
        this.datasets = chart.datasets;
        this.maxValue = chart.maxValue;
        this.chart = chart;
        this.cache = {};
        this.options = options;

        canvas.canvas.addEventListener('mousemove', this.onMouseMove.bind(this), true);
        canvas.canvas.addEventListener('mouseout', this.onMouseOut.bind(this), true);
        [this.mainContainer, this.title, this.containers, this.values] = this.create();
        this.offsetX = 25;
    }

    create() {
        const div = document.createElement('div');
        div.classList.add('telegram-chart-tooltip');
        const title = document.createElement('div');
        title.classList.add('telegram-chart-tooltip-title');
        const allDatasetsContainers = document.createElement('div');
        allDatasetsContainers.classList.add('telegram-chart-tooltip-datasets-group');

        const datasetContainers = [];
        const datasetValues = [];

        for (const dataset of this.datasets) {
            const datasetContainer = document.createElement('div');
            datasetContainer.classList.add('telegram-chart-tooltip-dataset');
            datasetContainer.style.color = dataset.color;
            datasetContainers.push(datasetContainer);

            const value = document.createElement('div');
            value.classList.add('telegram-chart-tooltip-dataset-value');
            datasetValues.push(value);

            const name = document.createElement('div');
            name.classList.add('telegram-chart-tooltip-dataset-name');
            name.innerText = dataset.name;
            datasetContainer.appendChild(value);
            datasetContainer.appendChild(name);
            allDatasetsContainers.appendChild(datasetContainer);
        }
        div.appendChild(title);
        div.appendChild(allDatasetsContainers);
        this.chart.container.appendChild(div);
        return [div, title, datasetContainers, datasetValues];
    }

    renderLabel(label) {
        let val = this.cache[label];
        if (!val) {
            val = tooltipTimestampToString(label);
            this.cache[label] = val;
        }
        return val;
    }

    onMouseMove(e) {
        const {canvas, labels, datasets, options} = this;
        this.mainContainer.style.display = 'block';
        this.mainContainer.style.backgroundColor = this.options.backgroundColor;
        const x = e.offsetX - canvas.canvas.offsetLeft;
        const index = Math.floor((x / canvas.width) * labels.length);
        this.title.textContent = tooltipTimestampToString(labels[index]);
        canvas.clear();
        canvas.drawLine([[index, 0], [index, this.maxValue]], options.color, 1);
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
        this.mainContainer.style.left = (x - this.offsetX) + 'px';
    }

    onMouseOut() {
        this.canvas.clear();
        this.mainContainer.style.display = 'none';
    }
}
