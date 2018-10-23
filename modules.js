const builtin = require('module').builtinModules;

builtin.forEach(mod => {
  try {
    require(mod);
  } catch(e) {
    console.error(e);
  }
});
