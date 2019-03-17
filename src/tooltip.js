import {tooltipTimestampToString} from './utils';


export default class Tooltip {
    constructor(canvas, chart) {
        this.canvas = canvas;
        this.labels = chart.labels;
        this.datasets = chart.datasets;
        this.maxValue = chart.maxValue;
        this.chart = chart;

        this.canvas.canvas.addEventListener('mousemove', this.onMouseMove.bind(this), true);
        this.canvas.canvas.addEventListener('mouseout', this.onMouseOut.bind(this), true);
        this.container = this.create();
        this.offsetX = 25;
    }

    create() {
        const div = document.createElement('div');
        div.classList.add('telegram-chart-tooltip');
        div.style.backgroundColor = '#fff';
        const title = document.createElement('div');
        title.classList.add('telegram-chart-tooltip-title');
        title.innerText = 'Sat, 6 Mar';
        const allDatasetsContainer = document.createElement('div');
        allDatasetsContainer.classList.add('telegram-chart-tooltip-datasets-group');
        for (const dataset of this.datasets) {
            const datasetContainer = document.createElement('div');
            datasetContainer.classList.add('telegram-chart-tooltip-dataset');
            datasetContainer.style.color = dataset.color;
            const value = document.createElement('div');
            value.classList.add('telegram-chart-tooltip-dataset-value');
            value.textContent = '0';
            const name = document.createElement('div');
            name.classList.add('telegram-chart-tooltip-dataset-name');
            name.innerText = dataset.name;
            datasetContainer.appendChild(value);
            datasetContainer.appendChild(name);
            allDatasetsContainer.appendChild(datasetContainer);
        }
        div.appendChild(title);
        div.appendChild(allDatasetsContainer);
        this.chart.container.appendChild(div);
        return div;
    }

    onMouseMove(e) {
        this.container.style.display = 'block';
        const x = e.offsetX - this.canvas.canvas.offsetLeft;
        const index = Math.floor((x / this.canvas.width) * this.chart.labels.length);
        this.container.querySelector('.telegram-chart-tooltip-title').textContent = tooltipTimestampToString(this.chart.labels[index]);
        this.canvas.clear();
        this.canvas.drawLine([[index, 0], [index, this.maxValue]], '#eee', 1);
        const datasetElements = this.container.querySelectorAll('.telegram-chart-tooltip-dataset-value');
        let i = 0;
        for (const dataset of this.datasets) {
            datasetElements[i].textContent = dataset.data[index];
            i++;
            this.canvas.drawArc(index, dataset.data[index], 4, dataset.color, 4, '#fff');
        }
        this.container.style.left = (x - this.offsetX) + 'px';
    }

    onMouseOut() {
        this.canvas.clear();
        this.container.style.display = 'none';
    }
}
