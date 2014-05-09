(function() {
  var JTCluster, JTStatsClient, config, options, run, startHaproxyLog, startStats, startSystemMonitor, statsHost, statsPort;

  JTCluster = require('jtcluster');

  JTStatsClient = require('jtstats_client');

  statsPort = '9300';

  statsHost = '127.0.0.1';

  config = require('./config');

  startHaproxyLog = function() {
    var jtHalog;
    jtHalog = require('jthalog');
    return jtHalog.start({
      logPath: '/vicanso/log/haproxy',
      port: '9200',
      host: '127.0.0.1',
      statsClient: new JTStatsClient({
        prefix: 'haproxy.',
        port: statsPort,
        host: statsHost
      })
    });
  };

  startSystemMonitor = function() {
    var client, jtSys, os;
    os = require('os');
    jtSys = require('jtsys');
    client = new JTStatsClient({
      port: statsPort,
      host: statsHost,
      prefix: "sys." + (os.hostname()) + "."
    });
    jtSys.setLogClient(client);
    jtSys.filter('network', function(name) {
      return name !== 'em2';
    });
    jtSys.filter('disk', function(mount) {
      return mount === '/';
    });
    jtSys.filter('io', function(device) {
      return device === 'sdb' || device === 'sda';
    });
    return jtSys.start(10 * 1000);
  };

  startStats = function() {
    var jtStats;
    jtStats = require('jtstats');
    return jtStats.start({
      port: '9300',
      host: '127.0.0.1',
      interval: config.interval,
      uri: config.mongodbUri
    });
  };

  options = {
    slaveTotal: 1,
    slaveHandler: function() {
      startStats();
      startHaproxyLog();
      return startSystemMonitor();
    }
  };

  run = function() {
    var jtCluster;
    jtCluster = new JTCluster(options);
    return jtCluster.on('log', function(data) {
      return console.info(data);
    });
  };

  if (process.env.NODE_ENV === 'production') {
    setTimeout(run, 60 * 1000);
  } else {
    run();
  }

}).call(this);
