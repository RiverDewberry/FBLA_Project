export const upgradeData = {
	names: []= ["Upgrade 1","Upgrade 2" ],
	//the name of each upgrade
	costs: new Uint8Array([666]),
	//the inital cost of each upgrade
	descriptions: [],
	//a description of each upgrade
	effects: [],
	//the effect of each upgrade stored as arrays of 9 values, when an upgrade is applied to a factory, each value in the array that corosponds to the upgrade is added to the corosponding value in the factory data.
	maxUpgrades: new Uint8Array([])
}
