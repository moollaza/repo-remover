import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import Meta from 'vue-meta'

Vue.use(Router)
Vue.use(Meta)

const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/details',
      name: 'details',
      component: () => import(/* webpackChunkName: "details" */ './views/Details.vue')
    },
    {
      path: '/about',
      name: 'about',
      component: () => import(/* webpackChunkName: "about" */ './views/About.vue')
    },
    {
      path: '*',
      component: () => import(/* webpackChunkName: "notFound" */ './views/NotFound.vue')
    }
  ]
})

// Track additional page views after app loads
router.afterEach((to) => {
  if (window.fathom) {
    window.fathom("trackPageview", { path: to.path })
  }
})

export default router
