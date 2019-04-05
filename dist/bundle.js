(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = global || self, global.LineChart = factory());
}(this, function () { 'use strict';

    class Canvas {
        constructor(width, height, offsets, isTopLayer=false) {
            this.width = width;
            this.height = height;
            this.offsets = offsets;
            this.canvas = this.create();
            this.ctx = this.canvas.getContext('2d');
            this.xRatio = 1;
            this.yRatio = 1;

            if (isTopLayer) {
                this.canvas.classList.add('telegram-chart-top-layer');
            }
        }

        create() {
            const canvas = document.createElement('canvas');
            canvas.width = this.width;
            canvas.height = this.height;
            canvas.addEventListener('dragstart', function(e) { e.preventDefault(); });
            return canvas;
        }

        getCtx() {
            return this.ctx;
        }

        computeXRatio(maxX) {
            const offsets = this.offsets;
            return (this.width - offsets.left - offsets.right) / maxX;
        }

        computeYRatio(maxY) {
            const offsets = this.offsets;
            return (this.height - offsets.top - offsets.bottom) / maxY;
        }

        setAbsoluteValues(maxX, maxY) {
            if (maxX) this.xRatio = this.computeXRatio(maxX);
            if (maxY) this.yRatio = this.computeYRatio(maxY);
        }

        translateY(y) {
            return Math.round(this.height - y * this.yRatio) -  this.offsets.bottom;
        }

        translateX(x) {
            return Math.round(x * this.xRatio) + this.offsets.left;
        }

        translatePoint(x, y) {
            return [this.translateX(x), this.translateY(y)];
        }

        drawLine(points, color, width=3) {
            const ctx = this.ctx;
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.lineWidth = width;
            ctx.moveTo(...this.translatePoint(...points[0]));
            for (let i = 1; i < points.length; i++) {
                const [x, y] = this.translatePoint(...points[i]);
                ctx.lineTo(x, y);
            }
            ctx.stroke();
            ctx.closePath();
        }

        drawArc(x, y, radius, color, width=3, fillColor=null) {
            const ctx = this.ctx;
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.lineWidth = width;
            [x, y] = this.translatePoint(x, y);
            ctx.arc(x, y, radius, 0, 2 * Math.PI);
            ctx.stroke();
            if (fillColor) {
                ctx.fillStyle = fillColor;
                ctx.fill();
            }
        }

        putText(x, y, text, xOffset, yOffset) {
            const ctx = this.ctx;
            [x, y] = this.translatePoint(x, y);
            ctx.fillText(text, x + (xOffset ? xOffset : 0), y + (yOffset ? yOffset : 0));
        }

        clear() {
            this.ctx.clearRect(0, 0, this.width, this.height);
        }
    }

    class OptionableUIElement {
        constructor(options) {
            this.options = options;
        }

        updateOptions(options) {
            this.options = {...this.options, ...options};
        }
    }


    class BaseUIElement extends OptionableUIElement {
        constructor (canvas, options) {
            super(options);
            this.canvas = canvas;
            this.ctx = canvas.getCtx();
        }

        setAbsoluteValues(maxX, maxY) {
            this.canvas.setAbsoluteValues(maxX, maxY);
        }

        clear() {
            this.canvas.clear();
        }
    }

    class Animation {
        constructor(duration=300) {
            this.duration = duration;
            this.reqId = null;
            this.isRunning = false;
            this.cancelCallback = null;
        }

        run(ctx, stepCallback, completeCallback, cancelCallback) {
            const duration = this.duration;
            const now = Date.now;
            const animationStartTime = now();
            this.cancelCallback = cancelCallback;
            const render = () => {
                ctx.save();
                const progress = (now() - animationStartTime) / duration;
                if (progress >= 1) {
                    stepCallback(1);
                    if (completeCallback) {
                        completeCallback();
                    }
                    ctx.restore();
                    this.isRunning = false;
                    this.cancelCallback = null;
                    return;
                }
                stepCallback(progress);
                ctx.restore();
                this.reqId = requestAnimationFrame(render);
            };
            this.isRunning = true;
            render();
        }

        cancel() {
            const {reqId, cancelCallback} = this;
            if (reqId) {
                cancelAnimationFrame(reqId);
            }
            if (cancelCallback) {
                cancelCallback();
            }
            this.isRunning = false;
            this.reqId = this.cancelCallback = null;
        }
    }

    const dateFormatter =  new Intl.DateTimeFormat('en-us', { month: 'short', day: 'numeric' });
    const tooltipDateFormatter = new Intl.DateTimeFormat('en-us', { weekday: 'short', month: 'short', day: 'numeric' });


    function timestampToString(timestamp) {
        return dateFormatter.format(timestamp);
    }

    function tooltipTimestampToString(timestamp) {
        return tooltipDateFormatter.format(timestamp);
    }

    function generateID() {
        return '_' + Math.random().toString(36).substr(2, 9);
    }

    function niceRound(x, intervals) {
        if (x === 0) {
            return 0;
        }
        const fraction = Math.pow(10, Math.ceil(Math.log10(x)) - 1);
        for (let i = 0; i < intervals.length - 1; i++) {
            const result = intervals[i] * fraction;
            const cutoff = (result + intervals[i+1] * fraction) / 2;
            if (x <= cutoff) {
                return result;
            }
        }
        return intervals[intervals.length - 1] * fraction;
    }

    function niceTicks(lo, hi, ticks=6, intervals=[1.0, 2.0, 2.5, 3.0, 5.0, 6.0, 10.0]) {
        const delta = hi - lo;
        const delta_tick = niceRound(delta / (ticks - 1), intervals);
        const lo_tick = Math.floor(lo / delta_tick) * delta_tick;
        const hi_tick = Math.ceil(hi / delta_tick) * delta_tick;
        return {low: lo_tick, high: hi_tick, spacing: delta_tick};
    }

    const NICE_INTERVAL = [1, 2, 3, 4, 6, 8, 10];


    class XAxis extends BaseUIElement {
        constructor(canvas, labels, options) {
            super(canvas, options);
            const ctx = this.ctx;
            ctx.textAlign = 'center';
            ctx.font = options.font;
            ctx.fillStyle = options.color;
            this.animation = new Animation(options.animation);
            this.indexOffset = 0.5;
            this.bottomOffset = 5;
            this.height = 25;

            this.allLabels = labels;

            this.start = 0;
            this.end = labels.length;

            this.appearSpacing = null;
            this.hideSpacing = null;
        }

        updateOptions(updatedOptions) {
            super.updateOptions(updatedOptions);
            const {ctx, options} = this;
            ctx.font = options.font;
            ctx.fillStyle = options.color;
            this.simpleDraw(this.appearSpacing);
        }

        setSelection(start, end) {
            this.start = start;
            this.end = end;
        }

        clear() {
            const {canvas, height} = this;
            this.ctx.clearRect(0, canvas.height - height, canvas.width, height);
        }

        draw(labels) {
            const {options: {totalTicks}, appearSpacing} = this;
            const {spacing: ticksSpacing} = niceTicks(0, labels.length, totalTicks, NICE_INTERVAL);
            if (!appearSpacing || ticksSpacing === appearSpacing) {
                this.appearSpacing = ticksSpacing;
                this.simpleDraw(ticksSpacing);
                return;
            }
            this.hideSpacing = appearSpacing;
            this.appearSpacing = ticksSpacing;
            this.runAnimatedDraw();
        }

        simpleDraw(ticksSpacing) {
            this.clear();
            const indexes = [];
            for (let i = this.indexOffset; i < this.allLabels.length / ticksSpacing; i++) {
                indexes.push(Math.floor(i * ticksSpacing));
            }
            this.drawLabels(indexes);
        }

        runAnimatedDraw() {
            const {animation, ctx, indexOffset} = this;
            if (animation.isRunning) {
                return;
            }
            animation.run(ctx, (progress) => {
                this.clear();
                const {allLabels, appearSpacing, hideSpacing} = this;
                const allAppearIndexes = new Set(),
                    allHideIndexes = new Set(),
                    labelsLength = allLabels.length;
                for (let i = indexOffset; i < labelsLength / appearSpacing; i++) {
                    allAppearIndexes.add(Math.floor(i * appearSpacing));
                }
                for (let i = indexOffset; i < labelsLength / hideSpacing; i++) {
                    allHideIndexes.add(Math.floor(i * hideSpacing));
                }
                const sameIndexes = new Set([...allAppearIndexes].filter(i => allHideIndexes.has(i))),
                    appearIndexes = new Set([...allAppearIndexes].filter(i => !sameIndexes.has(i))),
                    hideIndexes = new Set([...allHideIndexes].filter(i => !sameIndexes.has(i)));
                this.drawLabels(sameIndexes);
                ctx.globalAlpha = progress;
                this.drawLabels(appearIndexes);
                ctx.globalAlpha = 1 - progress;
                this.drawLabels(hideIndexes);
            });
        }

        drawLabels(indexes) {
            const canvas = this.canvas;
            const offset = -this.start * canvas.xRatio;
            for (const index of indexes) {
                const tick = this.allLabels[index];
                canvas.putText(index, 0, timestampToString(tick).toString(), offset, -this.bottomOffset);
            }
        }
    }

    class YAxis extends BaseUIElement {
        constructor(canvas, options) {
            super(canvas, options);
            this.previousTicks = [];
            this.ctx.font = this.options.font;
            this.textOffset = -5;
            this.animation = new Animation(options.animation);
            this.maxY = 0;

            this.lastDrawn = null;
        }

        updateOptions(options) {
            super.updateOptions(options);
            this.canvas.clear();
            this.drawTicks(...this.lastDrawn);
        }

        draw(labels, maxValue) {
            const {canvas, options: {totalTicks}} = this;
            const spacing = Math.round(maxValue / (totalTicks - 1));
            const ticks = [];
            canvas.clear();
            for (let i = 0; i < totalTicks; i++) {
                ticks.push(i * spacing);
            }
            this.drawTicks(labels, ticks);
            this.previousTicks = ticks;
        }

        animatedDraw(labels, maxY) {
            if (this.maxY === maxY) {
                return;
            }
            const {animation, options: {totalTicks}, ctx, canvas} = this;
            const spacing = Math.round(maxY / (totalTicks - 1));
            const newTicks = [];
            const xRatio = canvas.computeXRatio(labels.length - 1);
            const yRatio = canvas.computeYRatio(maxY);
            const currentYRatio = canvas.yRatio;
            const stepY = yRatio - currentYRatio;
            this.maxY = maxY;
            animation.cancel();
            for (let i = 0; i < totalTicks; i++) {
                newTicks.push(i * spacing);
            }
            canvas.xRatio = xRatio;
            const animationCallback = () => this.draw(labels, maxY);
            animation.run(ctx, (progress) => {
                canvas.clear();
                canvas.yRatio = currentYRatio + (progress * stepY);
                ctx.globalAlpha = 1 - progress;
                this.drawTicks(labels, this.previousTicks);
                ctx.globalAlpha = progress;
                this.drawTicks(labels, newTicks);
            }, animationCallback, animationCallback);
        }

        drawTicks(labels, ticks) {
            const {canvas, ctx, options} = this;
            for (const tick of ticks) {
                ctx.fillStyle = options.color;
                canvas.putText(0, tick, tick.toString(), 0, this.textOffset);
                canvas.drawLine([[0, tick], [labels.length, tick]], options.underlineColor, 2);
            }
            this.lastDrawn = [labels, ticks];
        }
    }

    const RESIZE_LEFT = 'l';
    const RESIZE_RIGHT = 'r';
    const DRAGGING = 'd';


    class Selection extends BaseUIElement {
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

            // wait for element creation
            setTimeout(() => {
                this.canvasOffset = canvas.canvas.getBoundingClientRect()['left'];
            }, 300);

            const document = window.document;
            const supportTouchEvents = 'ontouchstart' in window.document.documentElement;

            const canvasEl = this.ctx.canvas;
            const canvasEventListener = canvasEl.addEventListener.bind(canvasEl);
            canvasEventListener(supportTouchEvents ? 'touchstart': 'mousedown', this.onMouseDown.bind(this));
            if (!supportTouchEvents) {
                canvasEventListener('mouseover', this.onMouseOver.bind(this));
                canvasEventListener('mouseout', this.onMouseOut.bind(this));
            }
            const documentEventListener = document.addEventListener.bind(document);
            documentEventListener(supportTouchEvents ? 'touchmove': 'mousemove', this.onMouseMove.bind(this));
            documentEventListener(supportTouchEvents ? 'touchend': 'mouseup', this.onMouseUp.bind(this));

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
            const x = (e.pageX || e.touches[0].pageX) - this.canvasOffset;
            const status = this.getStatus(x);
            this.status = status;
            if (status === DRAGGING) {
                this.lastX = x;
                this.body.style.cursor = 'grabbing';
            }
        }

        onMouseMove(e) {
            const x = (e.pageX || e.touches[0].pageX) - this.canvasOffset;
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

    class Dataset {
        constructor({data, color, name}) {
            this.allData = data;
            this.color = color;
            this.name = name;

            this.start = 0;
            this.end = data.length;

            this.isDisplayed = true;
        }

        getMax() {
            return Math.max(...this.data);
        }

        getMin() {
            return Math.min(...this.data);
        }

        setRanges(start, end) {
            this.start = start;
            this.end = end;
        }

        get data() {
            return this.allData.slice(this.start, this.end + 1);
        }
    }

    class Tooltip extends BaseUIElement {
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
            ctx.clearRect(x - 10, 0, 20, h);
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

    class Lines extends BaseUIElement {
        constructor(canvas, datasets, options) {
            super(canvas, options);
            this.datasets = datasets;
            this.isDisplayed = false;
            this.callbacks = [];
            this.animation = new Animation();
            this.ctx.lineJoin = 'round';

            this.hiddingDatasets = [];
            this.appearingDatasets = [];
        }

        animate() {
            const {animation, callbacks, ctx} = this;
            animation.cancel();
            animation.run(ctx, (progress) => {
                for (const callback of callbacks) {
                    callback(progress);
                }
                this.draw(progress);
            }, () => {
                this.appearingDatasets = [];
                this.hiddingDatasets = [];
            });
            this.callbacks = [];
        }

        animatedResize(maxX, maxY) {
            const canvas = this.canvas;
            const yRatio = canvas.computeYRatio(maxY);
            const currentYRatio = canvas.yRatio;
            const stepY = yRatio - currentYRatio;
            canvas.xRatio = canvas.computeXRatio(maxX);
            this.callbacks.push((progress) => {
                canvas.yRatio = currentYRatio + (progress * stepY);
            });
            return this;
        }

        toggle(index) {
            const {appearingDatasets, hiddingDatasets} = this;
            if (this.datasets[index].isDisplayed) {
                appearingDatasets.push(index);
                hiddingDatasets.splice(hiddingDatasets.indexOf(index), 1);
            } else {
                hiddingDatasets.push(index);
                appearingDatasets.splice(appearingDatasets.indexOf(index), 1);
            }
        }

        drawDataset(dataset) {
            this.canvas.drawLine(Array.from(dataset.data.entries()), dataset.color);
        }

        draw(progress=1) {
            this.clear();
            const {datasets, appearingDatasets, hiddingDatasets, ctx} = this;
            for (let i = 0; i < datasets.length; i++) {
                if (appearingDatasets.indexOf(i) !== -1 ||
                    hiddingDatasets.indexOf(i) !== -1 ||
                    !datasets[i].isDisplayed) {
                    continue;
                }
                this.drawDataset(datasets[i]);
            }
            ctx.save();
            if (appearingDatasets) {
                ctx.globalAlpha = progress;
                for (const i of appearingDatasets) {
                    this.drawDataset(datasets[i]);
                }
            }
            if (hiddingDatasets) {
                ctx.globalAlpha = 1 - progress;
                for (const i of hiddingDatasets) {
                    this.drawDataset(datasets[i]);
                }
            }
            ctx.restore();
        }
    }

    class Legend extends OptionableUIElement {
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

    const font = '15px Arial';
    const offsets = {top: 20, right: 7, bottom: 25, left: 7};
    const previewOffsets = {top: 5, right: 0, bottom: 5, left: 0};

    const DEFAULT_OPTIONS = {
        yAxis: {
            display: true,
            font: font,
            totalTicks: 6,
            animation: 300,
            color: '#96a2aa',
            underlineColor: '#f2f4f5',
        },
        xAxis: {
            display: true,
            font: font,
            totalTicks: 8,
            color: '#96a2aa',
            animation: 300,
        },
        legend: {
            display: true,
            borderColor: '#344658',
            textColor: '#000',
        },
        tooltip: {
            display: true,
            textColor: '#000',
            color: '#dfe6eb',
            backgroundColor: '#fff',
        },
        selection: {
            display: false,
        },
        height: 400,
        offsets: offsets,
        preview: {
            display: true,
            height: 100,
            offsets: previewOffsets,
            yAxis: {
                display: false,
            },
            xAxis: {
                display: false,
            },
            legend: {
                display: false,
            },
            tooltip: {
                display: false,
            },
            selection: {
                display: true,
                backgroundAlpha: 0.75,
                backgroundColor: '#f5f9fb',
                borderColor: '#ddeaf3',
            },
            preview: {
                display: false,
            }
        },
    };

    class LineChart {
        constructor(container, labels, datasets, userOptions) {
            const options = {...DEFAULT_OPTIONS, ...userOptions};
            this.options = options;

            const offsets = options.offsets;
            const width = options.width || container.clientWidth;
            const height = options.height || container.clientHeight;

            this.allLabels = labels;
            this.start = 0;
            this.end = labels.length;

            this.datasets = datasets.map((dataset) => {
                return new Dataset(dataset);
            });
            this.calculateMaxValue();

            this.container = this.constructor.createContainer(width, height);

            const layers = [];
            if (options.xAxis.display) {
                const canvas = new Canvas(width, height, {top: 0, left: 0, right: 0, bottom: 0});
                layers.push(canvas);
                this.xAxis = new XAxis(canvas, this.allLabels, options.xAxis);
            } else {
                this.xAxis = null;
            }

            if (options.yAxis.display) {
                const canvas = new Canvas(width, height, offsets);
                layers.push(canvas);
                this.yAxis = new YAxis(canvas, options.yAxis);
            } else {
                this.yAxis = null;
            }

            if (options.tooltip.display) {
                const canvas = new Canvas(width, height, offsets, true);
                layers.push(canvas);
                this.tooltip = new Tooltip(canvas, this, options.tooltip);
            }

            const linesCanvas = new Canvas(width, height, offsets);
            layers.push(linesCanvas);
            this.lines = new Lines(linesCanvas, this.datasets, {});

            if (options.selection.display) {
                const canvas = new Canvas(width, height, offsets, true);
                layers.push(canvas);
                this.selection = new Selection(canvas, options.target, options.selection);
            } else {
                this.selection = null;
            }

            for (const layer of layers) {
                this.container.appendChild(layer.canvas);
                layer.setAbsoluteValues(this.labels.length - 1, this.maxValue);
            }
            container.appendChild(this.container);

            if (options.preview.display) {
                const previewOptions = options.preview;
                previewOptions.target = this;
                this.preview = new LineChart(container, labels, datasets, previewOptions);
            } else {
                this.preview = null;
            }

            if (options.legend.display) {
                this.legend = new Legend(container, this, options.legend);
            } else {
                this.legend = null;
            }

            this.draw();
        }

        get labels() {
            return this.allLabels.slice(this.start, this.end + 1);
        }

        static createContainer(width, height) {
            const div = document.createElement('div');
            div.classList.add('telegram-chart-container');
            div.style.width = width + 'px';
            div.style.height = height + 'px';
            return div;
        }

        updateOptions(options) {
            const newOptions = {...this.options, ...options};
            const {tooltip, xAxis, yAxis, selection, legend, preview} = this;
            if (tooltip) tooltip.updateOptions(newOptions.tooltip);
            if (xAxis) xAxis.updateOptions(newOptions.xAxis);
            if (yAxis) yAxis.updateOptions(newOptions.yAxis);
            if (selection) selection.updateOptions(newOptions.selection);
            if (legend) legend.updateOptions(newOptions.legend);
            if (preview) preview.updateOptions(newOptions.preview);
            this.options = newOptions;
        }

        calculateMaxValue() {
            const previousMax = this.maxValue;
            const maxValue = Math.max(...this.datasets.filter(dataset => dataset.isDisplayed).
                map(dataset => dataset.getMax()));
            const {high} = niceTicks(0, maxValue, this.options.yAxis.totalTicks);
            this.maxValue = high;
            return previousMax !== high;
        }

        draw() {
            if (this.xAxis) this.xAxis.draw(this.labels, this.maxValue);
            if (this.yAxis) this.yAxis.draw(this.labels, this.maxValue);
            if (this.selection) this.selection.draw();
            this.lines.draw();
        }

        setSelection(start, end) {
            this.start = start;
            this.end = end;
            const {labels, xAxis, yAxis, tooltip, datasets} = this;
            const maxX = labels.length - 1;
            for (const dataset of datasets) {
                dataset.setRanges(start, end);
            }
            if (xAxis) {
                xAxis.setSelection(start, end);
                xAxis.setAbsoluteValues(maxX, this.maxValue);
                xAxis.draw(labels);
            }
            if (!datasets.some(d => d.isDisplayed)) {
                return;
            }
            const changed = this.calculateMaxValue();
            const maxY = this.maxValue;
            if (changed && yAxis) {
                yAxis.animatedDraw(labels, maxY);
            }
            if (tooltip) tooltip.setAbsoluteValues(maxX, maxY);

            this.lines.animatedResize(maxX, maxY).animate();
        }

        emitLegendChange(index, isDisplayed) {
            const {maxValue:previousMaxY, lines, labels, preview, yAxis, tooltip, datasets} = this;
            datasets[index].isDisplayed = isDisplayed;
            const changed = this.calculateMaxValue();
            const maxX = labels.length - 1;
            const maxY = this.maxValue || previousMaxY;
            lines.toggle(index);
            if (preview) preview.emitLegendChange(index, isDisplayed);
            if (changed) {
                if (yAxis) yAxis.animatedDraw(labels, maxY);
                if (tooltip) tooltip.setAbsoluteValues(maxX, maxY);
                lines.animatedResize(maxX, maxY);
            }
            lines.animate();
        }
    }

    function styleInject(css, ref) {
      if ( ref === void 0 ) ref = {};
      var insertAt = ref.insertAt;

      if (!css || typeof document === 'undefined') { return; }

      var head = document.head || document.getElementsByTagName('head')[0];
      var style = document.createElement('style');
      style.type = 'text/css';

      if (insertAt === 'top') {
        if (head.firstChild) {
          head.insertBefore(style, head.firstChild);
        } else {
          head.appendChild(style);
        }
      } else {
        head.appendChild(style);
      }

      if (style.styleSheet) {
        style.styleSheet.cssText = css;
      } else {
        style.appendChild(document.createTextNode(css));
      }
    }

    var css = ".telegram-chart-container {\n  position: relative;\n  overflow-x: hidden;\n  margin-bottom: 50px; }\n  .telegram-chart-container canvas {\n    position: absolute; }\n\n.telegram-chart-legend {\n  margin-bottom: 50px; }\n\n.telegram-chart-top-layer {\n  z-index: 1; }\n\n.telegram-chart-tooltip {\n  display: none;\n  position: absolute;\n  top: 1px;\n  padding: 10px;\n  box-shadow: 0 0 3px #ccc;\n  border-radius: 4px;\n  z-index: 1001;\n  pointer-events: none; }\n  .telegram-chart-tooltip-title {\n    font-size: 16px; }\n  .telegram-chart-tooltip-group {\n    display: flex;\n    justify-content: space-between; }\n  .telegram-chart-tooltip-dataset {\n    margin-right: 7px; }\n  .telegram-chart-tooltip-value {\n    font-size: 16px;\n    font-weight: 600; }\n";
    styleInject(css);

    var css$1 = ".telegram-chart-legend-checkbox {\n  display: inline-block;\n  border: 2px solid #e6ecf0;\n  border-radius: 30px;\n  padding: 6px 12px;\n  margin-right: 10px;\n  vertical-align: top; }\n  .telegram-chart-legend-checkbox input[type='checkbox'] {\n    display: none; }\n    .telegram-chart-legend-checkbox input[type='checkbox'] + label {\n      box-sizing: border-box;\n      user-select: none;\n      position: relative;\n      display: flex;\n      align-items: center; }\n      .telegram-chart-legend-checkbox input[type='checkbox'] + label > span {\n        box-sizing: border-box;\n        user-select: none;\n        display: flex;\n        justify-content: center;\n        align-items: center;\n        margin-right: 30px;\n        width: 30px;\n        height: 30px;\n        border-radius: 30px;\n        background: transparent;\n        border: 2px solid #e6ecf0;\n        cursor: pointer;\n        transition: border 250ms linear; }\n    .telegram-chart-legend-checkbox input[type='checkbox']:checked + label > span {\n      border-width: 15px; }\n      .telegram-chart-legend-checkbox input[type='checkbox']:checked + label > span:before {\n        box-sizing: border-box;\n        user-select: none;\n        content: \"\";\n        position: absolute;\n        top: 6px;\n        border-right: 3px solid transparent;\n        border-bottom: 3px solid transparent;\n        transform: rotate(45deg);\n        animation: checkbox-check 125ms 125ms linear forwards; }\n\n@keyframes checkbox-check {\n  0% {\n    border-color: #fff;\n    width: 0;\n    height: 0; }\n  100% {\n    border-color: #fff;\n    width: 9px;\n    height: 15px; } }\n";
    styleInject(css$1);

    return LineChart;

}));
