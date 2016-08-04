'use strict'

import net from 'net'


class URRobot {
  constructor(host, port) {
    console.log(host)
    let options = {
      port: 30002,
      host: host
    }
  const client = new net.Socket()
  this.socket = client.connect(options);
  }

  listen(){
    this.socket.on('data', (data)=>{
      console.log('Got something', data)
    })
  }

  sendProgram(prog){
    console.log(prog)
    this.socket.write(prog)
  }

}

module.exports = URRobot
