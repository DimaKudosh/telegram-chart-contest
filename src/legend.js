import {OptionableUIElement} from "./base";
import { generateID } from './utils';


export default class Legend extends OptionableUIElement {
    constructor(parentContainer, chart, options) {
        super(options);
        this.chart = chart;
        this.container = this.create();
        parentContainer.appendChild(this.container);
    }

    updateOptions(updatedOptions) {
        super.updateOptions(updatedOptions);
        const {container, options} = this;
        container.style.color = options.textColor;
        for(let node of container.childNodes) {
            node.style.borderColor = options.borderColor;
        }
    }

    create() {
        const {chart, options} = this;
        const datasets = chart.datasets;
        const div = document.createElement('div');
        div.classList.add('telegram-chart-legend');
        div.style.color = options.textColor;
        div.style.borderColor = options.borderColor;
        for (const dataset of datasets) {
            const id = generateID();
            const checkboxContainer = document.createElement('div');
            checkboxContainer.classList.add('telegram-chart-legend-checkbox');

            const label = document.createElement('label');
            label.setAttribute('for', id);

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = id;
            checkbox.checked = true;
            checkbox.addEventListener('click', () => {
                chart.emitLegendChange(datasets.indexOf(dataset), checkbox.checked);
            });

            const checkmark = document.createElement('span');
            checkmark.style.borderColor = dataset.color;

            label.appendChild(checkmark);
            label.appendChild(document.createTextNode(dataset.name));
            checkboxContainer.appendChild(checkbox);
            checkboxContainer.appendChild(label);
            div.appendChild(checkboxContainer);
        }
        return div;
    }
}
