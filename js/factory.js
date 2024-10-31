//This file has the factory class, the array that stores factories, and functions related 
//to factories such as getTotalProfit

const factories = [];//this is the array that stores factories

class Factory {//the factory class

    //the actual factory data is stored as a typed array, and getters and setters are used to make
    //the data easily accessable

    #factoryDataBytes;
    //this buffer stores factory data in the following format:
    //
    //bytes 0 - 3: the production amount of the factory before modifiers are applied (production)
    //bytes 4 - 7: the cost of maintaining the factory (cost)
    //bytes 8 - 11: the chance a worker will get injured on any given day (saftey)
    //bytes 12 - 15: the happiness of workers measures as a value from 0 to 1 (happiness)
    //bytes 16 - 17: amount of workers in the factory (workers)
    //bytes 18 - 19: max workers that can be in the factory (maxWorkers)
    
    #factoryDataVeiw;
    //this allows for the raw data to be interpreted as many different types

    static add(production, cost, saftey, happiness, workers, maxWorkers){
        //this static method adds a factory to the array of factories and returns its index
        return factories.push(new Factory(
            production, 
            cost, 
            saftey, 
            happiness, 
            workers, 
            maxWorkers
        ));
    }

    static remove(index){
        //this static method remove the factory at a given index in factories
        factories.splice(index, 1);
    }

    static get totalNetProduction(){
        //this method gets the net production across all factories in factories

        let acc;//accumulator
        for(let i = factories.length - 1; i > -1; i--){
            acc += factories[i].production - factories[i].cost;
        }
        return acc;
    }

    constructor(production, cost, saftey, happiness, workers, maxWorkers)
    {
        this.#factoryDataBytes = new ArrayBuffer(20);//makes the arrayBuffer
        this.#factoryDataVeiw = new DataView(this.#factoryDataBytes);//makes the data veiw

        //the following 6 lines set starting values
        this.#factoryDataVeiw.setInt32(0, production, true);
        this.#factoryDataVeiw.setInt32(4, cost, true);
        this.#factoryDataVeiw.setFloat32(8, saftey, true);
        this.#factoryDataVeiw.setFloat32(12, happiness, true);
        this.#factoryDataVeiw.setInt16(16, workers, true);
        this.#factoryDataVeiw.setInt16(18, maxWorkers, true);
    }

    //these functions let you set values to the binary array
    set production(production){
        this.#factoryDataVeiw.setInt32(0, production, true);
    }
    set cost(cost){
        this.#factoryDataVeiw.setInt32(4, cost, true);
    }
    set saftey(saftey){
        this.#factoryDataVeiw.setFloat32(8, saftey, true);
    }
    set happiness(happiness){
        this.#factoryDataVeiw.setFloat32(12, happiness, true);
    }
    set workers(workers){
        this.#factoryDataVeiw.setInt16(16, workers, true);
    }
    set maxWorkers(maxWorkers){
        this.#factoryDataVeiw.setInt16(18, maxWorkers, true);
    }

    //these functions let you get values from the binary array
    get production(){
        return this.#factoryDataVeiw.getInt32(0, true);
    }
    get cost(){
        return this.#factoryDataVeiw.getInt32(4, true);
    }
    get saftey(){
        return this.#factoryDataVeiw.getFloat32(8, true);
    }
    get happiness(){
        return this.#factoryDataVeiw.getFloat32(12, true);
    }
    get workers(){
        return this.#factoryDataVeiw.getInt16(16, true);
    }
    get maxWorkers(){
        return this.#factoryDataVeiw.getInt16(18, true);
    }
}