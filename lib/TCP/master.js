"use strict";


class DucoMaster{
	/*Global shared static library info for Master*/
    static name = "Duco master";
	static icon= "/icon.svg"; 		// relative to: /drivers/<driver_id>/assets/
	static capabilities = ["flow_level", "measure_power.actual", "measure_power.avg", "measure_power.max", "limit_flow_low", "limit_flow_high", "operational_status", "operational_status.type"];
	static capabilitiesOptions= { };
	static lib_url = "../../lib/TCP/master.js";
	static ModbusRTU = require("modbus-serial");	//import globally
		
    constructor(self) {
		
       // Register device triggers, as defined in ./driver.flow.compose.json
 //      this._changedOperationalStatus = self.homey.flow.getDeviceTriggerCard('changedOperationalStatus');		
//        this._changedSessionYield = self.homey.flow.getDeviceTriggerCard('changedSessionYield');
        //this._changedChargePower = self.homey.flow.getDeviceTriggerCard('changedChargePower');
//        this._changedCurrent_L1 = self.homey.flow.getDeviceTriggerCard('changedCurrentL1');
		//this._changedPower_L1 = self.homey.flow.getDeviceTriggerCard('changedPowerL1');
		//this._changedVoltage_L1 = self.homey.flow.getDeviceTriggerCard('changedVoltageL1');
		//this._changedChargerLimit = self.homey.flow.getDeviceTriggerCard('changedChargerLimit');
		//this._changedEV_capability = self.homey.flow.getDeviceTriggerCard('changedEV_capability');
		//this._changedYield = self.homey.flow.getDeviceTriggerCard('changedYield');
        //this._changedRequiredEnergy = self.homey.flow.getDeviceTriggerCard('changedRequiredEnergy');
		
		/*Create private variables*/
		this.box_type 	= 0;
		this.box_status = 0;
		this.flow_level = 0;
		this.time_remain = 0;
		this.qualityRH = 0;
		this.qualityCO = 0;
		this.filter_remain = 0;
		this.filter_quality = 0;
		
		this.power 		= 0;
		this.power_avg 	= 0;
		this.power_max 	= 0;

		this.auto_min 	= 0;
		this.auto_max 	= 0;
		this.box_action = 0;		
		
		/*Private connection related info*/
		this.duco_node 		= self.getStoreValue("duco_node");
		this.duco_IPaddress = self.getSetting('address');
		this.duco_IPport	= self.getSetting('port');
		this.duco_modbusID	= self.getSetting('modbus_id');		
		
		/*Create private instance of client ONCE at init*/
		this.client 	= new DucoMaster.ModbusRTU();	
		console.log("initiated duco device: " + DucoMaster.name + "@" +this.duco_IPaddress+":"+this.duco_IPport+"->"+this.duco_modbusID+"["+this.duco_node +"]");
    }


    handler(self){  //self.log("####### DEVICE_LIB CODE ######");					
					
					
						this.client.setTimeout( 10000 );	//connection timeout
						
						this.client.connectTCP(this.duco_IPaddress, { port: this.duco_IPport }).then(() =>{					
							this.client.setTimeout( 5000 );			//read timeout
							this.client.setID(this.duco_modbusID);				
							
							Promise.allSettled([
								this.client.readInputRegisters( 100 * this.duco_node     , 6),		//all types		
								this.client.readInputRegisters((100 * this.duco_node)+7  , 2),		//Only for Ducobox Energy			
								
								this.client.readHoldingRegisters((100 * this.duco_node)  , 2),		//all types
								this.client.readHoldingRegisters((100 * this.duco_node)+2, 2)		//Only for Ducobox Energy			
								//this.client.writeRegisters((10 * this.duco_node) + 5, [10])		//minimal value
								
							]).then((data) => {									
									this.client.close();
									//self.log(data[0].data[2]);
									
									if(data[0].status == 'fulfilled')
									{	var buf = new Uint8Array(data[0].value.buffer).buffer;	//create byte array of Uint8
										var view = new DataView(buf);						//Create a data view of it									
										this.box_type 		= view.getInt16(0);
										this.time_remain 	= view.getInt16(2);
										this.flow_level 	= view.getInt16(4);
										this.qualityRH		= view.getInt16(6);
										this.qualityCO		= view.getInt16(8);
									} 
									
									if(data[1].status == 'fulfilled')
									{	var buf = new Uint8Array(data[1].value.buffer).buffer;	//create byte array of Uint8
										var view = new DataView(buf);						//Create a data view of it									
										this.filter_remain  = view.getInt16(0);
										this.filter_quality = view.getInt16(2);
										
									} 
									
									if(data[2].status == 'fulfilled')
									{	var buf = new Uint8Array(data[1].value.buffer).buffer;	//create byte array of Uint8
										var view = new DataView(buf);						//Create a data view of it									
										this.box_status  = view.getInt16(0);
										//this.xxx = view.getInt16(2);
										
									} 
									
									//self.log("auto_min: "+this.auto_min + ", auto_max: "+this.auto_max + ", box_action: "+this.box_action); 
								
							}).catch((err) => {
									this.client.close();
								self.log(err);
							})							
							
						})	
						.catch(function(e){		self.log(e);
						});	
						
						
						
						// MEASURE_POWER: MOMENTAL (total) CHARGING POWER
						if (self.getCapabilityValue('flow_level') != this.flow_level) {
							self.setCapabilityValue('flow_level', this.flow_level)
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
						
						// MEASURE_POWER: MOMENTAL (total) CHARGING power
						if (self.getCapabilityValue('measure_power.actual') != this.power) {
							self.setCapabilityValue('measure_power.actual', this.power)
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
						if (self.getCapabilityValue('measure_power.avg') != this.power_avg) {
							self.setCapabilityValue('measure_power.avg', this.power_avg)
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
						if (self.getCapabilityValue('measure_power.max') != this.power_max) {
							self.setCapabilityValue('measure_power.max', this.power_max)
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
						if (self.getCapabilityValue('limit_flow_low') != this.auto_min) {
							self.setCapabilityValue('limit_flow_low', this.auto_min)
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
						if (self.getCapabilityValue('limit_flow_high') != this.auto_max) {
							self.setCapabilityValue('limit_flow_high', this.auto_max)
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
					let state = this.operational_string(this.box_status);				
                    if (self.getCapabilityValue('operational_status') != state ) {				
                        self.setCapabilityValue('operational_status', state )
                            .then(function () {

                                let tokens = {
                                    status: self.homey.__(state)
                                }
                               // this._changedOperationalStatus.trigger(self, tokens, {}).catch(error => { self.error(error) });	//Tokens are made availbe in Flows as 'global sources'. For tokens see driver.flow.compose.json
							
                            }).catch(reason => {
                                self.error(reason);
                            });

                    }
					
					// OPERATIONAL STATUS		
					
					let type = DucoMaster.name;				
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

					
            }
	
	
	
	getHello(){
		return "hello";
	}
	
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
				case 11: return "Modes not supported";
				case 99: return "Error";
				default: return "Unknown";
			}
		
	}				
}

exports = module.exports = DucoMaster;