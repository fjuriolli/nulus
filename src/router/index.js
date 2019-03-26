import Vue from 'vue'
import VueRouter from 'vue-router'
import vueHeadful from 'vue-headful'

import routes from './routes'

Vue.use(VueRouter)
Vue.use(require('vue-shortkey'))
Vue.component('vue-headful', vueHeadful)

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation
 */

export default function (/* { store, ssrContext } */) {
  const Router = new VueRouter({
    scrollBehavior: () => ({ y: 0 }),
    routes,


    // Leave these as is and change from quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    mode: 'history',
    base: process.env.VUE_ROUTER_BASE
  })

  return Router
}
