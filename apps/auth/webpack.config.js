const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { resolve } = require('path');

const outputPath = resolve(__dirname, '../../dist/apps/auth');

const webpackConfig = {
    output: {
        path: outputPath,
    },
    plugins: [
        new NxAppWebpackPlugin({
            main: './src/main.ts',
            tsConfig: './tsconfig.app.json',
        }),
    ],
};

module.exports = webpackConfig;
