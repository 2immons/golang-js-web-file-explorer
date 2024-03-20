const path = require('path');

module.exports = {
    mode: "development",
    entry: {
        main: './src/JSscripts/script.js',
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    resolve: {
        alias: {
            'chart.js/auto': path.resolve(__dirname, 'node_modules/chart.js/auto')
        }
    }
};
