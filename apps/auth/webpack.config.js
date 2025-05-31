const CopyWebpackPlugin = require('copy-webpack-plugin');
const GeneratePackageJsonPlugin = require('generate-package-json-webpack-plugin');
const { resolve } = require('path');
const nodeExternals = require('webpack-node-externals');
const packageJson = require('../../package.json');

console.log(__dirname);

const outputPath = resolve(__dirname, '../../dist/apps/auth');

/** @type {import('webpack').Configuration} */
const webpackConfig = {
    entry: {
        auth: resolve(__dirname, 'src/main.ts'),
    },
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
        path: outputPath,
        filename: 'main.js',
    },
    plugins: [
        new GeneratePackageJsonPlugin(packageJson),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: resolve(__dirname, 'src/assets'),
                    to: resolve(outputPath, 'assets'),
                },
            ],
        }),
    ],
};

module.exports = webpackConfig;
