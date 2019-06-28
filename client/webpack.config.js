const path = require('path');
const webpack = require('webpack');

const CopyWebpackPlugin = require('copy-webpack-plugin');
const ManifestAssetPlugin = new CopyWebpackPlugin([ { from: 'src/assets/manifest.json', to: 'manifest.json' } ]);
const IconAssetPlugin = new CopyWebpackPlugin([ { from: 'src/images/icon-192x192.png', to: 'icon-192x192.png' } ]);
const Icon2AssetPlugin = new CopyWebpackPlugin([ { from: 'src/images/favicon.png', to: 'favicon.png' } ]);
const ImagesAssetPlugin = new CopyWebpackPlugin([ { from: 'src/images/', to: 'images/'} ]);
const WebConfigPlugin = new CopyWebpackPlugin([ { from: 'src/web.config', to: 'web.config' } ]);
const FontsPlugin = new CopyWebpackPlugin([ { from: 'src/fonts', to: 'fonts' } ]);
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackPluginConfig = new HtmlWebpackPlugin({
  template: './src/index.html',
  filename: 'index.html',
  inject: 'body'
});

var environmentData = require('./src/assets/config.json');
const EnviromentPlugin = new webpack.EnvironmentPlugin(environmentData);

module.exports = {
  entry: './src/index.js',
  target: 'web',
  output: {
    path: path.resolve('public/build'),
    filename: 'index_bundle.js',
    publicPath: '/'
  },
  devServer: {
    historyApiFallback: {
      disableDotRule: true
    },
    watchOptions: { aggregateTimeout: 300, poll: 1000 },
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization",
    },
  },
  module: {
    rules: [
      { test: /\.json$/, use: 'json-loader' },
      { 
        test: /\.js$/, 
        loader: 'babel-loader', 
        exclude: /node_modules/, 
        query: {
            presets: ['es2017', 'react']
        } 
      },
      { 
        test: /\.jsx$/, 
        loader: 'babel-loader',
        exclude: /node_modules/, 
        query: {
            presets: ['es2017', 'react']
        } 
      },
      {
        test: /\.(eot|otf|woff|woff2|ttf|svg|png|jpe?g|gif)(\?\S*)?$/,
        loader: 'file-loader!url-loader',
      },
      {
        test: /\.scss$/,
        loader: "style-loader!css-loader!sass-loader",
      },
      { test: /\.css$/, loader: 'style-loader!css-loader' }
    ]
  },
  plugins: [
    HtmlWebpackPluginConfig, 
    ManifestAssetPlugin,
    IconAssetPlugin, 
    Icon2AssetPlugin,
    ImagesAssetPlugin,
    WebConfigPlugin,
    FontsPlugin,
    EnviromentPlugin,
    new webpack.ProvidePlugin({
    $: "jquery",
    jQuery: "jquery"
  })]
}