import BaseUIElement from './base';


const RESIZE_LEFT = 'l';
const RESIZE_RIGHT = 'r';
const DRAGGING = 'd';


export default class Selection extends BaseUIElement {
    constructor(canvas, target, options) {
        super(canvas, options);
        this.target = target;
        this.totalLabels = target.allLabels.length;
        this.canvasHeight = canvas.height;
        this.canvasWidth = canvas.width;

        this.borderWidth = 5;
        this.start = this.borderWidth;
        this.end = this.canvasWidth - this.borderWidth;
        this.lastSelection = [0, this.totalLabels - 1];

        this.status = null;
        this.lastX = null;
        this.lastCursor = 'default';
        this.cursorOnCanvas = false;

        setTimeout(() => {
            this.canvasOffset = canvas.canvas.getBoundingClientRect()['left'];
        }, 300);

        const canvasEl = this.ctx.canvas;
        const canvasEventListener = canvasEl.addEventListener.bind(canvasEl);
        canvasEventListener('mousedown', this.onMouseDown.bind(this));
        canvasEventListener('mouseover', this.onMouseOver.bind(this));
        canvasEventListener('mouseout', this.onMouseOut.bind(this));
        const document = window.document;
        const documentEventListener = document.addEventListener.bind(document);
        documentEventListener('mousemove', this.onMouseMove.bind(this));
        documentEventListener('mouseup', this.onMouseUp.bind(this));

        this.body = document.body;
    }

    updateOptions(options) {
        super.updateOptions(options);
        this.draw();
    }

    draw() {
        const {canvas, ctx, start, end, borderWidth, canvasWidth, canvasHeight, options} = this;
        canvas.clear();
        ctx.save();
        ctx.fillStyle = options.backgroundColor;
        ctx.globalAlpha = options.backgroundAlpha;
        ctx.fillRect(0, 0, start - borderWidth, canvasHeight);
        ctx.fillRect(end + borderWidth, 0, canvasWidth - end + borderWidth, canvasHeight);
        ctx.restore();
        ctx.strokeStyle = options.borderColor;
        ctx.lineWidth = borderWidth * 2;
        ctx.strokeRect(start, 0, end - start, canvasHeight);
    }


    setCursor(x) {
        if (this.cursorOnCanvas || this.status) {
            const status = this.getStatus(x);
            let cursor;
            if (!status) {
                cursor = this.lastCursor;
            } else if (status === DRAGGING) {
                cursor = 'grab';
            } else {
                cursor = 'ew-resize';
            }
            this.body.style.cursor = cursor;
        }
    }

    updateTarget() {
        const {totalLabels, canvasWidth, borderWidth, start, end, lastSelection} = this;
        const ratio = totalLabels / (canvasWidth - (borderWidth * 2));
        const startIndex = Math.round((start - borderWidth) * ratio);
        const endIndex = startIndex + (end - start) * ratio;
        if (lastSelection[0] !== startIndex || lastSelection[1] !== endIndex) {
            this.lastSelection = [startIndex, endIndex];
            this.target.setSelection(startIndex, endIndex);
        }
    }

    getStatus(x) {
        const {borderWidth, start, end} = this;
        if (start - borderWidth < x && x < start + borderWidth) {
            return RESIZE_LEFT;
        } else if (end - borderWidth <= x && x <= end + borderWidth) {
            return RESIZE_RIGHT;
        } else if (start + borderWidth < x && x < end - borderWidth) {
            return DRAGGING;
        }
    }

    onMouseDown(e) {
        const x = e.pageX - this.canvasOffset;
        const status = this.getStatus(x);
        this.status = status;
        if (status === DRAGGING) {
            this.lastX = x;
            this.body.style.cursor = 'grabbing';
        }
    }

    onMouseMove(e) {
        const x = e.pageX - this.canvasOffset;
        const status = this.status;
        if (!status) {
            if (this.cursorOnCanvas) {
                this.setCursor(x);
            }
            return;
        }
        const borderWidth = this.borderWidth;
        const canvasWidth = this.canvasWidth - borderWidth;
        let {start, end} = this;
        switch (status) {
        case RESIZE_LEFT:
            start = (start < borderWidth) ? borderWidth : x;
            if ((end - start) < canvasWidth * 0.05) {
                start = end - (canvasWidth * 0.05);
            }
            break;
        case RESIZE_RIGHT:
            end = (end > canvasWidth) ? canvasWidth : x;
            if ((end - start) < canvasWidth * 0.05) {
                end = start + (canvasWidth * 0.05);
            }
            break;
        case DRAGGING: {
            const selectionWidth = end - start;
            let diff = x - this.lastX;
            this.lastX = x;
            if (diff < 0) {
                start += diff;
                if (start < borderWidth) {
                    start = borderWidth;
                }
                end = start + selectionWidth;
            }
            if (diff > 0) {
                end += diff;
                if (end > canvasWidth) {
                    end = canvasWidth;
                }
                start = end - selectionWidth;
            }
            break;
        }
        }
        if (start > end) {
            end = start;
        }
        start = (start < borderWidth) ? borderWidth : start;
        end = (end > canvasWidth) ? canvasWidth : end;

        this.start = start;
        this.end = end;
        this.updateTarget();
        this.draw();
    }

    onMouseUp() {
        if (this.status) {
            this.updateTarget();
        }
        this.status = null;
        this.lastX = null;
        if (!this.cursorOnCanvas) {
            this.body.style.cursor = this.lastCursor;
        }
    }

    onMouseOver() {
        this.cursorOnCanvas = true;
        if (!this.status) {
            this.lastCursor = this.body.style.cursor;
        }
    }

    onMouseOut() {
        this.cursorOnCanvas = false;
        if (!this.status) {
            this.body.style.cursor = this.lastCursor;
        }
    }
}