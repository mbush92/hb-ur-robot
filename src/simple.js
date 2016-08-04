'use strict'

import URRobot from './urrobot.js'


const rob = new URRobot('192.168.1.197', 30002)

rob.sendProgram('movel([-.481,-.078,.123,.8849,-2.2334,-2.8095], a=1.2, v=.25, t=0, r=0)\n')
//rob.listen()
//rob.sendProgram('popup("this is a test")\n')
