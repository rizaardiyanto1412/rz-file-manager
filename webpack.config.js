const defaultConfig = require('@wordpress/scripts/config/webpack.config');
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  ...defaultConfig,
  entry: {
    main: path.resolve(__dirname, 'src/index.js'),
  },
  output: {
    path: path.resolve(__dirname, 'assets'),
    filename: 'js/[name].js',
  },
  plugins: [
    ...defaultConfig.plugins.filter(plugin => !(plugin instanceof MiniCssExtractPlugin)),
    new MiniCssExtractPlugin({
      filename: 'css/[name].css'
    }),
  ],
};
