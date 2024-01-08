"use strict";



class DucoValve{
    static icon= "/icon.svg"; 		// relative to: /drivers/<driver_id>/assets/
	static capabilities = ["operational_status.type"];
	static capabilitiesOptions= { };
	static name = "unknown device";


    constructor() {
  
    }


    get(key) {
        return this.map.get(key);
    }

    length() {
        return this.map.size;
    }    

}
exports = module.exports = DucoValve;