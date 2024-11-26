import { factories } from "./factory.js";

//DISPLAY
//creating and setting up canvas
const canvas = document.getElementById("canvas")
let displayCtx = canvas.getContext("bitmaprenderer");
let offscreen;
let ctx, captureSize, ratio, centerX, centerY, captureX, captureY, captureW, captureH, captureScale;
centerX = 256;//the x position of center of the capture
centerY = 512;//the y position of the center of the capture
captureSize = 512;//the size in pixels of the width of the captured area
canvasSetup();
captureX = 0;
captureY = 512 - captureH;

//mouse tracking
let mouseIsDown = false;
let oldMouseX;
let oldMouseY;
let deltaCenterX = 0;
let deltaCenterY = 0;

//images
const grass1 = new Image();
grass1.src = "../sprites/grass1.png";
grass1.onload = (e) => {
    drawScreen();
};

function canvasSetup() {
    //this creates a new context when each 
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    displayCtx = canvas.getContext("bitmaprenderer");
    offscreen = new OffscreenCanvas(canvas.width, canvas.height);
    ctx = offscreen.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = "#FF0000";

    //controlls the area of the game that is captured by the onscreen display
    ratio = window.innerHeight / window.innerWidth;//the aspect ratio (h/w)
    captureW = Math.round(captureSize);//the width of the capture
    captureH = Math.round(captureSize * ratio);//the height of the capture
    captureX = Math.round(256 - captureSize * 0.5) + centerX - 256;
    //the x position the capture starts at
    captureY = Math.round(256 - captureSize * 0.5 * ratio) + centerY - 256;
    //the y position the capture starts at
    captureScale = canvas.width / captureSize;
    //the amount values should be scaled to allow the capture to work
}

function zoom(deltaY) {//zooms the capture area
    captureSize += 4 * Math.sign(deltaY);//adjusts the capture size when the player zooms in or out

    if (captureSize < 64) captureSize = 64;//lower bound for capture size
    if (captureSize > 512) captureSize = 512;//upper bound for capture size

    //resizes capture area
    captureW = Math.round(captureSize);
    captureH = Math.round(captureSize * ratio);

    captureScale = canvas.width / captureSize;//calculates scaling

    adjustCaptureArea();//bounds resized area

    drawScreen();
}

function moveCapture(X, Y) {
    if (!mouseIsDown) {
        oldMouseX = Math.round(X);
        oldMouseY = Math.round(Y);
        deltaCenterX = 0;
        deltaCenterY = 0;
        return;
    }

    if (oldMouseX === undefined) oldMouseX = X;
    if (oldMouseY === undefined) oldMouseY = Y;

    centerX -= deltaCenterX;
    centerY -= deltaCenterY;

    deltaCenterX = -Math.round((X - oldMouseX) / captureScale);
    deltaCenterY = -Math.round((Y - oldMouseY) / captureScale);

    centerX += deltaCenterX;
    centerY += deltaCenterY;

    adjustCaptureArea();

    drawScreen();
}

function adjustCaptureArea() {
    captureX = Math.round(256 - captureSize * 0.5) + centerX - 256;
    captureY = Math.round(256 - captureSize * 0.5 * ratio) + centerY - 256;

    if (captureX < 0) captureX = 0;
    if (captureY < 0) captureY = 0;
    if (captureX + captureW >= 512) captureX = 512 - captureW;
    if (captureY + captureH >= 512) captureY = 512 - captureH;

    if ((centerX - (captureW * 0.5)) < 0) centerX = 0 + captureW * 0.5;
    if ((centerY - (captureH * 0.5)) < 0) centerY = 0 + captureH * 0.5;
    if ((centerX + (captureW * 0.5)) >= 512) centerX = 512 - captureW * 0.5;
    if ((centerY + (captureH * 0.5)) >= 512) centerY = 512 - captureH * 0.5;
}


function drawScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            drawScaledImg(grass1, 64 * i + 32 * ((7 - j) - i), 16 * (i - (7 - j)) + 336, 64, 64);
        }
    }
    displayCtx.transferFromImageBitmap(offscreen.transferToImageBitmap());
}

function drawScaledImg(img, x, y, w, h) {
    ctx.drawImage(
        img,
        (x - captureX) * captureScale,
        (y - captureY) * captureScale,
        w * captureScale,
        h * captureScale
    );
}//draws a properly scaled image

//events
canvas.addEventListener("wheel", (e) => {
	e.preventDefault();
	zoom(e.deltaY);
});
canvas.addEventListener("mousemove", (e) => {moveCapture(e.offsetX, e.offsetY);});
canvas.addEventListener("mousedown", (e) => { mouseIsDown = true; });
canvas.addEventListener("mouseup", (e) => { mouseIsDown = false; });
window.addEventListener("resize", (e) => {
    canvasSetup();
    adjustCaptureArea();
    drawScreen();
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
