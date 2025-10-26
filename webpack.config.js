const path = require('path');
const webpack = require('webpack');
const TampermonkeyHeader = `
  // ==UserScript==
  // @name         Wplace City Context Overlay
  // @namespace    https://github.com/MikeWorldYt/wplace-city-context
  // @version      0.1
  // @description  Overlay visual para Wplace (zonas y nodos)
  // @author       MikeWorldYt
  // @match        https://wplace.live/*
  // @grant        GM_addStyle
  // ==/UserScript==
`;

module.exports = {
  entry: './src/main.js',
  output: {
    filename: 'Webpack-CityContext.user.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new webpack.BannerPlugin({
      banner: TampermonkeyHeader,
      raw: true,
    }),
  ],
  mode: 'production',
};