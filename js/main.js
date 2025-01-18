import { factories } from "./factory.js";
import { upgradeData } from "./upgrades.js";
import { NewsReal } from "./newReal.js";

let captureX, captureY, captureW, captureH, overzoom;
const PUICount = (1 +1)
const VarsToChange = [10,7]
let SellectedFactory = -1;
let SellectedFactoryPos = -1;
let indent = 0;
const StatUICount = (5 +1);
function factoryAt(x, y) {
    x = Math.round(x * captureW / canvas.width + captureX);
    y = Math.round(y * captureH / canvas.height + captureY);

    let yOff;
    let xOff;

    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            yOff = Math.abs(y - (16 * (i - (7 - j)) + 297));
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
NewsRealSetUp();
for (let i = 0; i < upgradeData.names.length; i++) {
    CreateUpgradeUI(upgradeData.names[i],IntToRomanNumeral(21),upgradeData.costs)
    
}
for (let i = 1; i < StatUICount; i++) {
    CreateStatUI(factories.NamesOfData[i],IntToPlaceValue(100000) + "", i)
    
}
for (let i = 1; i < PUICount; i++) {
    CreatePolicyUI(i);
    
}
setInterval(ScrollText,1)
setInterval(gameLogicTick,1000)
//Game VARS
const gameState = {
    funds: 10000,//how much money the player has
    hour: 8,//the current in-game hour (24 hour format)
    day: 0,//the current in-game day
}
//END OF GAME VARS
let loadedNum = 0;


//images



const imgs = [];
const imgbmps = [];
const srcs = [
    "grass1", "grass2", "grass3", "grass4", "grass5", "boxFront", "boxBack", "factory1",
    "border","SunZenith_Gradient","ViewZenith_Gradient",
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
function NewsRealSetUp(){
    let Comb = "";
    let temp =[];
    let R;
    for (let i = 0; i < NewsReal.Headlines.length; i++) {
        temp.push(i);
        
    }
    for (let i = 0; i < NewsReal.Headlines.length; i++) {
        R = Math.round(Math.random() * (temp.length -1))
        Comb = Comb +"________" + NewsReal.Headlines[temp[R]];   
        temp.splice(R,1); 
    }
    document.getElementById("NewsReal").textContent = Comb;
    indent = Comb.length * 10;
}
function ScrollText(){
    const Text = document.getElementById("NewsReal");
    indent -= 1.5;
    //Text.textContent = NewsReal.Headlines[0];
    Text.style.textIndent = indent+"px";
}
function UpdateUI(){
    document.getElementById("DelButon").addEventListener("click",delCurFac)
    document.getElementById("MoneyText").textContent ="Money:$" + gameState.funds;
    document.getElementById("FactoryCountText").textContent = "Factorys:"+ factories.length;
    
    let Cur;
    if (SellectedFactory !== -1) {
        
        
        for (let i = 0; i < PUICount; i++) {
            Cur = document.getElementById("PolicyHolder " + i);
            Cur.style.display = 'flex';
            Cur.children[0].textContent = factories.NamesOfData[VarsToChange[i]]
            Cur.children[1].children[0].id = VarsToChange[i];
            Cur.children[1].children[0].addEventListener("click",subTofacValue);
            Cur.children[1].children[1].textContent = factories.factoryArray.getVal(SellectedFactory,VarsToChange[i]);
            Cur.children[1].children[2].id = VarsToChange[i];
            Cur.children[1].children[2].addEventListener("click",addTofacValue);
        }
    }
    else{
        for (let i = 0; i < PUICount; i++) {
            Cur = document.getElementById("PolicyHolder " + i);
            Cur.style.display = 'none';
        }
    }
    let Cur2;
    for (let i = 0; i < StatUICount; i++) {
        Cur2 = document.getElementById("StatsRef " + i)
        Cur2.children[0].children[0].textContent = factories.NamesOfData[i];
        Cur2.children[1].children[0].textContent = factories.factoryArray.getVal(SellectedFactory,i);
        
    }
    
}

function delCurFac(){
    console.log("stuff");
    removeFactory(SellectedFactoryPos);
    SellectedFactory = -1;
    SellectedFactoryPos =-1;
}
function addTofacValue(item){
    factories.factoryArray.setVal(SellectedFactory,this.id,factories.factoryArray.getVal(SellectedFactory,this.id) +1);
    UpdateUI();
}
function subTofacValue(){
    factories.factoryArray.setVal(SellectedFactory,this.id,factories.factoryArray.getVal(SellectedFactory,this.id) -1);
    UpdateUI();
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
	if(factoryAt(e.offsetX, e.offsetY) === -1)return;
        buyFactory(factoryAt(e.offsetX, e.offsetY), 1);
    }
});
window.addEventListener("resize", (e) => {
    canvasSetup();
    display.postMessage([1]);
});
//Game DISPLAY END



