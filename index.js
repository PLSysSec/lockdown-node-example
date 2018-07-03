const process = require('process');
const chalk = require('chalk');

const argv = require('minimist')(process.argv.slice(2));

argv._.forEach(function (val, index, array) {

  const isNumber = require('is-number');

  let result;
  if (isNumber(val)) {

    const isEven = require('is-even');

    if (isEven(val))
      result = 'even';
    else
      result = 'odd';

  } else
    result = 'NaN';

  console.log('The input', chalk.blue(val), 'is', chalk.red(result));
});
