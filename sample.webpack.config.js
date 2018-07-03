module.exports = {
  mode: 'none',
  target: 'node',
  entry: './index.js',
  module: {
    rules: [
      { test: /\.js$/, use: ['/path/to/hashlock-loader.js'] },
    ],
  }
}
