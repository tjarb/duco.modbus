"use strict";



class CO2Valve{
    static name = "iAV CO2 valve";
	static icon= "/icon.svg"; 		// relative to: /drivers/<driver_id>/assets/
	static capabilities = ["flow_level", "operational_status", "operational_status.type"];
	static capabilitiesOptions= { };
	


    constructor() {
  
    }


    get(key) {
        return this.map.get(key);
    }

    length() {
        return this.map.size;
    }    

}
exports = module.exports = CO2Valve;