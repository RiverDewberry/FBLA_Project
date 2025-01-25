export const upgradeData = {
	names: ["Upgrade 1","Upgrade 2","Upgrade 3","Upgrade 4","Upgrade 5","Upgrade 6","Upgrade 7","Upgrade 8","Upgrade 9"],
	//the name of each upgrade
	costs: new Uint32Array([32, 64, 128, 256, 512, 1024, 2048, 4096, 8192]),
	//the inital cost of each upgrade
	descriptions: [],
	//a description of each upgrade
	effects: [],
	//the effect of each upgrade stored as arrays of 9 values, when an upgrade is applied to a factory, each value in the array that corosponds to the upgrade is added to the corosponding value in the factory data.
	maxUpgrades: new Uint8Array([])
}
