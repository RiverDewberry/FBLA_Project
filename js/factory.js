import { CompositeArray } from "./compositeArray.js"
import { upgradeData } from "./upgrades.js"
export const factories = {
    //the factories object is mostly just a collection of wrappers to interact with the
    //composite array in a more usable and readable format

    factoryArray: new CompositeArray(//makes the class that stores the factory data
        [//this specifies types in each factory
            CompositeArray.uint32,//production - 0
            CompositeArray.uint32,//cost - 1
            CompositeArray.float32,//safety - 2
            CompositeArray.float32,//happiness - 3
            CompositeArray.uint16,//workers - 4
            CompositeArray.uint16,//minWorkers - 5
            CompositeArray.uint16,//maxworkers - 6
            CompositeArray.uint8,//hourlyPay - 7
            CompositeArray.uint8,//hoursWorked - 8
            CompositeArray.float32,//workerUnrest - 9
	        CompositeArray.uint16//targetWorkerAmount - 10
        ],
        64//the max amount of factories
    ),
        NamesOfData: ["production","cost","safety","happiness","workers","minWorkers","maxworkers","hourlyPay","hoursWorked","workerUnrest","TWorkers",]
    ,

    //dar code
    //not anymore :3

    presetFactoryValues: [
        //an array of preset values for factories, I think this is easier to use than the previous
        //method of using the getters and setters for each different type of factory

        //see lines 7 - 16 for what value each index represents
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [100, 10, 1, 1, 2, 1, 3, 9, 13, 0, 0],//first factory
    ],
    
    presetCosts: [
	0,
	5000
    ],

    setPresetFactoryValues: function (index, type) { //should zero out data before hand

        if ((type < 0) || (type >= this.presetFactoryValues.length)) {
            console.error("type does not exist");
            return;
        }//logs an error if the type does not exist

        for (let i = 0; i < this.valLength; i++) {
            this.factoryArray.setVal(index, i, this.presetFactoryValues[type][i]);
            //sets data to the preset using the array
        }
    },

    zeroOutData: function (index) {
        for (let i = 0; i < this.valLength; i++) {
            this.factoryArray.setVal(index, i, 0);
        }
    },

    checkErrors: function () {
        for (let i = 0; i < this.length; i++) {
            this.checkErrors(i);//checks erros across whole factory array
        }
    },

    checkErrors: function (index) {
        for (let i = 0; i < this.ValLength; i++) {
            this.checkErrors(index, i);//check 1 factorys data
        }
    },

    checkErrors: function (index, specVal) { //checks 1 factorys data val
        if (typeof (this.factoryArray.getVal(index)) === "string") {
            console.error("Null vall in fac " + index + "At val " +
                this.valTypeToStringName(specVal));
        }
        if (typeof (this.factoryArray.getVal(index)) === "undefined") {
            console.error("udf vall in fac " + index + "At val " +
                this.valTypeToStringName(specVal));
        }
    },

    valTypeToStringName: function (val) {
        switch (val) {
            default:
                return "YOU messed UP"
                break;
            case 0: return "Production";
            case 1: return "Cost";
            case 2: return "Safety";
            case 3: return "Happiness";
            case 4: return "Workers";
            case 5: return "MinWorkers";
            case 6: return "MaxWorkers";
            case 7: return "HourlyPay";
            case 8: return "HoursWorked";
            case 9: return "WorkerUnrest";
            case 10: return "targetWorkerAmount";

        }
    },
    //Dar code

    //getters and setters for each value
    setProduction: function (index, val) {
        this.factoryArray.setVal(index, 0, val);
    },//sets production at a specified index
    setCost: function (index, val) {
        this.factoryArray.setVal(index, 1, val);
    },//sets cost at a specified index
    setSafety: function (index, val) {
        this.factoryArray.setVal(index, 2, val);
    },//sets safety at a specified index
    setHappiness: function (index, val) {
        this.factoryArray.setVal(index, 3, val);
    },//sets happiness at a specified index
    setWorkers: function (index, val) {
        this.factoryArray.setVal(index, 4, val);
    },//sets workers at a specified index
    setMinWorkers: function (index, val) {
        this.factoryArray.setVal(index, 5, val);
    },//sets minWorkers at a specified index
    setMaxWorkers: function (index, val) {
        this.factoryArray.setVal(index, 6, val);
    },//sets maxWorkers at a specified index
    setHourlyPay: function (index, val) {
        this.factoryArray.setVal(index, 7, val);
    },//sets hourlyPay at a specified index
    setHoursWorked: function (index, val) {
        this.factoryArray.setVal(index, 8, val);
    },//sets hoursWorked at a specified index
    setWorkerUnrest: function (index, val) {
        this.factoryArray.setVal(index, 9, val);
    },//sets workerUnrest at a specified index
    setTargetWorkerAmount: function (index, val) {
        this.factoryArray.setVal(index, 10, val);
    },//sets TargetWorkerAmount at a specified index    

    //Func for geting fac values
    getProduction: function (index) {
        return this.factoryArray.getVal(index, 0);
    },//gets production at a specified index
    getCost: function (index) {
        return this.factoryArray.getVal(index, 1);
    },//gets cost at a specified index
    getSafety: function (index) {
        return this.factoryArray.getVal(index, 2);
    },//gets saftey at a specified index
    getHappiness: function (index) {
        return this.factoryArray.getVal(index, 3);
    },//gets happiness at a specified index
    getWorkers: function (index) {
        return this.factoryArray.getVal(index, 4);
    },//gets workers at a specified index
    getMinWorkers: function (index) {
        return this.factoryArray.getVal(index, 5);
    },//gets minWorkers at a specified index
    getMaxWorkers: function (index) {
        return this.factoryArray.getVal(index, 6);
    },//gets maxWorkers at a specified index
    getHourlyPay: function (index) {
        return this.factoryArray.getVal(index, 7);
    },//gets hourlyPay at a specified index
    getHoursWorked: function (index) {
        return this.factoryArray.getVal(index, 8);
    },//gets hoursWorked at a specified index
    getWorkerUnrest: function (index) {
        return this.factoryArray.getVal(index, 9);
    },//gets workerUnrest at a specified index
    getTargetWorkerAmount: function (index) {
        return this.factoryArray.getVal(index, 10);
    },//gets TargetWorkerAmount at a specified index


    makeFactory: function (//allows for the creation of a factory
        production, cost, safety, happiness, workers,
        minWorkers, maxWorkers, hourlyPay, hoursWorked, workerUnrest, targetWorkerAmount
    ) {
        return this.factoryArray.addInstance(
            [
                production, cost, safety, happiness, workers,
                minWorkers, maxWorkers, hourlyPay, hoursWorked, workerUnrest, targetWorkerAmount
            ]
        );//this value is returned so it can be checked if it succeeds when called
    },

    makePresetFactory: function (type) {//makes a factory from a preset type 
        if ((type < 0) || (type >= this.presetFactoryValues.length)) {
            console.error("type does not exist");
            return;
        }//logs an error if the type does not exist

        this.factoryArray.addInstance(this.presetFactoryValues[type]);//makes the factory
    },

    removeFactory: function (index) {//removes factories
        this.factoryArray.removeInstance(index);
    },

    upgradeData: upgradeData,

    get length() {
        return this.factoryArray.usedLength;
    },//this is setup such that factories.length returns the amount of factories created

    get valLength() {
        return this.factoryArray.types.length;
    },

    get maxLength() {
        return this.factoryArray.arrayLength;
    }
}