//UI DisplayStart
function CreateUpgradeUI(UName,UpgradeLvl,Price,) {
    const UpgradeHolder = document.getElementById("UpgradesBox");
    const UpG = document.getElementById("UpgradeRef");
    let clone = UpG.cloneNode(true);

    clone.id = UName;
    clone.children[0].children[0].textContent = UName + "";
    clone.children[1].children[0].textContent = UpgradeLvl + "";
    clone.children[2].textContent = "$"+ Price + "";
    UpgradeHolder.appendChild(clone);
    
}  
function CreateStatUI(SName,Stat,ind) {
    const UpgradeHolder = document.getElementById("StatsBox");
    const UpG = document.getElementById("StatsRef 0");
    let clone = UpG.cloneNode(true);

    clone.id = "StatsRef " + ind;
    clone.children[0].children[0].textContent = SName + "";
    clone.children[1].children[0].textContent = Stat + "";
    UpgradeHolder.appendChild(clone);
    
}
 function CreatePolicyUI(count) {
    const PolicyHolder = document.getElementById("SideBarLeft");
    const PolicyClone = document.getElementById("PolicyHolder 0");
    let clone = PolicyClone.cloneNode(true);
    clone.id = "PolicyHolder " + count

    PolicyHolder.appendChild(clone);
}
function IntToRomanNumeral (int){
    let output = ""
    let num = int;
    let temp = int;
    for (let i = 0; i < Math.floor(temp/500); i++) {
        output += "D" ;
        num -=500;  
    }
    temp = num;
    for (let i = 0; i < Math.floor(temp/100); i++) {
        output += "C" ;
        num -=100;  
    }
    temp = num;
    for (let i = 0; i < Math.floor(temp/50); i++) {
        output += "L" ;
        num -=50;  
    }
    temp = num;
    for (let i = 0; i < Math.floor(temp/10); i++) {
        output += "X" ;
        num -=10;  
    }
    temp = num;
    for (let i = 0; i < Math.floor(temp/5); i++) {
        output += "V" ;
        num -=5;  
    }
    temp = num;
    for (let i = 0; i < Math.floor(temp/1); i++) {
        output += "I" ;
        num -=1;  
    }
    temp = num
    return (output);
}
function IntToPlaceValue(int){
    let places = [12,9,6,3]
    let Abriv =  ["T","B","M","K"]
    for (let i = 0; i < places.length; i++) {
        if (int >= Math.pow(10,places[i])) {
            return (int/Math.pow(10,places[i]))+ Abriv[i];
        } 
    }
    return int;
    
}


//UI Display ENd

//GAME LOGIC

//stores the game state in the gamestate object


const factoryLinks = [];
const upgradeNumbers = new Uint8Array(factories.upgradeData.names.length << 6);

function upgradeFactory(position, upgradeNum){
    let index = factoryLinks.indexOf(position);
    if(index === -1)return;
    let cost = factories.upgradeData.costs[upgradeNum] * (1.15 ** upgradeNumbers[
        (position << 6) + upgradenum
    ]);
    if(cost > gameState.funds)return;
    gameState.funds -= cost;
    upgradeNumbers[(position << 6) + upgradeNum]++;
    
    for(let i = 0; i < 10; i++){
        factories.factoryArray.setVal(
            index, 1, factories.upgradeData.effects[upgradeNum][i]
	);
    }
}

function buyFactory(position, factory){
    if(position < 0 || position > 63) return;
    if(factoryLinks.includes(position)) {
        SellectedFactory = factoryLinks.indexOf(position);
        SellectedFactoryPos =position;
        console.log(SellectedFactory);
        return;
    }
    if(factories.presetCosts[factory] > gameState.funds)return;
    gameState.funds -= factories.presetCosts[factory];
    factoryLinks.push(position);
    factories.makePresetFactory(factory);
    display.postMessage([7, position, "factory" + factory]);
    SellectedFactory ==  factories.length;
    SellectedFactoryPos = position;
}

function removeFactory(position) {
    if(position < 0 || position > 63)return;
    
    if(factoryLinks.includes(position) === false)return;
    let index = factoryLinks.indexOf(position);
    factoryLinks.splice(index, 1);
    display.postMessage([7, position, "grass" + Math.floor(Math.random() * 5 + 1)]);
    factories.removeFactory(index);
    for(let i = 0; i < factories.upgradeData.names.length; i++) {
        upgradeNumbers[(position << 6) + i] = 0;
    }
}

function gameLogicTick() {

    gameState.hour++;//increases time by 1
    display.postMessage([8]);
    UpdateUI();
    if (gameState.hour === 24) {
        //increases gameState.day by 1 and sets gameState.hour to 0 when 24 hours pass
        gameState.hour = 0;
        gameState.day++;
    }

    
    UpdateUI();
    display.postMessage([8]);

    if (gameState.hour < 8 & gameState.hour < 20) return;//all factories start working at 8 and end at 20

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

    UpdateUI();
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
