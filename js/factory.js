import { CompositeArray } from "./compositeArray";
export const factories = {
    //the factories object is mostly just a collection of wrappers to interact with the
    //composite array in a more usable and readable format
    
    factoryArray: new CompositeArray(//makes the class that stores the factory data
        [//this specifies types in each factory
            CompositeArray.uint32,//production
            CompositeArray.uint32,//cost
            CompositeArray.float32,//safety
            CompositeArray.float32,//happiness
            CompositeArray.uint16,//workers
            CompositeArray.uint16,//minWorkers
            CompositeArray.uint16,//maxworkers
            CompositeArray.uint8,//hourlyPay
            CompositeArray.uint8,//hoursWorked
            CompositeArray.float32//workerUnrest
        ],
        64//the max amount of factories
    ),
    
    //dar code
    SetPrestFactoryValues: function (index,Type){ //should zero out data before hand
       switch (Type) {
        case 0:
            this.setCost(index,0)
            this.setWorkers(index,0)
            this.setMinWorkers(index,0)
            this.setMaxWorkers(index,100000)
            this.setHourlyPay(index,0)
            this.setHoursWorked(index,0)
            this.setWorkerUnrest(index,0)
            break;
        case 1: //first factory
            this.setProduction(index,10)
            this.setCost(index,0)
            this.setWorkers(index,1)
            this.setMinWorkers(index,1)
            this.setMaxWorkers(index,100000)
            this.setHourlyPay(index,1)
            this.setHoursWorked(index,0)
            this.setWorkerUnrest(index,0)
        default:
            break;
       }
    },
    ZeroOutData:function(index){
        for (let i = 0; i < 9; i++) {
                this.factoryArray.setVal(index, i,0);  
        }
    },
    CheckErrors:function(){
        for (let i = 0; i < this.length; i++) {
            this.CheckErrors(i);//checks erros across whole factory array
        }
    },
    CheckErrors:function(index){
        for (let i = 0; i < this.ValLength; i++) { 
            this.CheckErrors(index,i);//check 1 factorys data
        }
    },
    CheckErrors:function(index,SpecVal){ //checks 1 factorys data val
        if (typeof(this.factoryArray.getVal(index)) === "string") {
            console.error("Null vall in fac " + index + "At val " + this.ValTypeToStringName(SpecVal));
        }
        if (typeof(this.factoryArray.getVal(index)) === "undefined") {
            console.error("udf vall in fac " + index + "At val " + this.ValTypeToStringName(SpecVal));
        }
    },
    ValTypeToStringName:function(val){
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

    makeFactory: function (//allows for the creation of a factory
        production, cost, safety, happiness, workers,
        minWorkers, maxWorkers, hourlyPay, hoursWorked, workerUnrest 
    ) {
        return this.factoryArray.addInstance(
            [
                production, cost, safety, happiness, workers,
                minWorkers, maxWorkers, hourlyPay, hoursWorked, workerUnrest 
            ]
        );//this value is returned so it can be checked if it succeeds when called
    },

    removeFactory: function (index) {//removes factories
        this.factoryArray.removeInstance(index);
    },

    get length () {
        return this.factoryArray.usedLength;
    },//this is setup such that factories.length returns the amount of factories created
    get ValLength(){
        return(9);
    },
    get maxLength () {
        return this.factoryArray.arrayLength;
    }
}