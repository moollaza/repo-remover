const pkg = require("./package");

module.exports = {
  mode: "spa",

  /*
  ** Headers of the page
  */
  head: {
    title: pkg.name,
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { hid: "description", name: "description", content: pkg.description }
    ],
    link: [
      { rel: "icon", type: "image/x-icon", href: "/favicon.ico" }
    ]
  },

  /*
  ** Customize the progress-bar color
  */
  loading: { color: "#fff" },

  /*
  ** Global CSS
  */
  css: [
  ],

  /*
  ** Plugins to load before mounting the App
  */
  plugins: [

  ],

  /*
  ** Nuxt.js modules
  */
  modules: [
    "bootstrap-vue/nuxt",
    "@nuxtjs/apollo"
  ],

  bootstrapVue: {
    bvCSS: true,
    css: true
  },

  /*
  ** Apollo
  */
  apollo: {
    clientConfigs: {
      default: {
        httpEndpoint: "https://api.github.com/graphql",
        wsEndpoint: null
      }
    }
  },

  /*
  ** Build configuration
  */
  build: {
    /*
    ** You can extend webpack config here
    */
    extend(config, ctx) {
      // Run ESLint on save
      if (ctx.isDev && ctx.isClient) {
        config.module.rules.push({
          enforce: "pre",
          test: /\.(js|vue)$/,
          loader: "eslint-loader",
          exclude: /(node_modules)/,
          options: {
            fix: true
          }
        });
      }
    },
    anaylze: true
  }
};
