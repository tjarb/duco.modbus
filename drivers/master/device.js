'use strict';

const { Device } = require('homey');
const net = require('net');
//const decodeData = require('../../lib/decodeData.js');

class DucoMasterModbusDevice extends Device {

    async onInit() {
        let self = this;

		/*Identify device and required device library*/
		let duco_node = self.getStoreValue("duco_node");
		let box_type  = self.getStoreValue("duco_type");
		
		let lib_url = self.getStoreValue("duco_lib");
		const duco_functions = require(lib_url);
		let duco_device = new duco_functions(self);
		
		self.log("type: " + box_type +", node: ", duco_node + ",using lib: " + lib_url);
		
		//const  ModbusRTU = require("modbus-serial");
	
		self.pollingInterval = self.homey.setInterval(() =>{		/*call with inherting device environment*/
			self.log("Calling functions from lib: " + lib_url);
			duco_device.handler(self);
		}, (self.getSetting("polling")*1000) + (Math.random()*2000) );	//spread load more 
		


		
		
		//this.setupCapabilityListeners();
		//this._registerFlows(self, client);	//was disabled
		
     }
	
	async setupCapabilityListeners() {
		

    }
	
	sleep(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}
	
	/*Info from Charger
	operational_string(operational_code){
		
		switch(operational_code){						
				case 0: return "auto";
				case 1: return "10 min high";
				case 2: return "20 min high";
				case 3: return "30 min high";
				case 4: return "Manuel laagstand";
				case 5: return "Manuel middenstand";
				case 6: return "Manuel hoogstand";
				case 7: return "Away mode";
				case 8: return "Permanent low";
				case 9: return "Permanent mid";
				case 10: return "Permanente high";
				case 99: return "Error";
				default: return "Unknown";
			}
		
	}				*/
	
	/*box type
	type_string(state){
		switch(state){
			case 10: return "DucoBox";
			default: return "Unknown";
		}
	}*/
}

module.exports = DucoMasterModbusDevice;
