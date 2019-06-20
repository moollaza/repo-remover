module.exports = {
  lintOnSave: false,
  productionSourceMap: false,
  css: {
    extract: true,
    sourceMap: true,
    loaderOptions: {
      sass: {
        data: `@import "@/scss/_variables.scss";`
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
