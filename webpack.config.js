'use strict';

/* eslint-disable angular/typecheck-string */

//Requires
const config = require('config'),
  path = require('path'),
  webpack = require('webpack'),
  merge = require('webpack-merge'),
  //HtmlWebpackPlugin = require('html-webpack-plugin'), //look at revisiting this option to dynamically generate the template
  ExtractTextPlugin = require('extract-text-webpack-plugin'),
  OpenBrowserPlugin = require('open-browser-webpack-plugin'),
  CleanPlugin = require('clean-webpack-plugin');

//Setup GLOBALS
const ipMatch = /\d\.\d\.\d\.\d/;
const localhostMatch = /localhost/i;
const _process = global.process;
const _console = global.console;
const TARGET = _process.env.npm_lifecycle_event;
const argv = require('minimist')(_process.argv.slice(2));
const MACHINE_NAME = argv.machine_name;
const PORT_NUMBER = argv.port_number;
const hasMachineName = !!MACHINE_NAME;
const hasPortNumber = !!PORT_NUMBER; 
const isIpAddress = ipMatch.test(MACHINE_NAME);
const isLocalhost = localhostMatch.test(MACHINE_NAME);

_console.log('here be my args');
_console.log(argv);
_console.log('here be my machine name');
_console.log(MACHINE_NAME);
_console.log('here be my port number');
_console.log(PORT_NUMBER);
_console.log('I have entered a port number');
_console.log(hasPortNumber);
_console.log('I have entered a machine name');
_console.log(hasMachineName);

//all config.get()s are depending on files within the config folder - there's a default, ser, production, and development
const prodEnvRegEx = /production/;
const serEnvRegEx = /(ser|production)/;

const WEB_PORT = hasPortNumber ? PORT_NUMBER : config.get('WEB_PORT') ? config.get('WEB_PORT') : '9090';
const WS_PORT = hasPortNumber ? PORT_NUMBER : config.get('WS_PORT') ? config.get('WS_PORT') : '80';
const SER_PORT = hasPortNumber ? PORT_NUMBER : config.get('SER_PORT') ? config.get('SER_PORT') : '80';
const WEB_HOST = hasMachineName && (isIpAddress | isLocalhost) ? MACHINE_NAME : hasMachineName ? MACHINE_NAME + '.pdx.odshp.com' : config.get('WEB_HOST') ? config.get('WEB_HOST') : '0.0.0.0';
const WEB_PROTOCOL = config.get('WEB_PROTOCOL') || 'http://';
const NODE_ENV = config.util.getEnv('NODE_ENV');
const NODE_ENV_STR = JSON.stringify(NODE_ENV);
const SER_CONTEXT = serEnvRegEx.test(NODE_ENV_STR);
const PROD = prodEnvRegEx.test(NODE_ENV_STR);
_console.log('NODE_ENV: ' + NODE_ENV);
_console.log('NODE_ENV_STR: ' + NODE_ENV_STR);
_console.log('SER_CONTEXT: ' + SER_CONTEXT);
_console.log('WEB_HOST: ' + WEB_HOST);
_console.log('WEB_PORT: ' + WEB_PORT);
_console.log('WS_PORT: ' + WS_PORT);
_console.log('SER_PORT: ' + SER_PORT);
_console.log('TARGET: ' + TARGET);
_console.log('PROD: ' + PROD);

//webpack config constants
const PATHS = {
  app: path.join(__dirname, 'app'),
  build: path.join(__dirname, 'build')
};

//Configure Plugins
//this commons chunk declaration will remove duplicate code from the vendor and app bundles, including angular itself
const commonsChunkVendorAssets = new webpack.optimize.CommonsChunkPlugin({
  name: 'vendor',
  chunks: ['vendor', 'app']
});
//the extractCSS plugin gives me an inlined css link for the compiled SASS
const extractCSS = new ExtractTextPlugin('[name].css');
const cleanBuild = new CleanPlugin([PATHS.build]);
const openBrowser = new OpenBrowserPlugin({
  url: 'http://' + WEB_HOST + ':' + WEB_PORT
});

const setGlobals = new webpack.DefinePlugin({ //pass values to modules as constants
  __WEB_PORT__: JSON.stringify(WEB_PORT),
  __WEB_PROTOCOL__: JSON.stringify(WEB_PROTOCOL),
  __SER_PORT__: JSON.stringify(SER_PORT),
  __WS_PORT__: JSON.stringify(WS_PORT),
  __NODE_ENV__: NODE_ENV_STR, /* eslint angular/json-functions: "off" */
  __BUILD_TARGET__: JSON.stringify(TARGET),
  __SER_CONTEXT__: SER_CONTEXT,
  __PROD__: PROD
});
const uglify = new webpack.optimize.UglifyJsPlugin({
  compress: {
    warnings: false
  }
});
// const generateHtml = new HtmlWebpackPlugin({
//   template: './index.html',
//   inject: true
// });

