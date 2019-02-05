const PurgecssPlugin = require('purgecss-webpack-plugin');
const glob = require('glob-all');
const path = require('path');

module.exports = {
  lintOnSave: false,
  productionSourceMap: false,
  css: {
    sourceMap: true,
    loaderOptions: {
      sass: {
        options: {
          includePaths: ["node_modules"]
        }
      }
    }
  },
  configureWebpack: {
    plugins: [
      new PurgecssPlugin({
        paths: glob.sync([
          path.join(__dirname, './public/index.html'),
          path.join(__dirname, './**/*.vue'),
          // path.join(__dirname, './src/**/*.js')
        ])
      })
    ]
  }
}
