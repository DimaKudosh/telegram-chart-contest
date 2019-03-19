export class FadeInDownAnimation {
    constructor(duration=300) {
        this.duration = duration;
    }

    animate(ctx, drawCallback, onComplete) {
        const duration = this.duration;
        const animationStartTime = Date.now();
        const canvasHeight = ctx.canvas.height;
        function render() {
            ctx.save();
            const delta = Date.now() - animationStartTime;
            const progress = delta / duration;
            if (progress >= 1) {
                drawCallback();
                if (onComplete) {
                    onComplete();
                }
                return;
            }
            const y = -canvasHeight * (1 - progress);
            ctx.translate(0, y);
            ctx.globalAlpha = progress;
            drawCallback();
            ctx.restore();
            requestAnimationFrame(render);
        }
        render();
    }
}


export class FadeOutAnimation {
    constructor(duration=300) {
        this.duration = duration;
    }

    animate(ctx, drawCallback) {
        const duration = this.duration;
        const animationStartTime = Date.now();
        const canvas = ctx.canvas;
        ctx.save();
        function render() {
            const delta = Date.now() - animationStartTime;
            const progress = delta / duration;
            if (progress >= 1) {
                ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                ctx.restore();
                return;
            }
            ctx.globalAlpha =  1 - progress;
            drawCallback();
            requestAnimationFrame(render);
        }
        render();
    }
}


export class CanvasTransformAnimation {
    constructor(duration=300) {
        this.duration = duration;
        this.req = null;
    }

    animate(canvas, ratioX, ratioY, drawCallback) {
        this.cancel();
        const duration = this.duration;
        const animationStartTime = Date.now();
        const currentRatioY = canvas.yRatio;
        const currentRatioX = canvas.xRatio;
        const stepX = ratioX - currentRatioX;
        const stepY = ratioY - currentRatioY;
        const render = () => {
            const delta = Date.now() - animationStartTime;
            const progress = delta / duration;
            console.log(animationStartTime);
            if (progress >= 1) {
                this.req = null;
                return;
            };
            canvas.yRatio = currentRatioY + (progress * stepY);
            canvas.xRatio = currentRatioX + (progress * stepX);
            drawCallback();
            this.req = requestAnimationFrame(render);
        }
        render();
    }

    cancel() {
        if (this.req) {
            cancelAnimationFrame(this.req);
        }
    }
}
