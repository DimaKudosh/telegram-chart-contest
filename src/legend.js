export default class Legend {
    constructor(parentContainer, chart) {
        this.chart = chart;
        this.container = this.create();

        parentContainer.appendChild(this.container);
    }

    create() {
        const div = document.createElement('div');
        div.classList.add('telegram-chart-legend');
        for (const dataset of this.chart.datasets) {
            const label = document.createElement('label');
            label.textContent = dataset.name;
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            const checkmark = document.createElement('span');
            label.appendChild(checkbox);
            label.appendChild(checkmark);
            div.appendChild(label);
        }
        return div;
    }
}