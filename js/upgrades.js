const factoryVals = 12;
//the amount of values each factory stores

export const upgradeData = {
	names: ["Increase production","Upgrade 2","Upgrade 3","Upgrade 4","Upgrade 5","Upgrade 6","Upgrade 7","Upgrade 8","Upgrade 9"],
	//the name of each upgrade
	costs: new Uint32Array([32, 64, 128, 256, 512, 1024, 2048, 4096, 8192]),
	//the inital cost of each upgrade
	descriptions: [],
	//a description of each upgrade
	effects: [[0,10], ],
	//the effect of each upgrade stored as arrays of 9 values, when an upgrade is applied to a factory, each value in the array that corosponds to the upgrade is added to the corosponding value in the factory data.
	maxUpgrades: new Uint8Array([])
}
	///production - 0
			//cost - 1
			//safety - 2
			//happiness - 3
			//workers - 4
			//minWorkers - 5
			//maxworkers - 6
			//hourlyPay - 7
			//hoursWorked - 8
			//workerUnrest - 9
			//targetWorkerAmount - 10
			//factoryType - 11
function makeUpgrade (upgrade) {
	//takes a format for upgrades and turns it into something that 
	//can be easily used to change the values of factories
	
	let retval = [];
	//the return value

	for(let i = 0; i < 12; i++) {
		retval[i] = 0;
	}
	for(let i = 0; i < upgrade.length >> 1; i++) {
		retval[upgrade[i << 1]] = upgrade[1 + (i << 1)];
	}
	return retval;
}