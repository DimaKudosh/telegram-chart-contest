export default class FadeInDownAnimation {
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
//
//
// function animate(duration) {
//     let lastRender = Date.now();
//     const animationStartTime = Date.now();
//     let previousProgress = 0;
//     ctx.translate(0, -canvasHeight);
//
//     function render() {
//         const delta = Date.now() - animationStartTime;
//         const progress = delta / duration;
//         if (progress >= 1) {
//             return
//         }
//         console.log(progress, previousProgress);
//         const y = canvasHeight * (progress - previousProgress);
//         ctx.translate(0, y);
//         ctx.globalAlpha = progress;
//         drawLine(points, 1);
//         previousProgress = progress;
//         requestAnimationFrame(render);
//     }
//     render();
// }