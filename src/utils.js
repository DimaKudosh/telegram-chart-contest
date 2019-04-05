const dateFormatter =  new Intl.DateTimeFormat('en-us', { month: 'short', day: 'numeric' });
const tooltipDateFormatter = new Intl.DateTimeFormat('en-us', { weekday: 'short', month: 'short', day: 'numeric' });


export function timestampToString(timestamp) {
    return dateFormatter.format(timestamp);
}

export function tooltipTimestampToString(timestamp) {
    return tooltipDateFormatter.format(timestamp);
}

export function generateID() {
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

export function niceTicks(lo, hi, ticks=6, intervals=[1.0, 2.0, 2.5, 3.0, 5.0, 6.0, 10.0]) {
    const delta = hi - lo;
    const delta_tick = niceRound(delta / (ticks - 1), intervals);
    const lo_tick = Math.floor(lo / delta_tick) * delta_tick;
    const hi_tick = Math.ceil(hi / delta_tick) * delta_tick;
    return {low: lo_tick, high: hi_tick, spacing: delta_tick};
}
