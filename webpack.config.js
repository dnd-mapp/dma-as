const { resolve } = require('path');

/** @type {import('webpack').Configuration} */
const webpackConfig = {
    entry: resolve(__dirname, 'src', 'main.ts'),
    externalsPresets: {
        node: true,
    },
    mode: process.env['NODE_ENV'] === 'production' ? 'production' : 'development',
    node: {
        __dirname: false,
        __filename: false,
    },
    optimization: {
        nodeEnv: false,
    },
    output: {
        clean: true,
        path: resolve(__dirname, 'dist', 'dma-as'),
        filename: 'main.js',
    },
    watch: process.env['NODE_ENV'] === 'development',
};

module.exports = webpackConfig;
