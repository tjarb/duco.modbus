'use strict';

const { Device } = require('homey');
const net = require('net');
const decodeData = require('../../lib/decodeData.js');

class DucoMasterModbusDevice extends Device {

    async onInit() {
        let self = this;
		
        // Register device triggers, as defined in ./driver.flow.compose.json
        //self._changedOperationalStatus = self.homey.flow.getDeviceTriggerCard('changedOperationalStatus');		
//        self._changedSessionYield = self.homey.flow.getDeviceTriggerCard('changedSessionYield');
        //self._changedChargePower = self.homey.flow.getDeviceTriggerCard('changedChargePower');
//        self._changedCurrent_L1 = self.homey.flow.getDeviceTriggerCard('changedCurrentL1');
		//self._changedPower_L1 = self.homey.flow.getDeviceTriggerCard('changedPowerL1');
		//self._changedVoltage_L1 = self.homey.flow.getDeviceTriggerCard('changedVoltageL1');
		//self._changedChargerLimit = self.homey.flow.getDeviceTriggerCard('changedChargerLimit');
		//self._changedEV_capability = self.homey.flow.getDeviceTriggerCard('changedEV_capability');
		//self._changedYield = self.homey.flow.getDeviceTriggerCard('changedYield');
        //self._changedRequiredEnergy = self.homey.flow.getDeviceTriggerCard('changedRequiredEnergy');
	
		
		

		let box_type 	= 0;
		let box_status 	= 0;
		let flow_level 	= 0;
		
		let power 		= 0;
		let power_avg 	= 0;
		let power_max 	= 0;

		let auto_min = 0;
		let auto_max = 0;
		let box_action = 0;
		
		let i=0;
		const  ModbusRTU = require("modbus-serial");
		
		self.pollingInterval_fast = self.homey.setInterval(() => {  
					
					let client = new ModbusRTU();
					//self.log("####### "+ i++ +" poll to connect socket "+self.getSetting('address') +" ################");			
						client.setTimeout( 1000 );
						
						client.connectTCP(self.getSetting('address'), { port: 502 }).then( function(){					
							client.setTimeout( 1000 );
							client.setID(1);				
							
							Promise.all([
								client.readInputRegisters (10, 3),
								client.readInputRegisters(13, 3),
								//client.readInputRegisters(19, 1), //Has no Parent
								
								//client.readHoldingRegisters(10, 1),	//No value, depends on sub-zones							
								client.readHoldingRegisters(15, 2),		//
								client.readHoldingRegisters(19, 1)		//
						
								
							]).then((data) => {									
									client.close();
									self.log(data[0].data[2]);
									
									box_type	= data[0].data[0];	//input 10									
									box_status	= data[0].data[1];	//input 11
									flow_level 	= data[0].data[2];	//input 12
									self.log("box_type: "+box_type + ", box_status: "+box_status + ", flow_level: "+flow_level); 
									
									power		= data[1].data[0];	//input 13									
									power_avg	= data[1].data[1];	//input 14
									power_max 	= data[1].data[2];	//input 15
									self.log("power: "+power + ", power_avg: "+power_avg + ", power_max: "+power_max); 
									
									auto_min	= data[2].data[0];	//input 13									
									auto_max	= data[2].data[1];	//input 14
									
									box_action	= data[3].data[0];	//input 19
									self.log("auto_min: "+auto_min + ", auto_max: "+auto_max + ", box_action: "+box_action); 

							}).catch((err) => {
									client.close();
								self.log(err);
							})							
							
						})	
						.catch(function(e){		self.log(e);
						});	
						
						
						
						// MEASURE_POWER: MOMENTAL (total) CHARGING POWER
						if (self.getCapabilityValue('flow_level') != flow_level) {
							self.setCapabilityValue('flow_level', flow_level)
								.then(function () {

								/*	let tokens = {
										charging: tot_power
									}
									self._changedChargePower.trigger(self, tokens, {}).catch(error => { self.error(error) });
*/
								}).catch(reason => {
									self.error(reason);
								});
						}
						
						// MEASURE_POWER: MOMENTAL (total) CHARGING POWER
						if (self.getCapabilityValue('measure_power.actual') != power) {
							self.setCapabilityValue('measure_power.actual', power)
								.then(function () {

								/*	let tokens = {
										charging: tot_power
									}
									self._changedChargePower.trigger(self, tokens, {}).catch(error => { self.error(error) });
*/
								}).catch(reason => {
									self.error(reason);
								});
						}
						
						// MEASURE_POWER: MOMENTAL (total) CHARGING POWER
						if (self.getCapabilityValue('measure_power.avg') != power_avg) {
							self.setCapabilityValue('measure_power.avg', power_avg)
								.then(function () {

								/*	let tokens = {
										charging: tot_power
									}
									self._changedChargePower.trigger(self, tokens, {}).catch(error => { self.error(error) });
*/
								}).catch(reason => {
									self.error(reason);
								});
						}
						
						// MEASURE_POWER: MOMENTAL (total) CHARGING POWER
						if (self.getCapabilityValue('measure_power.max') != power_max) {
							self.setCapabilityValue('measure_power.max', power_max)
								.then(function () {

								/*	let tokens = {
										charging: tot_power
									}
									self._changedChargePower.trigger(self, tokens, {}).catch(error => { self.error(error) });
*/
								}).catch(reason => {
									self.error(reason);
								});
						}
						
						// MEASURE_POWER: MOMENTAL (total) CHARGING POWER
						if (self.getCapabilityValue('flow_level.low') != auto_min) {
							self.setCapabilityValue('flow_level.low', auto_min)
								.then(function () {

								/*	let tokens = {
										charging: tot_power
									}
									self._changedChargePower.trigger(self, tokens, {}).catch(error => { self.error(error) });
*/
								}).catch(reason => {
									self.error(reason);
								});
						}
						
						// MEASURE_POWER: MOMENTAL (total) CHARGING POWER
						if (self.getCapabilityValue('flow_level.high') != auto_max) {
							self.setCapabilityValue('flow_level.high', auto_max)
								.then(function () {

								/*	let tokens = {
										charging: tot_power
									}
									self._changedChargePower.trigger(self, tokens, {}).catch(error => { self.error(error) });
*/
								}).catch(reason => {
									self.error(reason);
								});
						}
						
					// OPERATIONAL STATUS
					let state = self.operational_string(box_status);				
                    if (self.getCapabilityValue('operational_status') != state ) {				
                        self.setCapabilityValue('operational_status', state )
                            .then(function () {

                            //    let tokens = {
                            //        status: self.homey.__(state)
                            //    }
                            //    self._changedOperationalStatus.trigger(self, tokens, {}).catch(error => { self.error(error) });	//Tokens are made availbe in Flows as 'global sources'. For tokens see driver.flow.compose.json
							//
                            }).catch(reason => {
                                self.error(reason);
                            });

                    }
					
					// OPERATIONAL STATUS
					let type = self.type_string(box_type);				
                    if (self.getCapabilityValue('operational_status.type') != type ) {				
                        self.setCapabilityValue('operational_status.type', type )
                            .then(function () {

                             //   let tokens = {
                             //       status: self.homey.__(type)
                             //   }
                             //   self._changedOperationalStatus.trigger(self, tokens, {}).catch(error => { self.error(error) });	//Tokens are made availbe in Flows as 'global sources'. For tokens see driver.flow.compose.json
							
                            }).catch(reason => {
                                self.error(reason);
                            });

                    }

						
            }, self.getSetting('polling') * 1000);

		
		
		//this.setupCapabilityListeners();
		//this._registerFlows(self, client);	//was disabled
		
     }
	
	async setupCapabilityListeners() {
		

    }
	
	sleep(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}
	
	/*Info from Charger*/
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
		
	}				
	
	/*box type*/
	type_string(state){
		switch(state){
			case 10: return "DucoBox";
			default: return "Unknown";
		}
	}
}

module.exports = DucoMasterModbusDevice;
