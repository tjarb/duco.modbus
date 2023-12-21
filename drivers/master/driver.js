"use strict";

const { Driver } = require('homey');

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


/*	setMaxActiveCurrentOutput(current) {
		this.log("Write max current @driver.js with value: " + current);

		current = Math.min(32, current);
		current = Math.max( 6, current);
		
		// Inverter.WMax, Set active current limit, Device > Inverter > Maximum active current output
		//return self.client.writeMultipleRegisters(1000, buffer)
		return self.client.writeSingleRegister(1000,current)
		  .then((result) => {
			return Promise.resolve(true);
		  }).catch(reason => {
        return Promise.reject(reason);
      });
	}
	*/
}
module.exports = DucoModbusDriver;
