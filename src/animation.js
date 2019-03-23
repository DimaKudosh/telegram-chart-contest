export default class Animation {
    constructor(duration=250) {
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
