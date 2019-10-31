import Vue from 'vue';
import App from './App.vue';
import router from './router';

// Sentry.io
import * as Sentry from '@sentry/browser';
import * as Integrations from '@sentry/integrations';

Sentry.init({
  dsn: process.env.VUE_APP_SENTRY_DSN,
  integrations: [new Integrations.Vue({ Vue, attachProps: true, logErrors: process.env.VUE_APP_IS_DEV })],
});

// Buefy
import Buefy from 'buefy'
Vue.use(Buefy, { defaultIconPack: 'fas' });

// Custom Styles
import "@/scss/base.scss";

// Scroll-To
const VueScrollTo = require('vue-scrollto');
Vue.use(VueScrollTo)

// Apollo Setup
import ApolloClient from 'apollo-boost';
import VueApollo from 'vue-apollo';
const apolloClient = new ApolloClient({
  uri: 'https://api.github.com/graphql'
});
const apolloProvider = new VueApollo({
  defaultClient: apolloClient,
});
Vue.use(VueApollo);


Vue.config.productionTip = false;

// Global State
const data = {
  login: "",
  // Grab VUE_APP_GH_ACCESS_TOKEN from .env.local if available
  token: process.env.VUE_APP_GH_ACCESS_TOKEN || ""
};

new Vue({
  router,
  apolloProvider,
  data,
  render: h => h(App),
}).$mount('#app');
