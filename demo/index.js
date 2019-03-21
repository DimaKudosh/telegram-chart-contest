function loadCharts(filename) {
    return new Promise((resolve, reject) => {
        const request = new XMLHttpRequest();
        request.overrideMimeType("application/json");
        request.open("GET", filename, true);
        request.onreadystatechange = function () {
            if (request.readyState === 4 && request.status === 200) {
                resolve(JSON.parse(request.responseText));
            }
        };
        request.send(null);
    })
}


function parseChartData(chartData) {
    let labels;
    let datasets = [];
    const types = chartData['types'];
    const names = chartData['names'];
    const colors = chartData['colors'];
    for (let column of chartData['columns']) {
        const type = column[0];
        if (types[type] === 'x') {
            labels = column.slice(1);
        } else if (types[type] === 'line') {
            datasets.push({
                'name': names[type],
                'color': colors[type],
                'data': column.slice(1)
            });
        }
    }
    return [labels, datasets]
}


const chartsFile = "chart_data.json";
loadCharts(chartsFile).then(
    (chartsData) => {
        for (let i = 4; i < 5; i++) {
            const id = i + 1;
            const chartContainer = document.getElementById('chart-' + id);
            const previewContainer = document.getElementById('chart-preview-' + id);
            const legendContainer = document.getElementById('chart-legend-' + id);
            const [labels, datasets] = parseChartData(chartsData[i]);
            try {
                const chartOptions = {
                    'xAxis': true,
                    'yAxis': true,
                    'tooltip': true,
                    'legend': {
                        'container': legendContainer
                    }
                };
                const chart = new LineChart(chartContainer, labels, datasets, chartOptions);
                const previewOptions = {
                'xAxis': false,
                'yAxis': false,
                'selection': {
                    'target': chart
                }
            };
                const previewChart = new LineChart(previewContainer, labels, datasets, previewOptions);
            } catch (e) {
                console.log(e);
            }
        }
    }
);

