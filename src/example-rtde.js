import {RTDE, command} from './rtde'
import rtdeConfig from './rtdeConfig'
let rtde = new RTDE()
let options = {
  port:30004,
  host:'192.168.59.103',
  RTDE_PROTOCOL_VERSION:'3',
}

rtde.connect(options, function(connected){
  if (connected){
    rtde.get_controller_version((version)=>{
    rtde.negotiate_protocol_version(options.RTDE_PROTOCOL_VERSION, (status)=>{
      console.log('protocol:',status)
    })
  })
  }
})
