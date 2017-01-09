const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const path = require('path');
 
module.exports = {
  target: 'node',
  externals: [nodeExternals()],
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel?presets=es2015&plugins=strict-equality',
        include: path.join(__dirname, 'app')
      }
    ]
  },
  resolve: {
    root: [
      path.resolve(__dirname, 'app'),
      path.resolve(__dirname, 'node_modules')
    ]
  }
};