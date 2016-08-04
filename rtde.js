'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.command = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _bufferpack = require('bufferpack');

var _bufferpack2 = _interopRequireDefault(_bufferpack);

var _net = require('net');

var _net2 = _interopRequireDefault(_net);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _store = require('./store');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var options = {
  port: 30004,
  host: '192.168.59.103'
};

var command = exports.command = {
  RTDE_REQUEST_PROTOCOL_VERSION: 86, //# ascii V
  RTDE_GET_URCONTROL_VERSION: 118, //# ascii v
  RTDE_TEXT_MESSAGE: 77, //# ascii M
  RTDE_DATA_PACKAGE: 85, //# ascii U
  RTDE_CONTROL_PACKAGE_SETUP_OUTPUTS: 79, //# ascii O
  RTDE_CONTROL_PACKAGE_SETUP_INPUTS: 73, //# ascii I
  RTDE_CONTROL_PACKAGE_START: 83, //# ascii S
  RTDE_CONTROL_PACKAGE_PAUSE: 80 };

var connectionState = {
  DISCONNECTED: 0,
  CONNECTED: 1,
  STARTED: 2,
  PAUSED: 3
};

var RTDE = function () {
  function RTDE() {
    _classCallCheck(this, RTDE);

    this.onPacket = {
      RTDE_REQUEST_PROTOCOL_VERSION: this._unpack_protocol_version_package,
      RTDE_GET_URCONTROL_VERSION: this._unpack_urcontrol_version_package,
      RTDE_DATA_PACKAGE: this._test,
      RTDE_CONTROL_PACKAGE_SETUP_OUTPUTS: this._test,
      RTDE_CONTROL_PACKAGE_SETUP_INPUTS: this._test,
      RTDE_CONTROL_PACKAGE_START: this._test,
      RTDE_CONTROL_PACKAGE_PAUSE: this._test,
      RTDE_TEXT_MESSAGE: this._unpack_text_message
    };
    this.commandSwapped = this._swapJsonKeyValues(command);
  }

  _createClass(RTDE, [{
    key: 'connect',
    value: function connect(_ref, callback) {
      var port = _ref.port;
      var host = _ref.host;

      this.client = new _net2.default.Socket();
      this.sock = this.client.connect({ port: port, host: host });
      this.client.on('connect', function () {
        console.log('[INFO] Client Connected');
        return callback(true);
      });
    }
  }, {
    key: 'get_controller_version',
    value: function get_controller_version(callback) {
      var cmd = command.RTDE_GET_URCONTROL_VERSION;
      this._sendAndReceive(cmd, '', function (version) {
        if (version) {
          console.log('Controller version: ' + version.major + '.' + version.minor + '.' + version.patch + '.' + version.build);
          if (version.major == 3 && version.minor <= 2 && version.patch < 19171) {
            console.log("Please upgrade your controller to minimally version 3.2.19171");
            //process.exit()
          }
          return callback([version.major, version.minor, version.bugfix, version.build]);
        }
        return callback([null, null, null]);
      });
    }
  }, {
    key: 'negotiate_protocol_version',
    value: function negotiate_protocol_version(protocol, callback) {
      console.log('I was called');
      var cmd = command.RTDE_REQUEST_PROTOCOL_VERSION;
      console.log('protocol is:', protocol);
      var payload = _bufferpack2.default.pack('>H', protocol);
      console.log('payload:', payload);
      this._sendAndReceive(cmd, payload, function (status) {
        return callback(status.success);
      });
    }
  }, {
    key: '_sendAndReceive',
    value: function _sendAndReceive(cmd) {
      var _this = this;

      var payload = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];
      var callback = arguments[2];

      this._sendall(cmd, payload, function (err) {
        console.log(err);
        if (!err) return;
        _this._rcv(cmd, function (data) {
          console.log('rcv callback', data);
          return callback(data);
        });
      });
    }
  }, {
    key: '_sendall',
    value: function _sendall(cmd) {
      var payload = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];
      var callback = arguments[2];

      console.log('payload:', payload);
      var fmt = '>HB';
      var size = _bufferpack2.default.calcLength(fmt) + payload.length;
      console.log("header", [size, cmd]);
      var header = [size, cmd];
      var buf = _bufferpack2.default.pack(fmt, header) + payload;
      console.log('buf length:', buf.length);
      var totalLength = buf.length + payload.length;
      console.log("Buffer sent:" + buf);
      this.sock.write(buf, function (err) {
        if (err) return callback(false);
        return callback(true);
      });
    }
  }, {
    key: '_rcv',
    value: function _rcv(cmd, callback) {
      var _this2 = this;

      this.sock.once('data', function (buf) {
        _store.ControlHeader.unpack(buf, function (header) {
          console.log("Header:", header);
          if (buf.length >= header.size) {

            console.log('decode what:', _this2.commandSwapped[header.command]);
            var packet = buf.slice(3, header.size);
            _this2.onPacket[_this2.commandSwapped[header.command]](packet, function (data) {
              if (data) {
                return callback(data);
              }
            });
          }
        });
      });
    }
  }, {
    key: '_unpack_text_message',
    value: function _unpack_text_message(payload, callback) {
      console.log('Getting a text message');
      if (payload.length < 1) {
        logging.error('RTDE_TEXT_MESSAGE: No payload');
        return null;
      }

      _store.Message.unpack(payload, function (msg) {
        console.log('msg level:', _store.Message.messages[msg.level]);
        console.log(msg);
        return callback(msg);
      });

      // msg = serialize.Message.unpack(payload)
      // if(msg.level == serialize.Message.EXCEPTION_MESSAGE or
      //   msg.level == serialize.Message.ERROR_MESSAGE):
      //   logging.error('Server message: ' + msg.message)
      //   elif msg.level == serialize.Message.WARNING_MESSAGE:
      //   logging.warning('Server message: ' + msg.message)
      //   elif msg.level == serialize.Message.INFO_MESSAGE:
      //   logging.info('Server message: ' + msg.message)
      //
    }
  }, {
    key: '_test',
    value: function _test() {}
  }, {
    key: '_unpack_urcontrol_version_package',
    value: function _unpack_urcontrol_version_package(payload, callback) {
      console.log('Getting controller version');
      if (payload.length != 16) {
        console.log('[ERROR] RTDE_GET_URCONTROL_VERSION: Wrong payload size');
        return;
      }
      _store.ControlVersion.unpack(payload, function (version) {
        console.log('version:', version);
        return callback(version);
      });
    }
  }, {
    key: '_unpack_protocol_version_package',
    value: function _unpack_protocol_version_package(payload, callback) {
      console.log('getting protocol version');
      if (payload.length != 1) return callback('[ERROR] RTDE_REQUEST_PROTOCOL_VERSION: Wrong payload size');
      _store.ReturnValue.unpack(payload, function (status) {
        console.log(status);
        return callback(status);
      });
    }
  }, {
    key: '_swapJsonKeyValues',
    value: function _swapJsonKeyValues(input) {
      var one,
          output = {};
      for (one in input) {
        if (input.hasOwnProperty(one)) {
          output[input[one]] = one;
        }
      }
      return output;
    }
  }]);

  return RTDE;
}();

module.exports = { RTDE: RTDE };