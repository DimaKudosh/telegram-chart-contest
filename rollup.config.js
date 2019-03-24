import babel from 'rollup-plugin-babel';
import minify from 'rollup-plugin-babel-minify';
const postcss = require('rollup-plugin-postcss');


let config = {
    input: 'src/main.js',
    output: {
        file: 'dist/bundle.js',
        name: 'LineChart',
        format: 'umd',
    },
    plugins: [
        postcss({
            extensions: ['scss']
        }),
    ]
};

let with_demo_config = {
    input: 'demo/index.js',
    output: {
        file: 'dist/bundle_with_demo.js',
        name: 'run_demo_app',
        format: 'umd',
    },
    plugins: [
        postcss({
            extensions: ['scss']
        }),
    ]
};

if (process.env['WITH_DEMO'] === 'true') {
    config = with_demo_config;
}

if (process.env['ENV'] === 'production') {
    config['plugins'].push(minify({
        comments: false
    }));
    config['output']['file'] = config['output']['file'].replace('js', 'min.js');
}

module.exports = config;
