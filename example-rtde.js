'use strict';

var _RTDE = require('./RTDE');

var rtde = new _RTDE.RTDE();
var options = {
  port: 30004,
  host: '192.168.59.103',
  RTDE_PROTOCOL_VERSION: '1'
};

rtde.connect(options, function (connected) {
  if (connected) {
    // rtde.get_controller_version()
    rtde.negotiate_protocol_version(options.RTDE_PROTOCOL_VERSION, function (status) {
      console.log('protocol:', status);
    });
  }
});