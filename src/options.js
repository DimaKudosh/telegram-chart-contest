const font = '15px Arial';
const offsets = {top: 20, right: 7, bottom: 25, left: 7};
const previewOffsets = {top: 5, right: 0, bottom: 5, left: 0};

export const DEFAULT_OPTIONS = {
    yAxis: {
        display: true,
        font: font,
        totalTicks: 6,
        animation: 250,
        color: '#96a2aa',
        underlineColor: '#f2f4f5',
    },
    xAxis: {
        display: true,
        font: font,
        totalTicks: 8,
        color: '#96a2aa',
        animation: 400,
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
