module.exports = {
    chainWebpack: config => {
      config.module
        .rule('raw')
        .test(/\.geojson$/)
        .use('raw-loader')
        .loader('raw-loader')
        .end()
    }
  }