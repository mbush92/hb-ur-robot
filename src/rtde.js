import struct from 'bufferpack'
import net from 'net'
import _ from 'lodash'
import {ControlHeader, Message,ControlVersion,ReturnValue} from './store'
let options = {
  port:30004,
  host:'192.168.59.103',
}

export const command = {
  RTDE_REQUEST_PROTOCOL_VERSION: 86,        //# ascii V
  RTDE_GET_URCONTROL_VERSION: 118,          //# ascii v
  RTDE_TEXT_MESSAGE: 77,                    //# ascii M
  RTDE_DATA_PACKAGE: 85,                    //# ascii U
  RTDE_CONTROL_PACKAGE_SETUP_OUTPUTS: 79,   //# ascii O
  RTDE_CONTROL_PACKAGE_SETUP_INPUTS: 73,    //# ascii I
  RTDE_CONTROL_PACKAGE_START: 83,           //# ascii S
  RTDE_CONTROL_PACKAGE_PAUSE: 80,           //# ascii P
}

const connectionState = {
  DISCONNECTED: 0,
  CONNECTED: 1,
  STARTED: 2,
  PAUSED: 3,
}

class RTDE {
  constructor() {
    this.onPacket = {
      RTDE_REQUEST_PROTOCOL_VERSION: this._unpack_protocol_version_package,
      RTDE_GET_URCONTROL_VERSION: this._unpack_urcontrol_version_package,
      RTDE_DATA_PACKAGE: this._test,
      RTDE_CONTROL_PACKAGE_SETUP_OUTPUTS: this._test,
      RTDE_CONTROL_PACKAGE_SETUP_INPUTS: this._test,
      RTDE_CONTROL_PACKAGE_START: this._test,
      RTDE_CONTROL_PACKAGE_PAUSE: this._test,
      RTDE_TEXT_MESSAGE: this._unpack_text_message,
    }
    this.commandSwapped = this._swapJsonKeyValues(command);
  }

  connect({port, host}, callback){
    this.client = new net.Socket()
    this.sock = this.client.connect({port, host})
    this.client.on('connect',()=>{
      console.log('[INFO] Client Connected')
      return callback (true)
    })
  }
  get_controller_version(){
    let cmd = command.RTDE_GET_URCONTROL_VERSION
    this._sendAndReceive(cmd,'' ,(version)=>{
      if (version) {
        console.log('Controller version: ' + version.major + '.' + version.minor + '.' + version.patch + '.' + version.build)
        if (version.major == 3 && version.minor <= 2 && version.patch < 19171) {
          console.log("Please upgrade your controller to minimally version 3.2.19171")
          //process.exit()
        }
        return [version.major, version.minor, version.bugfix, version.build]
      }
      return [null, null, null]
    })
  }

  negotiate_protocol_version(protocol, callback){
    console.log('I was called')
    let cmd = command.RTDE_REQUEST_PROTOCOL_VERSION
    console.log('protocol is:', protocol)
    let payload = struct.pack('>H', protocol)
    console.log('payload:', payload)
    this._sendAndReceive(cmd, payload, (data)=>{
      return callback(data.success)
    })

  }

  _sendAndReceive(cmd, payload = '', callback){
    this._sendall(cmd, payload, (err)=>{
      console.log(err)
      if (!err) return
      this._rcv(cmd, (data)=>{
        console.log('rcv callback', data)
        return callback(data)
      })
    })
  }

  _sendall(cmd, payload='', callback){
    console.log('payload:', payload)
    let fmt = '>HB'
    let size = struct.calcLength(fmt)
    console.log("size",size)
    console.log("cmd", [size, cmd])
    let buf = struct.pack(fmt, [size, cmd]) + payload
    //let buf = new Buffer(cmd,'utf-8')
    console.log("Buffer sent:" +  buf)
    this.sock.write(buf, (err)=>{
      if (err) return callback(false)
      return callback(true)
    })


  }

  _rcv(cmd, callback){
    this.sock.once('data', (buf)=>{
      ControlHeader.unpack(buf, (header)=>{
        console.log("Header:", header)
        if (buf.length >= header.size){

          console.log('decode what:',this.commandSwapped[header.command])
          let packet = buf.slice(3,header.size)
          this.onPacket[this.commandSwapped[header.command]](packet, (data)=>{
            if (data) {
              return callback(data)
            }
          })
        }
      })
    })
  }

  _unpack_text_message(payload, callback){
    console.log('Getting a text message')
    if (payload.length < 1){
      logging.error('RTDE_TEXT_MESSAGE: No payload')
      return null
    }

    Message.unpack(payload, (msg)=>{
      console.log('msg level:',Message.messages[msg.level])
      console.log(msg)
      return callback ('something needs to go here')
    })

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

  _test(){

  }

  _unpack_urcontrol_version_package(payload, callback){
    console.log('Getting controller version')
    if (payload.length != 16){
      console.log('[ERROR] RTDE_GET_URCONTROL_VERSION: Wrong payload size')
      return
    }
    ControlVersion.unpack(payload, (version)=>{
      console.log('version:',version)
      return callback(version)
    })
  }

  _unpack_protocol_version_package(payload, callback){
    console.log('getting protocol version')
    console.log(payload.length)
  }

  _swapJsonKeyValues(input) {
    var one, output = {};
    for (one in input) {
      if (input.hasOwnProperty(one)) {
        output[input[one]] = one;
      }
    }
    return output;
  }

}

module.exports = {RTDE}
