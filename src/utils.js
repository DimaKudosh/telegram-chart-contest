export const nice_intervals = [1.0, 2.0, 2.5, 3.0, 5.0, 10.0]
export const int_intervals = [1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 8.0, 10.0]


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

function niceCeil(x, intervals) {
    if (x === 0) {
        return x;
    }
    const z = Math.pow(10, Math.floor(Math.log10(x)));
    for (let i = 0; i < intervals.length - 1; i++) {
        const result = intervals[i] * z;
        if (x <= result) {
            return result
        }
    }
    return intervals[intervals.length - 1] * z;
}

function niceRound(x, intervals) {
    if (x === 0) {
        return 0;
    }
    const z = Math.pow(10, Math.ceil(Math.log10(x)) - 1);
    const r = x / z;
    for (let i = 0; i < intervals.length - 1; i++) {
        const result = intervals[i] * z;
        const cutoff = (result + intervals[i+1] * z) / 2;
        if (x <= cutoff) {
            return result;
        }
    }
    return intervals[intervals.length - 1] * z;
}

export function niceTicks(lo, hi, ticks=5, intervals) {
    const delta = hi - lo;
    const niceDelta = niceCeil(delta, intervals);
    const delta_tick = niceRound(delta / (ticks - 1), intervals);
    const lo_tick = Math.floor(lo / delta_tick) * delta_tick;
    const hi_tick = Math.ceil(hi / delta_tick) * delta_tick;
    return [lo_tick, hi_tick, delta_tick];
}


function niceNum(range, round) {
    const exponent = Math.floor(Math.log10(range));
    const fraction = range / Math.pow(10, exponent);
    let niceFraction;
    if (round) {
        if (fraction < 1.5) niceFraction = 1;
        else if (fraction < 3) niceFraction = 2;
        else if (fraction < 5) niceFraction = 4;
        else if (fraction < 7) niceFraction = 5;
        else niceFraction = 10;
    } else {
        if (fraction <= 1) niceFraction = 1;
        else if (fraction <= 2) niceFraction = 2;
        else if (fraction < 5) niceFraction = 4;
        else if (fraction <= 7) niceFraction = 5;
        else niceFraction = 10;
    }
    return niceFraction * Math.pow(10, exponent);
}

export function niceScale(lowerBound, upperBound, maxTicks) {
    const range = niceNum(upperBound - lowerBound, false);
    const tickSpacing = niceNum(range / (maxTicks - 1), true);
    return Math.ceil(upperBound / tickSpacing) * tickSpacing;

}

export function getTickSpacing(lowerBound, upperBound, maxTicks) {
    const range = niceNum(upperBound - lowerBound, true);
    return niceNum(range / (maxTicks - 1), false);
}
