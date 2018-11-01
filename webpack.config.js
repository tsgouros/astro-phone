module.exports = {
  entry: './src/index.js',
  mode: 'development',
  output: {
    filename: 'CasA.js',
    path: 'dist'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  }
};
