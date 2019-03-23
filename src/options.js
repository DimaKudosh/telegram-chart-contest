const font = '15px Arial';
const offsets = {top: 20, right: 7, bottom: 25, left: 7};
const previewOffsets = {top: 5, right: 0, bottom: 5, left: 0};

export const DEFAULT_OPTIONS = {
    yAxis: {
        display: true,
        font: font,
        totalTicks: 6,
        animation: 250,
        underlineColor: 'green',
    },
    xAxis: {
        display: true,
        font: font,
        totalTicks: 8,
    },
    legend: {
        display: true,
    },
    tooltip: {
        display: true,
        color: 'green',
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
            backgroundAlpha: 0.1,
            backgroundColor: 'black',
            borderColor: 'blue',
        },
        preview: {
            display: false,
        }
    },
};
