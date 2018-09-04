const path = require('path');
const CleanPlugin = require('clean-webpack-plugin');

const DEBUG = !process.argv.includes('-p');
const BUILD_DIR = path.join(__dirname, 'build');

const BABEL_CONFIG = {
    babelrc: false,
    presets: [
        ['@babel/env', { 'targets': { 'node': '8.10' } }]],
    plugins: [
        '@babel/plugin-proposal-class-properties',
        '@babel/plugin-proposal-object-rest-spread', 
        '@babel/transform-runtime'
    ],
    cacheDirectory: DEBUG 
};

const STATS = {
    colors: true,
    reasons: false,
    hash: false,
    version: false,
    timings: true,
    chunks: false,
    chunkModules: false,
    cached: false,
    cachedAssets: false,
    children: false,
    errors: true,
    errorDetails: true,
    warnings: true
};

const config = {
    mode: DEBUG ? 'development' : 'production',
    target: 'node',
    entry: Object.assign({
        'local': './src/bin/www.ts'
    }, DEBUG ? {} : { 'lambda': './src/bin/lambda.ts' }),
    output: {
        path: BUILD_DIR,
        filename: '[name].js',
        publicPath: '/'
    },
    resolve: {
        alias: {
            '~': path.join(__dirname, 'src')
        },
        extensions: ['*', '.tsx', '.ts', '.jsx', '.js', '.json']
    },
    module: {
        rules: [
            { 
                test: /\.tsx?$/,
                enforce: 'pre',
                use: 'tslint-loader',
                include: path.join(__dirname, 'src')
            },
            {
                test: /\.tsx?$/,
                exclude: [
                    /node_modules/,
                    path.join(__dirname, 'vendor')
                ],
                use: [
                    {
                        loader: 'babel-loader',
                        options: BABEL_CONFIG
                    },
                    {
                        loader: 'ts-loader',
                        options: { silent: true }
                    }
                ]
            }
        ]
    },
    plugins: DEBUG ? [] : [new CleanPlugin([BUILD_DIR])],
    cache: DEBUG,
    stats: STATS,
};

module.exports = config;