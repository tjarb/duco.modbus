"use strict";

const { Driver } = require('homey');
const net = require('net');



class DucoModbusDriver extends Driver {

    async onInit() {
        this.log('Mennenkes Storage driver has been initialized');
        //this._registerFlows();
    }
/*TODO: operation status needs to match mennekes states*/
    _registerFlows() {
		
  /*      //Conditions
        const isOperationalStatus = this.homey.flow.getConditionCard('isOperationalStatus');
        isOperationalStatus.registerRunListener(async (args, state) => {
            this.log(`[${args.device.getName()}] Condition 'isOperationalStatus' triggered`);

            if (args.device.getCapabilityValue('operational_status') == this.homey.__('Available') && args.status == '0') {
            } else if (args.device.getCapabilityValue('operational_status') == this.homey.__('Occupied') && args.status == '1') {
                return true;
            } else if (args.device.getCapabilityValue('operational_status') == this.homey.__('Reserved') && args.status == '2') {
                return true;
            } else if (args.device.getCapabilityValue('operational_status') == this.homey.__('Unavailable') && args.status == '3') {
                return true;
            } else if (args.device.getCapabilityValue('operational_status') == this.homey.__('Faulted') && args.status == '4') {
                return true;
            } else {
                return false;
            }
        });
	*/
	this.log('...Done');

		
	
    }



//onPairListDevices( data, callback ) {
async onPair(session){
	let self = this;
	let duco_settings;
	
	
	
	session.setHandler('settings', async (data) => {
      duco_settings = data;
	  self.log(duco_settings);
      session.nextView();
    });
	
	session.setHandler('list_devices', async (data) => {

		return   discover(duco_settings);
		
	});

	function discover(duco_settings)	{	
	
		const  ModbusRTU = require("modbus-serial");
		let client = new ModbusRTU();
	
		self.log(">>Init pairlistdevices");	
		client.setTimeout( 5000 );
		return client.connectTCP(duco_settings.address, { port: duco_settings.port })
		 .then( async function(data) {	/*Starts in its own environment, we lost parent context here*/				
			let node;
			let devices = [];
			let modbus_TCP = false;	
			
			self.log(">>Connected...");	
			client.setTimeout( 1000 );
			client.setID(1);		
			let test = [];
			
			/*Check system to be TCP or RTU*/
			let dev_address = 100;	//check 0100 to be duco master (TCP version)			
			await client.readInputRegisters (dev_address, 1)	//the system is creating 10 read connections here and fails on the 11th*/
			.then( data =>{
					let device_type = data.data[0];
					if(device_type == 17){
						self.log("System is modbus TCP-based");
						modbus_TCP = true;
					}
					else{
						self.log("System is modbus RTU-based");
						modbus_TCP = false;
					}
			});
			
			if(modbus_TCP == false){
				for(node=1;node<100;node++)	//try to read sequential devices
				{	let dev_address = node*10;
					await client.readInputRegisters (dev_address, 1)	//the system is creating 10 read connections here and fails on the 11th*/
						.then( data =>{
							let device_type = data.data[0];
							let device={};
							//self.log("Read:"+node+"= " + device_type);	
							
							switch(device_type){
							case 0: return;	//no device
							
							case 10: 	//Masterbox				
										device = require('../../lib/master.js');																												
										break;									
							case 11: 	//regular valve		
										device = require('../../lib/regvalve.js');																										
										break;												
							case 12: 	//regular valve	
										device = require('../../lib/co2valve.js');															
										break;			
							case 13: 	//regular valve	
										device = require('../../lib/RHvalve.js');
										break;			
							case 14: 	//regular room module without sensors
										device = require('../../lib/reg_room.js');																				
										break;			
							case 15: 	//CO2 room module	
										device = require('../../lib/CO2room.js');																				
										break;											
							case 16: 	//RH room module	
										device = require('../../lib/RHroom.js');																				
										break;	
							case 17: 	//Ventilation grill
										device = require('../../lib/vent_grill.js');																				
										break;
							case 18: 	//Contact
										device = require('../../lib/contact.js');																				
										break;
							case 21: 	//iAV Sensorless
										device = require('../../lib/iAV_regvalve.js');																				
										break;
							case 22: 	//iAV Sensorless
										device = require('../../lib/iAV_RHvalve.js');																				
										break;
							case 23: 	//iAV Sensorless
										device = require('../../lib/iAV_co2valve.js');																				
										break;									

							case 24 :	//unsupported for now
							default:	//regular valve	
										device = require('../../lib/unknown.js');		
										break;
							}						
						
							devices.push({
								name: device.name,
								data: {
									id: duco_settings.address +": " + duco_settings.port + ":" +node
								},
								settings: duco_settings										,										
								store: {	// Optional: The store is dynamic and persistent storage for your device
										duco_node: node,
										duco_type: device_type,
										duco_lib : device.lib_url
								},
								// Optional: These properties overwrite the defaults that you specified in the driver manifest:
								icon: device.icon,	//"/icon.svg", 	// relative to: /drivers/<driver_id>/assets/
								capabilities: device.capabilities, //["flow_level", "measure_power.actual", "measure_power.avg", "measure_power.max", "flow_level.low", "flow_level.high", "operational_status", "operational_status.type"],
								capabilitiesOptions: device.capabilitiesOptions	//{ }																									
							});				
							self.log("                 Found device: " + device.name + " @ node: "+node);	

						})
						.catch(function(e){			
							self.log("Error on "+node+" discovery cycles:"+ e);					//just log
							//throw new Error("Scan stopped, coud not read all required registers");
						});				
						
						
				}
			}
			else	//TCP
			{	for(node=1;node<100;node++)	//try to read sequential devices
				{	let dev_address = node*100;
					await client.readInputRegisters (dev_address, 1)	//the system is creating 10 read connections here and fails on the 11th*/
						.then( data =>{
							let device_type = data.data[0];
							let device={};
							//self.log("Read:"+node+"= " + device_type);	
							
							switch(device_type){
							case 0: return;	//no device
							
							case 17: 	//Masterbox				
										device = require('../../lib/TCP/master.js');																												
										break;						
/*										
							case 13: 	//regular valve		//sensorless
										device = require('../../lib/regvalve.js');																										
										break;												
							case 16: 	//CO2 valve	
										device = require('../../lib/co2valve.js');															
										break;			
							case 14: 	//RH valve	
										device = require('../../lib/RHvalve.js');
										break;			
							case 8: 	//regular room module without sensors (Batt)
							case 9: 	//regular room module without sensors (wired)
										device = require('../../lib/reg_room.js');																				
										break;			
							case 12: 	//CO2 room module	
										device = require('../../lib/CO2room.js');																				
										break;											
							case 10: 	//RH room module	
										device = require('../../lib/RHroom.js');																				
										break;								
							case 18: 	//Contact
										device = require('../../lib/contact.js');																				
										break;
						/*	case 17: 	//Ventilation grill
										device = require('../../lib/vent_grill.js');																				
										break;
							case 21: 	//iAV Sensorless
										device = require('../../lib/iAV_regvalve.js');																				
										break;
							case 22: 	//iAV Sensorless
										device = require('../../lib/iAV_RHvalve.js');																				
										break;
							case 23: 	//iAV Sensorless
										device = require('../../lib/iAV_co2valve.js');																				
										break;									
						*/
							case 24 :	//unsupported for now
							default:	//regular valve	
										device = require('../../lib/unknown.js');		
										break;
							}						
						
							devices.push({
								name: device.name,
								data: {
									id: duco_settings.address +": " + duco_settings.port + ":" +node
								},
								settings: duco_settings										,										
								store: {	// Optional: The store is dynamic and persistent storage for your device
										duco_node: node,
										duco_type: device_type,
										duco_lib : device.lib_url
								},
								// Optional: These properties overwrite the defaults that you specified in the driver manifest:
								icon: device.icon,	//"/icon.svg", 	// relative to: /drivers/<driver_id>/assets/
								capabilities: device.capabilities, //["flow_level", "measure_power.actual", "measure_power.avg", "measure_power.max", "flow_level.low", "flow_level.high", "operational_status", "operational_status.type"],
								capabilitiesOptions: device.capabilitiesOptions	//{ }																									
							});				
							self.log("                 Found device: " + device.name + " @ node: "+node);	

						})
						.catch(function(e){			
							self.log("Error on "+node+" discovery cycles:"+ e);					//just log
							//throw new Error("Scan stopped, coud not read all required registers");
						});				
						
						
				}
		
			}
			self.log("devices found =" + devices);
			return devices;
		})	
		.catch(function(e){		
			self.log("Error " + e);
			throw new Error("Could not open device on "+duco_settings.address +":"+duco_settings.port);
			
		});
		
		client.close();	
		return devices;
		
		//const devices = await DeviceApi.discoverDevices();	//Implement discovery//
	  /*  const devices = [
		  {	//https://apps.developer.homey.app/the-basics/devices/pairing#device-pairing-data//
			// Required properties:
			"data": { "id": "abcd" },

			// Optional properties, these overwrite those specified in app.json:
			// "name": "My Device",
			// "icon": "/my_icon.svg", // relative to: /drivers/<driver_id>/assets/
			// "capabilities": [ "onoff", "dim" ],
			// "capabilitiesOptions: { "onoff": {} },

			// Optional properties, device-specific:
			// "store": { "foo": "bar" },
			// "settings": { "my_setting": "my_value" },

		  }
		  
		  
		 
		]*/
	}
	
	self.log("[[[[Returning here]]]");
    //callback( null, devices );

}
 

    #sleep(time) {
        return new Promise((resolve) => this.homey.setTimeout(resolve, time));
    }


}
module.exports = DucoModbusDriver;
