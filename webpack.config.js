const { resolve } = require('path');
const nodeExternals = require('webpack-node-externals');
const GeneratePackageJsonPlugin = require('generate-package-json-webpack-plugin');
const packageJson = require('./package.json');

/** @type {import('webpack').Configuration} */
const webpackConfig = {
    entry: resolve(__dirname, 'src', 'main.ts'),
    externalsPresets: {
        node: true,
    },
    externals: [nodeExternals()],
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
    plugins: [new GeneratePackageJsonPlugin(packageJson)],
};

module.exports = webpackConfig;
