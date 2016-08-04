import struct from 'bufferpack'
import _ from 'lodash'

export const ControlHeader = {

  unpack: function(buf, callback){
    const rmd = {
      size:null,
      command:null
    }
    let headerArray = struct.unpack(">HB", buf)
    rmd.size = headerArray[0]
    rmd.command = headerArray[1]
    return callback(rmd)
  }

}

export const Message = {
  messages : {
    0: 'EXCEPTION_MESSAGE',
    1: 'ERROR_MESSAGE',
    2: 'WARNING_MESSAGE',
    3: 'INFO_MESSAGE',
  },
  unpack: function(buf, callback){
    let rmd = {
      level:null,
      message:null,
    }
    console.log(buf)
    rmd.level = struct.unpack('>B',buf, 0)
    rmd.message = buf.slice(1).toString()
    console.log('hi from msg store')
    return callback(rmd)
  }
}

export const ControlVersion = {
  unpack:function(buf, callback){
    let versionArr = (struct.unpack('>IIII', buf))
    let version = {
      major: versionArr[0],
      minor: versionArr[1],
      patch: versionArr[2],
      build: versionArr[3],
    }
    return callback(version)
  },
}

export const ReturnValue = {
  unpack:function(buf, callback){
    let rmd = {
      success:null
    }
    rmd.success = bool(struc.unpack('>B', buf))
    return callback(rmd)
  }
}

// module.exports = {ControlHeader, Message}
