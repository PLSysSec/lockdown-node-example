module.exports = {
  mode: 'none',
  target: 'node',
  entry: './index.js',
  module: {
    rules: [
      { test: /\.js$/, use: ['./hashlock-loader.js'] },
    ],
  }
}
