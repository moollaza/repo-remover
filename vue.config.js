// const glob = require('glob-all');
const path = require('path');

module.exports = {
  lintOnSave: false,
  productionSourceMap: false,
  css: {
    sourceMap: true,
    loaderOptions: {
      sass: {
        // data: `@import "@/scss/_base.scss";`,
        // options: {
        //   includePaths: ["node_modules"]
        // }
      }
    }
  },
  // pluginOptions: {
  //   'style-resources-loader': {
  //     preProcessor: 'scss',
  //     patterns: [
  //       path.resolve(__dirname, 'src/scss/_base.scss'),
  //     ]
  //   }
  // },
  configureWebpack: {
    plugins: [
    ]
  }
}
