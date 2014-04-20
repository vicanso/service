(function() {
  var program;

  program = require('commander');

  (function() {
    return program.version('0.0.1').option('--interval <n>', 'save data interval', parseInt).option('--uri <n>', 'mongodb uri').parse(process.argv);
  })();

  module.exports.mongodbUri = program.uri;

  module.exports.interval = program.interval || 10 * 1000;

}).call(this);
