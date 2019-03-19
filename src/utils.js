export function timestampToString(timestamp) {
    return (new Date(timestamp)).toLocaleString('en-us', { month: 'short', day: 'numeric' });
}

export function tooltipTimestampToString(timestamp) {
    return (new Date(timestamp)).toLocaleString('en-us', { weekday: 'short', month: 'short', day: 'numeric' });
}

export function generateID() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

function niceNum(range, round) {
    const exponent = Math.floor(Math.log10(range));
    const fraction = range / Math.pow(10, exponent);
    let niceFraction;
    if (round) {
        if (fraction < 1.5) niceFraction = 1;
        else if (fraction < 3) niceFraction = 2;
        else if (fraction < 7) niceFraction = 5;
        else niceFraction = 10;
    } else {
        if (fraction <= 1) niceFraction = 1;
        else if (fraction <= 2) niceFraction = 2;
        else if (fraction <= 5) niceFraction = 5;
        else niceFraction = 10;
    }
    return niceFraction * Math.pow(10, exponent);
}

export function niceScale(lowerBound, upperBound, maxTicks) {
    const range = niceNum(upperBound - lowerBound, false);
    const tickSpacing = niceNum(range / (maxTicks - 1), true);
    return Math.ceil(upperBound / tickSpacing) * tickSpacing;

}
