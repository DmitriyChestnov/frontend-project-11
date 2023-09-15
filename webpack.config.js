const path = require('path');
// Плагины - внешние модули для Webpack, которые позволяют управлять и обрабатывать файлы,
// которые не импортируются в JavaScript
const HtmlWebpackPlugin = require('html-webpack-plugin');
// Ресурсы будут загружаться быстрее из кэша, а не с сервера при каждом запросе.
const WorkboxWebpackPlugin = require('workbox-webpack-plugin');

const isProduction = process.env.NODE_ENV === 'production';

const config = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
  },
  devServer: {
    open: true,
    host: 'localhost',
  },
  // Указываем новые плагины для обработки файлов
  plugins: [
    new HtmlWebpackPlugin({
      template: 'index.html',
    }),
  ],
  // Указываем тут, что будем использовать спец. модуль для определенных файлов (лоадер)
  module: {
    // Указываем правила для данных модулей
    rules: [
      {
        // Указываем правило для каждого лоадера
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
      { test: /\.css$/, use: ['style-loader', 'css-loader', 'postcss-loader'] },
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader', 'postcss-loader'],
      },
      {
        test: /\.woff2?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: 'url-loader?limit=10000',
      },
      {
        test: /\.(ttf|eot|svg)(\?[\s\S]+)?$/,
        use: 'file-loader',
      },
    ],
  },
};

module.exports = () => {
  if (isProduction) {
    config.mode = 'production';

    config.plugins.push(new WorkboxWebpackPlugin.GenerateSW());
  } else {
    config.mode = 'development';
  }
  return config;
};
