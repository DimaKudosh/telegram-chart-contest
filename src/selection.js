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
        this.borderWidth = 10;
        this.start = this.borderWidth / 2;
        this.end = this.canvasWidth - this.borderWidth / 2;

        this.status = null;
        this.lastX = null;
        this.previousCursor = 'default';
        this.cursorOnCanvas = false;

        this.canvasOffset = canvas.canvas.offsetLeft;

        this.body = document.body;
        this.ctx.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.ctx.canvas.addEventListener('mouseover', this.onMouseOver.bind(this));
        this.ctx.canvas.addEventListener('mouseout', this.onMouseOut.bind(this));
        document.addEventListener('mousemove', this.onMouseMove.bind(this));
        document.addEventListener('mouseup', this.onMouseUp.bind(this));

    }

    draw() {
        this.canvas.clear();
        const ctx = this.canvas.ctx;
        ctx.fillStyle = 'black';
        ctx.globalAlpha = 0.1;
        ctx.fillRect(0, 0, this.start, this.canvasHeight);
        ctx.fillRect(this.end, 0, this.canvasWidth - this.end, this.canvasHeight);
        ctx.globalAlpha = 1;
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = this.borderWidth;
        ctx.strokeRect(this.start, 0, this.end - this.start, this.canvasHeight);
    }

    setCursor(x) {
        if (this.cursorOnCanvas || this.status) {
            const status = this.getStatus(x);
            let cursor;
            if (!status) {
                cursor = this.previousCursor;
            } else if (status === DRAGGING) {
                cursor = 'grab';
            } else {
                cursor = 'ew-resize';
            }
            this.body.style.cursor = cursor;
        }
    }

    updateTarget() {
        const canvasWidth = this.canvas.width;
        const labels = this.chart.labels;
        const ratio = (labels.length - 1) / canvasWidth;
        const borderWidth = this.borderWidth / 2;
        const start = labels[Math.round((this.start - borderWidth) * ratio)],
              end = labels[Math.round((this.end + borderWidth) * ratio)];
        this.target.setSelection(start, end);
    }

    getStatus(x) {
        const borderWidth = this.borderWidth / 2;
        const start = this.start;
        const end = this.end;
        if (start - borderWidth <= x && x <= start + borderWidth) {
            return RESIZE_LEFT;
        } else if (end - borderWidth <= x && x <= end + borderWidth) {
            return RESIZE_RIGHT;
        } else if (start + borderWidth < x && x < end - borderWidth) {
            return DRAGGING;
        }
    }

    onMouseDown(e) {
        const x = e.offsetX - this.canvasOffset;
        this.status = this.getStatus(x);
        if (this.status === DRAGGING) {
            this.lastX = x;
            this.body.style.cursor = 'grabbing';
        }
    }

    onMouseMove(e) {
        if (!this.status) {
            if (this.cursorOnCanvas) {
                const x = e.offsetX - this.canvasOffset;
                this.setCursor(x);
            }
            return;
        }
        const x = e.offsetX - this.canvasOffset;
        const borderWidth = this.borderWidth / 2;
        const canvasWidth = this.canvas.width - borderWidth;
        switch (this.status) {
            case RESIZE_LEFT:
                this.start = this.start < borderWidth ? borderWidth : x;
                break;
            case RESIZE_RIGHT:
                this.end = this.end > canvasWidth ? canvasWidth : x;
                break;
            case DRAGGING: {
                const selectionWidth = this.end - this.start;
                let diff = x - this.lastX;
                this.lastX = x;
                if (diff < 0) {
                    this.start += diff;
                    if (this.start < this.borderWidth / 2) {
                        this.start = this.borderWidth / 2;
                    }
                    this.end = this.start + selectionWidth;
                }
                if (diff > 0) {
                    this.end += diff;
                    if (this.end > canvasWidth) {
                        this.end = canvasWidth;
                    }
                    this.start = this.end - selectionWidth;
                }
                break;
            }
        }
        if (this.start > this.end) {
            this.end = this.start;
        }
        this.updateTarget();
        this.draw();
    }

    onMouseUp() {
        this.status = null;
        this.lastX = null;
        this.updateTarget();
        if (!this.cursorOnCanvas) {
            this.body.style.cursor = this.previousCursor;
        }
    }

    onMouseOver() {
        this.cursorOnCanvas = true;
        if (!this.status) {
            this.previousCursor = this.body.style.cursor;
        }
    }

    onMouseOut() {
        this.cursorOnCanvas = false;
        if (!this.status) {
            this.body.style.cursor = this.previousCursor;
        }
    }
}