const { resolve } = require('path');
const merge = require('webpack-merge');
const baseConfig = require('./webpack.config.base');

module.exports = merge(baseConfig, {
  devtool: false,

  entry: [resolve(__dirname, '../src/main/main.ts')],

  output: {
    path: resolve(__dirname, '../app/dist/'),
    filename: 'app.js'
  },

  mode: 'production',
  target: 'electron-main',

  node: {
    __dirname: false,
    __filename: false
  },
  externals: ['electron-devtools-installer', 'source-map-support']
});
