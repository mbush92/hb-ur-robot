'use strict';

var _rtde = require('./rtde');

var _rtdeConfig = require('./rtdeConfig');

var _rtdeConfig2 = _interopRequireDefault(_rtdeConfig);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var rtde = new _rtde.RTDE();
var options = {
  port: 30004,
  host: '192.168.59.103',
  RTDE_PROTOCOL_VERSION: '3'
};

rtde.connect(options, function (connected) {
  if (connected) {
    rtde.get_controller_version(function (version) {
      rtde.negotiate_protocol_version(options.RTDE_PROTOCOL_VERSION, function (status) {
        console.log('protocol:', status);
      });
    });
  }
});