export default class Animation {
    constructor(duration=250) {
        this.duration = duration;
        this.reqId = null;
    }

    run(ctx, stepCallback, completeCallback) {
        const duration = this.duration,
              now = Date.now,
              animationStartTime = now(),
            render = () => {
                ctx.save();
                const progress = (now() - animationStartTime) / duration;
                if (progress >= 1) {
                    stepCallback(1);
                    if (completeCallback) {
                        completeCallback();
                    }
                    ctx.restore();
                    return;
                }
                stepCallback(progress);
                ctx.restore();
                this.reqId = requestAnimationFrame(render);
            };
        render();
    }

    cancel() {
        if (this.reqId) {
            cancelAnimationFrame(this.reqId);
            this.reqId = null;
        }
    }
}
