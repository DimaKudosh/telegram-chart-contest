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
