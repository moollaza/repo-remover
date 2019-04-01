// const glob = require('glob-all');

module.exports = {
  lintOnSave: false,
  productionSourceMap: false,
  css: {
    extract: true,
    sourceMap: true,
    loaderOptions: {
      sass: {
        data: '@import "@/scss/base.scss";'
  },
  configureWebpack: {
    plugins: [
    ]
  }
}
  }
}
