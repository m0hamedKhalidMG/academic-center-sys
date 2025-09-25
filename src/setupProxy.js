// src/setupProxy.js
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://academic-center-pro-pi94.vercel.app',
      changeOrigin: true,
      secure: true,
    })
  );
};