//reference NgComponentRouter build we want to use, as the official version's always old (and it's all pre-release)
//const builtngcomponentrouter = path.join(__dirname, 'vendor/angular/angular_1_router.js');
const ngcomponentrouter = path.join(__dirname, 'node_modules/ngcomponentrouter/angular_1_router.js');

const common = { //set up common dev and build stuff here
  entry: {
    head: PATHS.app + '/head',
    app: ['babel-polyfill', PATHS.app + '/sgApp.js'],
    vendor: [
      'angular',
      'angular-bind-html-compile-ci-dev',
      'angular-aba-routing-validation',
      'angular-animate',
      'angular-cookies',
      'angular-file-saver',
      'angular-input-modified',
      'angular-number-picker',
      'angular-pretty-checkable',
      'angular-resource',
      'angular-sanitize',
      'angular-scroll',
      'angular-spinner',
      'angular-toarrayfilter',
      'angular-ui-mask',
      'jquery',
      'ng-dialog',
      ngcomponentrouter,
      'spin.js',
      'tipso',
      'ui-select'
    ]
  },
  output: {
    path: PATHS.build,
    //publicPath: PATHS.build + '/',
    filename: '[name].bundle.js',
    chunkFilename: '[id].bundle.js'
  },
  module: {
    loaders: [
      {
        test: require.resolve('angular-spinner'),
        loader: 'imports?define=>false' /*disable AMD for this package*/ /*https://github.com/urish/angular-spinner/issues/85*/
      },
      {
        // When you import a .ts file, parse it with Typescript
        test: /\.ts$/,
        loader: 'ng-annotate!typescript',
        include: PATHS.app
      },
      {
        // When you import a .js file, parse it with Babel
        test: /\.js$/,
        loader: 'ng-annotate!babel?presets=es2015&plugins=strict-equality',
        include: PATHS.app
      },
      {
        test: /\.html$/,
        //loader: 'file-loader?name=[path][name].html&context=./app',
        //loader: 'ngtemplate?relativeTo=' + PATHS.app + '/!html'
        loader: 'ngtemplate!html',
        //,
        include: PATHS.app
      },
      {
        test: /\.(sass|scss)$/,
        loader: extractCSS.extract('style', 'css!resolve-url!sass'),
        include: [path.resolve(__dirname, './app/styles')]
       //investigate adding postcss for autoprefixer
      },
      {
        test: /\.(png|gif|jpeg|jpg|svg|woff|ttf|eot)$/,
        //add any vendor css that needs images loaded from node_modules
        include: [PATHS.app, path.resolve(__dirname, './node_modules/select2')],
        //loader: 'file?name=assets/fonts/[path][name].[ext]'
        loader: 'url?limit=10000'
      },
      {
        test: /\.css$/,
        loader: extractCSS.extract('style', 'css')
      }, 
      { //expose global jQuery
        test: require.resolve('jquery'),
        loader: 'expose?$!expose?jQuery'
      }
    ],
    preloaders: [
      {
        test: /\.html/,
        loader: 'htmlhint',
        exclude: /node_modules/
      }
    ]
  },
  plugins: [
    extractCSS,
    commonsChunkVendorAssets,
    setGlobals,
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery'
    })
    //generateHtml //this would be to create a built template - todo
  ],
  // resolve: {
  //   alias: {
  //     images: path.resolve(__dirname, './app/assets/images')
  //   }
  // },
  resolveUrlLoader: {
    silent: true, 
    fail: false
  },
  sassLoader: { //specify sass paths that contain styles you want to load into the bundle, including from node-modules
    //used for resolving @import declarations
    includePaths: [
      path.resolve(__dirname, './app'),
      path.resolve(__dirname, './node_modules/compass-mixins/lib'),
      path.resolve(__dirname, './node_modules/ng-dialog/css'),
      path.resolve(__dirname, './node_modules/ui-select/dist'),
      path.resolve(__dirname, './node_modules/selectize/dist/css'),
      path.resolve(__dirname, './node_modules/angular-pretty-checkable/dist')
    ]
  },
  htmlhint: {
    configFile: path.resolve(__dirname, './.htmlhintrc'),
    failOnError: true
  }
};

const dev = {
  devServer: {
    host: WEB_HOST,
    port: WEB_PORT,
    hot: true,
    publicPath: '/build/'
  },
  devtool: 'source-map',
  plugins: [
    openBrowser
  ]
};

const build = {
  plugins: [
    cleanBuild,
    uglify
  ],
  devtool: '#source-map'
};

const clean = {
  plugins: [
    cleanBuild
  ]
};

function webpackConfig() {
  if (NODE_ENV === 'development' || !NODE_ENV) {
    return merge(common, dev);
  } else if (NODE_ENV === 'production') {
    return merge(common, clean, build);
  } else {
    return merge(common, clean);
  }
}

module.exports = webpackConfig();
module.exports.clone = webpackConfig;
