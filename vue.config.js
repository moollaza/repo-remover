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
    ]
  }
}
