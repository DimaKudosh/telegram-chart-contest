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

if (process.env['ENV'] === 'production') {
    config['plugins'].push(minify({
        comments: false
    }));
    config['output']['file'] = 'dist/bundle.min.js';
}

module.exports = config;
