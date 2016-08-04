'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ReturnValue = exports.ControlVersion = exports.Message = exports.ControlHeader = undefined;

var _bufferpack = require('bufferpack');

var _bufferpack2 = _interopRequireDefault(_bufferpack);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ControlHeader = exports.ControlHeader = {

  unpack: function unpack(buf, callback) {
    var rmd = {
      size: null,
      command: null
    };
    var headerArray = _bufferpack2.default.unpack(">HB", buf);
    rmd.size = headerArray[0];
    rmd.command = headerArray[1];
    return callback(rmd);
  }

};

var Message = exports.Message = {
  messages: {
    0: 'EXCEPTION_MESSAGE',
    1: 'ERROR_MESSAGE',
    2: 'WARNING_MESSAGE',
    3: 'INFO_MESSAGE'
  },
  unpack: function unpack(buf, callback) {
    var rmd = {
      level: null,
      message: null
    };
    console.log(buf);
    rmd.level = _bufferpack2.default.unpack('>B', buf, 0);
    rmd.message = buf.slice(1).toString();
    console.log('hi from msg store');
    return callback(rmd);
  }
};

var ControlVersion = exports.ControlVersion = {
  unpack: function unpack(buf, callback) {
    var versionArr = _bufferpack2.default.unpack('>IIII', buf);
    var version = {
      major: versionArr[0],
      minor: versionArr[1],
      patch: versionArr[2],
      build: versionArr[3]
    };
    return callback(version);
  }
};

var ReturnValue = exports.ReturnValue = {
  unpack: function unpack(buf, callback) {
    var rmd = {
      success: null
    };
    rmd.success = Boolean(_bufferpack2.default.unpack('>B', buf));
    return callback(rmd);
  }
};

// module.exports = {ControlHeader, Message}