import Vue from 'vue'
import App from './App.vue'

// Bugfix from https://github.com/vue-leaflet/Vue2Leaflet/issues/103
// eslint-disable-next-line  
delete L.Icon.Default.prototype._getIconUrl  
// eslint-disable-next-line  
L.Icon.Default.mergeOptions({  
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),  
  iconUrl: require('leaflet/dist/images/marker-icon.png'),  
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')  
})

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
