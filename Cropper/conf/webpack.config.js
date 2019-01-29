const paths = require('./paths');
const widgetConf = require('./widget.config.json');
const XMLPlugin = require('xml-webpack-plugin');
const ArchivePlugin = require('webpack-archive-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const fs = require('fs-extra');

const MODES = {
    DEV: 'development',
    PROD: 'production'
};
const isProd = process.env.MODE === MODES.PROD;
const isDev = process.env.MODE === MODES.DEV;

const widgetDir = `${widgetConf.name}/widget`;
const widgetUIDir = `${widgetDir}/ui`;

const widgetXMLFiles = [
    {
        template: paths.widgetPackageXML,
        filename: `package.xml`,
        data: {
            NAME: widgetConf.name
        }
    },
    {
        template: paths.widgetConfigXML,
        filename: `${widgetConf.name}/${widgetConf.name}.xml`,
        data: {
            NAME: widgetConf.name,
            FRIENDLY_NAME: widgetConf.friendlyName,
            WIDGET_DESC: widgetConf.description
        }
    }
];

module.exports = {
    mode: isDev ? MODES.DEV : MODES.PROD,
    target: 'web',
    devtool: isDev ? 'eval-source-map' : false,
    watch: isDev,
    entry: paths.srcEntry,
    output: {
        path: isDev ? paths.buildDir : paths.distDir,
        filename: `${widgetDir}/${widgetConf.name}.js`,
        libraryTarget: 'amd'
    },
    optimization: {
        minimizer: [
            new UglifyJsPlugin({
                test: /\.js(\?.*)?$/i
            })
        ]
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [ '@babel/preset-env' ],
                        plugins: [ 'add-module-exports' ]
                    }
                }
            },
            {
                test: /\.(sa|sc|c)ss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    { loader: 'postcss-loader', options: { config: { path: paths.confDir } } },
                    'sass-loader'
                ]
            },
            {
                test: /\.(gif|png|jpe?g|svg)$/i,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: `[name].[ext]`,
                            outputPath: `${widgetUIDir}/images`
                        }
                    }
                ]
            }
        ]
    },
    externals: [
        { MxWidgetBase: 'mxui/widget/_WidgetBase' },
        { dojoBaseDeclare: 'dojo/_base/declare' },
        /mx|mxui|mendix|dijit|dojo|require/
    ],
    plugins: _getPlugins()
};

function _getPlugins() {
    //ensure distDir fir Archive Plugin
    fs.ensureDirSync(paths.distDir);
    const plugins = [
        new MiniCssExtractPlugin({
            filename: `${widgetUIDir}/${widgetConf.name}.css`
        }),
        new XMLPlugin({
            files: widgetXMLFiles
        }),
        new ArchivePlugin({
            output: `${paths.distDir}/${widgetConf.name}`,
            format: 'zip',
            ext: 'mpk'
        })
    ];
    if (paths.mxProjectRootDir) {
        plugins.push(
            new ArchivePlugin({
                output: `${paths.mxProjectRootDir}/widgets/${widgetConf.name}`,
                format: 'zip',
                ext: 'mpk'
            })
        );
    }
    return plugins;
}
