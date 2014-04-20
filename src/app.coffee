JTCluster = require 'jtcluster'
jtCluster = new JTCluster()

JTStatsClient = require 'jtstats_client'
statsPort = '9300'
statsHost = '127.0.0.1'

config = require './config'


startHaproxyLog = ->
  jtHalog = require 'jthalog'
  jtHalog.start {
    logPath : '/vicanso/log/haproxy'
    port : '9200'
    host : '127.0.0.1'
    statsClient : new JTStatsClient {
      prefix : 'haproxy.'
      port : statsPort
      host : statsHost
    }
  }

startSystemMonitor = ->
  os = require 'os'
  jtSys = require 'jtsys'
  client = new JTStatsClient {
    port : statsPort
    host : statsHost
    prefix : "sys.#{os.hostname()}."
  }
  jtSys.setLogClient client
  jtSys.start 10 * 1000

startStats = ->
  jtStats = require 'jtstats'
  jtStats.start {
    port : '9300'
    host : '127.0.0.1'
    interval : config.interval
    uri : config.mongodbUri
  }




options = 
  slaveTotal : 1
  slaveHandler : ->
    startHaproxyLog()
    startStats()
    startSystemMonitor()

jtCluster.start options
jtCluster.on 'log', (data) ->
  console.info data