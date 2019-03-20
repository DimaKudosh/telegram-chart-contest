import { generateID } from './utils';


export default class Legend {
    constructor(parentContainer, chart) {
        this.chart = chart;
        this.container = this.create();

        parentContainer.appendChild(this.container);
    }

    create() {
        const div = document.createElement('div');
        div.classList.add('telegram-chart-legend');
        let i = 0;
        for (const dataset of this.chart.datasets) {
            const id = generateID();
            const container = document.createElement('div');
            container.classList.add('telegram-chart-legend-checkbox');
            const label = document.createElement('label');
            label.setAttribute('for', id);
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = id;
            checkbox.checked = true;
            const j = i;
            checkbox.addEventListener('click', () => {
                dataset.isDisplayed = checkbox.checked;
                this.chart.emitLegendChange(j);
            });
            const checkmark = document.createElement('span');
            checkmark.style.borderColor = dataset.color;
            container.appendChild(checkbox);

            label.appendChild(checkmark);
            label.appendChild(document.createTextNode(dataset.name));
            container.appendChild(label);
            div.appendChild(container);
            i++;
        }
        return div;
    }
}