import { factories } from "./factory.js";

//stores the game state in the gamestate object
const gameState = {
    funds: 0,//how much money the player has
    hour: 0,//the current in-game hour (24 hour format)
    day: 0,//the current in-game day
}

factories.makePresetFactory(1);//makes factory of type 1

for(let i = 0; i < 24; i++){
    gameLogicTick();
}

console.log(factories.getWorkerUnrest(0));
console.log(factories.getHappiness(0));

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
        //adds funds from net profit

	if((factories.getHappiness(i) < 0.5) && (Math.random() > 0.75))
	    factories.setWorkers(i, factories.getWorkers(i) - 1);
	    //workers start to quit when happiness is too low
        
	factories.setHappiness(i, factoryHappiness(i));//updates happiness

        factories.setWorkerUnrest(i, factoryUnrest(i));//updates unrest
    }
}

function factoryNetProfit(index) {//calculates the net profit eaxh factory generates
    return (
	    factories.getProduction(index) * (factories.getHappiness(index) > 1.25 ? 1.1 : 1)
    ) - factories.getCost(index) - //base cost and profit with happiness modifier
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
        //with each worker. IMPORTANT: maxWorkers whould always be greater than minWorkers
        factories.getProduction(index) * (factories.getHappiness(index) > 1.25 ? 1.1 : 1)
    );
}

function factoryHappiness (index) {
    return (
        (factories.getHappiness(index) * 8) +
        (-0.5 + factories.getHourlyPay(index) * 0.1) + 
	(1.8 - factories.getHoursWorked(index) * 0.1)
    ) * 0.1;
}//calculates the happiness of each factory

function factoryUnrest (index) {
    return (
	(factories.getWorkerUnrest(index) * 0.999) +
        (factories.getHoursWorked(index) > 12 ? 0.01 : 0) +
        (factories.getHappiness(index) < 0.75 ? 0.01 : 0) +
        (factories.getHourlyPay(index) < 10 ? 0.01 : 0)
    )
}//calculates the unrest in each factory
