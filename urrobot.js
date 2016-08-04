'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _net = require('net');

var _net2 = _interopRequireDefault(_net);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var URRobot = function () {
  function URRobot(host, port) {
    _classCallCheck(this, URRobot);

    console.log(host);
    var options = {
      port: 30002,
      host: host
    };
    var client = new _net2.default.Socket();
    this.socket = client.connect(options);
  }

  _createClass(URRobot, [{
    key: 'listen',
    value: function listen() {
      this.socket.on('data', function (data) {
        console.log('Got something', data);
      });
    }
  }, {
    key: 'sendProgram',
    value: function sendProgram(prog) {
      console.log(prog);
      this.socket.write(prog);
    }
  }]);

  return URRobot;
}();

module.exports = URRobot;