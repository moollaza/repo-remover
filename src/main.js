import Vue from 'vue'
import App from './App.vue'
import router from './router'

// Bootstrap Setup
import BootstrapVue from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
Vue.use(BootstrapVue);

// Apollo Setup
import ApolloClient from 'apollo-boost'
import VueApollo from 'vue-apollo'
const apolloClient = new ApolloClient({
  uri: 'https://api.github.com/graphql'
})
const apolloProvider = new VueApollo({
  defaultClient: apolloClient,
})
Vue.use(VueApollo)


Vue.config.productionTip = false

const data = {
  username: "",
  // Grab VUE_APP_GH_ACCESS_TOKEN from .env.local if available
  token: process.env.VUE_APP_GH_ACCESS_TOKEN || "",
  repos: []
}

new Vue({
  router,
  apolloProvider,
  data,
  render: h => h(App),
}).$mount('#app')
