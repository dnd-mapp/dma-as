const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join } = require('path');

module.exports = {
    output: {
        path: join(__dirname, 'dist'),
    },
    plugins: [
        new NxAppWebpackPlugin({
            assets: ['./src/assets'],
            commonChunk: true,
            compiler: 'tsc',
            externalDependencies: 'all',
            extractLicenses: true,
            generatePackageJson: true,
            main: './src/main.ts',
            namedChunks: true,
            optimization: false,
            outputHashing: 'none',
            runtimeChunk: true,
            sourceMap: false,
            target: 'node',
            tsConfig: './tsconfig.app.json',
            vendorChunk: true,
        }),
    ],
};
