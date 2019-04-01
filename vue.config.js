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
      postcss: {
        plugins: [
          require('cssnano')({
            preset: 'default',
          }),
        ]
      }
    }
  }
}
