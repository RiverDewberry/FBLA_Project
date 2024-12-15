import { factories } from "./factory.js";

let captureX, captureY, captureW, captureH;
function factoryAt(x, y) {
    x = Math.round(x * captureW / canvas.width + captureX);
    y = Math.round(y * captureH / canvas.height + captureY);

    let yOff;
    let xOff;

    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            yOff = Math.abs(y - (16 * (i - (7 - j)) + 378));
            xOff = Math.abs(x - (64 * i + 32 * ((7 - j) - i) + 32.5));
            if (xOff + (yOff << 1) < 30.5) return (i << 3) + j;
        }
    }
    return -1;
};

//DISPLAY
//creating and setting up canvas
const canvas = document.getElementById("canvas")
let displayCtx = canvas.getContext("bitmaprenderer");
const display = new Worker("../js/display.js");
display.postMessage([0, canvas.width, canvas.height]);
canvasSetup();

let loadedNum = 0;

//images
const imgs = [];
const imgbmps = [];
const srcs = [
    "grass1", "grass2", "grass3", "grass4", "grass5", "boxFront", "boxBack", "factory1",
    "border"
];

for(let i = 0; i < srcs.length; i++){
    imgs[i] = new Image();
    imgs[i].src = "../sprites/" + srcs[i] + ".png";
    imgs[i].onload = sendSpriteBitmaps;
}

function sendSpriteBitmaps() {
    loadedNum++;
    if(srcs.length !== loadedNum)return;

    for(let i = 0; i < srcs.length; i++){
	    imgbmps[i] = createImageBitmap(imgs[i]);
    }

    Promise.all(imgbmps).then((sprites) => {
        display.postMessage([5, srcs, sprites, srcs.length]);
        display.postMessage([1]);
    });
}

display.onmessage = (e) => {
    if(e.data.length === undefined){
        displayCtx.transferFromImageBitmap(e.data);
        display.postMessage([6]);
        return;
    }
    captureX = e.data[0];
    captureY = e.data[1];
    captureW = e.data[2];
    captureH = e.data[3];
}

function canvasSetup() {
    //this creates a new context when each 
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    displayCtx = canvas.getContext("bitmaprenderer");
    display.postMessage([0, canvas.width, canvas.height]);
}

//events
let mouseDownX = 0;
let mouseDownY = 0;
canvas.addEventListener("wheel", (e) => {
    e.preventDefault();
    display.postMessage([2, e.deltaY]);
});
canvas.addEventListener("mousemove", (e) => {
    display.postMessage([4, e.offsetX, e.offsetY]);
}
);
canvas.addEventListener("mousedown", (e) => {
    display.postMessage([3, true]);
    mouseDownX = e.offsetX;
    mouseDownY = e.offsetY;
});
canvas.addEventListener("mouseup", (e) => {
    display.postMessage([3, false]);
    if(mouseDownX === e.offsetX && mouseDownY === e.offsetY){
        display.postMessage([7, factoryAt(e.offsetX, e.offsetY), "factory1"]);
    }
});
window.addEventListener("resize", (e) => {
    canvasSetup();
    display.postMessage([1]);
});
//DISPLAY END

//GAME LOGIC

//stores the game state in the gamestate object
const gameState = {
    funds: 0,//how much money the player has
    hour: 0,//the current in-game hour (24 hour format)
    day: 0,//the current in-game day
}

factories.makePresetFactory(1);//makes factory of type 1

for (let i = 0; i < 24; i++) {
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

    if (gameState.hour < 8) return;//all factories start working at 8

    for (let i = 0; i < factories.length; i++) {

        if (gameState.hour > (7 + factories.getHoursWorked(i))) continue;
        //if it is past working hours, the factory doesn't generate profit or have any cost

        if (factories.getWorkers(i) < factories.getMinWorkers(i)) continue;
        //if there isn't enough workers, the factory doesn't generate profit or have any cost

        gameState.funds += factoryNetProfit(i);
        //adds funds from net profit

        if ((factories.getHappiness(i) < 0.5) && (Math.random() > 0.75))
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

function factoryHappiness(index) {
    return (
        (factories.getHappiness(index) * 8) +
        (-0.5 + factories.getHourlyPay(index) * 0.1) +
        (1.8 - factories.getHoursWorked(index) * 0.1)
    ) * 0.1;
}//calculates the happiness of each factory

function factoryUnrest(index) {
    return (
        (factories.getWorkerUnrest(index) * 0.999) +
        (factories.getHoursWorked(index) > 12 ? 0.01 : 0) +
        (factories.getHappiness(index) < 0.75 ? 0.01 : 0) +
        (factories.getHourlyPay(index) < 10 ? 0.01 : 0)
    )
}//calculates the unrest in each factory

//GAME LOGIC END
