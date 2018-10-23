const crypto = require('crypto');
const fs = require('fs');
const Module = require('module');

const HASH_FILE_NAME = 'webpack-hashlock';

module.exports = function loader(source) {
  this.cacheable && this.cacheable();

  // remove shebang line before hashing
  source = source.replace(/^#!.+/, '')

  const name = this.resourcePath;
  const hash = hashSource(source);

  fs.appendFileSync(HASH_FILE_NAME, name + " :: " + hash + '\n');

  return source;
}

function hashSource(source) {
  const hash = crypto.createHash('sha256');
  hash.update(Module.wrap(source));
  return hash.digest('hex');
}
