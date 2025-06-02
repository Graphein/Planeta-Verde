module.exports = function override(config) {
    config.devServer = {
      ...config.devServer,
      hot: false, // Desativa o HMR
    };
    return config;
};