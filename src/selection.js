const RESIZE_LEFT = 'l',
    RESIZE_RIGHT = 'r',
    DRAGGING = 'd';


export default class Selection {
    constructor(canvas, chart, options) {
        this.chart = chart;
        this.target = options['target'];
        this.canvas = canvas;
        this.ctx = canvas.ctx;
        this.canvasHeight = canvas.height;
        this.canvasWidth = canvas.width;

        this.borderWidth = 5;
        this.start = this.borderWidth;
        this.end = this.canvasWidth - this.borderWidth;
        this.lastSelection = [0, chart.labels.length - 1];

        this.status = null;
        this.lastX = null;
        this.lastCursor = 'default';
        this.cursorOnCanvas = false;

        this.canvasOffset = canvas.canvas.offsetLeft;

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

    draw() {
        const canvas = this.canvas,
              ctx = canvas.ctx,
              start = this.start,
              end = this.end,
              borderWidth = this.borderWidth,
              canvasWidth = this.canvasWidth,
              canvasHeight = this.canvasHeight;
        canvas.clear();
        ctx.fillStyle = 'black';
        ctx.globalAlpha = 0.1;
        ctx.fillRect(0, 0, start - borderWidth, canvasHeight);
        ctx.fillRect(end + borderWidth, 0, canvasWidth - end + borderWidth, canvasHeight);
        ctx.globalAlpha = 1;
        ctx.strokeStyle = 'blue';
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
        const ratio = (this.chart.labels.length - 1) / this.canvasWidth,
              borderWidth = this.borderWidth,
              round = Math.round,
              start = round((this.start - borderWidth) * ratio),
              end = round((this.end + borderWidth) * ratio),
              lastSelection = this.lastSelection;
        if (lastSelection[0] !== start || lastSelection[1] !== end) {
            this.lastSelection = [start, end];
            this.target.setSelection(start, end);
        }
    }

    getStatus(x) {
        const borderWidth = this.borderWidth,
              start = this.start,
              end = this.end;
        if (start - borderWidth <= x && x <= start + borderWidth) {
            return RESIZE_LEFT;
        } else if (end - borderWidth <= x && x <= end + borderWidth) {
            return RESIZE_RIGHT;
        } else if (start + borderWidth < x && x < end - borderWidth) {
            return DRAGGING;
        }
    }

    onMouseDown(e) {
        const x = e.offsetX - this.canvasOffset,
              status = this.getStatus(x);
        this.status = status;
        if (status === DRAGGING) {
            this.lastX = x;
            this.body.style.cursor = 'grabbing';
        }
    }

    onMouseMove(e) {
        const x = e.offsetX - this.canvasOffset;
        const status = this.status;
        if (!status) {
            if (this.cursorOnCanvas) {
                this.setCursor(x);
            }
            return;
        }
        const borderWidth = this.borderWidth,
              canvasWidth = this.canvasWidth - borderWidth;
        let start = this.start,
            end = this.end;
        switch (status) {
            case RESIZE_LEFT:
                start = start < borderWidth ? borderWidth : x;
                break;
            case RESIZE_RIGHT:
                end = end > canvasWidth ? canvasWidth : x;
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