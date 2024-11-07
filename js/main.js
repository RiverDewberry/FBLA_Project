import { factories } from "./factory.js";

//stores the game state in the gamestate object
const gameState = {
    funds: 0,//how much money the player has
    hour: 0,//the current in-game hour (24 hour format)
    day: 0,//the current in-game day
}

factories.makePresetFactory(0);
factories.makePresetFactory(1);//makes 2 factories

factories.setPresetFactoryValues(0, 1);//sets factory 0 to type 1

console.log(factories.getProduction(0));//expected value is 10

console.log(factories);//logs factories

factories.makePresetFactory(2);
//makes a factory from a type that does not exist, logs error as expected

function gameLogicTick() {

    gameState.hour++;//increases time by 1
    
    if (gameState.hour === 24) {
        //increases gameState.day by 1 and sets gameState.hour to 0 when 24 hours pass
        gameState.hour = 0;
        gameState.day++;
    }

    if(gameState.hour < 8)return;//all factories start working at 8

    for (let i = 0; i < factories.length; i++) {

        if(gameState.hour > (7 + factories.getHoursWorked(i))) continue;
        //if it is past working hours, the factory doesn't generate profit or have any cost
        
        if(factories.getWorkers(i) < factories.getMinWorkers(i)) continue;
        //if there isn't enough workers, the factory doesn't generate profit or have any cost

        gameState.funds += factoryNetProfit(i);
    }
}

function factoryNetProfit(index) {//calculates the net profit eaxh factory generates
    return factories.getProduction(index) - factories.getCost(index) - //base cost and profit 
    (factories.getHourlyPay(index) * factories.getWorkers(index)) + 
    //since this runs each hour, the hourly pay is a cost
    Math.round(
        Math.sqrt(
            (factories.getWorkers(index) - factories.getMinWorkers(index)) /
            (factories.getMaxWorkers(index) - factories.getMinWorkers(index))
        ) * 
        //this value indicates how much of the capacity for workers has been filled and is a
        //modifier on production, if the total capacity for workers is filled, then the production
        //is doubled, if only the minimum amount of workers are in the factory, then there is no
        //bonus to production, because of the Math.sqrt, the effect of adding workers decreases
        //with each worker. IMPORTANT: maxWorkers whould alwoay be greater than minWorkers
        factories.getProduction(index)
    );
}