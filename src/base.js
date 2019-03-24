export class OptionableUIElement {
    constructor(options) {
        this.options = options;
    }

    updateOptions(options) {
        this.options = {...this.options, ...options};
    }
}


export default class BaseUIElement extends OptionableUIElement {
    constructor (canvas, options) {
        super(options);
        this.canvas = canvas;
        this.ctx = canvas.getCtx();
    }

    setAbsoluteValues(maxX, maxY) {
        this.canvas.setAbsoluteValues(maxX, maxY);
    }
}
