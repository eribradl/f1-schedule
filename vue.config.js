module.exports = {
    chainWebpack: config => {
      config.module
        .rule('raw')
        .test(/\.geojson$/)
        .use('raw-loader')
        .loader('raw-loader')
        .end()
    },
    publicPath: process.env.NODE_ENV === "production" ? "/f1-schedule/" : "/",
  }