const { resolve } = require('path');

/** @type {import('webpack').Configuration} */
const webpackConfig = {
    mode: process.env['NODE_ENV'] === 'production' ? 'production' : 'development',
    entry: 'src/main.ts',
    output: {
        clean: true,
        path: resolve(__dirname, 'dist', 'dma-as'),
        filename: 'main.js',
    },
};

module.exports = webpackConfig;
