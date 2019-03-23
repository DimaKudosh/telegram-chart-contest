const NIGHT_MODE_OPTIONS = {
    yAxis: {
        color: '#546778',
        underlineColor: '#293544',
    },
    xAxis: {
        color: '#546778',
    },
    tooltip: {
        textColor: '#fff',
        color: '#3b4a5a',
        backgroundColor: '#253241',
    },
    legend: {
        borderColor: '#344658',
        textColor: '#fff',
    },
    preview: {
        selection: {
            borderColor: '#40566b',
            backgroundColor: '#1f2a38',
        }
    }
};
const DAY_MODE_OPTIONS = {
    yAxis: {
        color: '#96a2aa',
        underlineColor: '#f2f4f5',
    },
    xAxis: {
        color: '#96a2aa',
    },
    tooltip: {
        textColor: '#000',
        color: '#dfe6eb',
        backgroundColor: '#fff',
    },
    legend: {
        borderColor: '#e6ecf0',
        textColor: '#000',
    },
    preview: {
        selection: {
            backgroundColor: '#f5f9fb',
            borderColor: '#ddeaf3',
        }
    }
};
const NIGHT_MODE_TEXT = 'Switch to Night Mode';
const DAY_MODE_TEXT = 'Switch to Day Mode';
let in_night_mode = false;


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
const charts = [];
loadCharts(chartsFile).then(
    (chartsData) => {
        for (let i = 0; i < 5; i++) {
            const id = i + 1;
            const chartContainer = document.getElementById('chart-' + id);
            const [labels, datasets] = parseChartData(chartsData[i]);
            try {
                const chart = new LineChart(chartContainer, labels, datasets, {});
                charts.push(chart);
            } catch (e) {
                console.log(e);
            }
        }
    }
);

const body = document.body;
const btnContainer = document.getElementById('btn-container');
const btn = document.getElementById('switch-mode-btn');
btn.addEventListener('click', () => {
    let mode, text;
    if (!in_night_mode) {
        mode = NIGHT_MODE_OPTIONS;
        text = NIGHT_MODE_TEXT;
        in_night_mode = true;
        body.classList.add('night-mode');
        btnContainer.classList.add('night-mode');
    } else {
        mode = DAY_MODE_OPTIONS;
        text = DAY_MODE_TEXT;
        in_night_mode = false;
        body.classList.remove('night-mode');
        btnContainer.classList.remove('night-mode');
    }
    for (const chart of charts) {
        chart.updateOptions(mode);
    }
    btn.textContent = text;
});
