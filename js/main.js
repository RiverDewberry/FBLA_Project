import { factories } from "./factory.js";
import { upgradeData } from "./upgrades.js";
import { NewsReal } from "./newReal.js";

let captureX, captureY, captureW, captureH, overzoom;
const PUICount = (2 +1)
const VarsToChange = [10,7,8]
let SellectedFactory = -1;
let SellectedFactoryPos = -1;
let SelctedBuyType = 1;
let indent = 0;

const StatUICount = (6 +1);
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

const factoryLinks = [];
const upgradeNumbers = new Uint8Array(factories.upgradeData.names.length << 6); // creates an array of 0s for num of factorys * 64
//DISPLAY
//creating and setting up canvas
const canvas = document.getElementById("canvas")

let displayCtx = canvas.getContext("bitmaprenderer");
const display = new Worker("../js/display.js");
display.postMessage([0, canvas.width, canvas.height]);
canvasSetup();
NewsRealSetUp();

//Set up Html ellements
for (let i = 0; i < upgradeData.names.length; i++) {
    CreateUpgradeUI(i,upgradeData.names[i],IntToRomanNumeral(1),upgradeData.costs[i])
    
}
for (let i = 1; i < StatUICount; i++) {
    CreateStatUI(factories.NamesOfData[i],IntToPlaceValue(100000) + "", i)
    
}
for (let i = 1; i < PUICount; i++) {
    CreatePolicyUI(i,false);
    
}
CreatePolicyUI(PUICount,true);
//End of set up

setInterval(ScrollText,1)
setInterval(gameLogicTick,1000)

//Game VARS
const gameState = {
    funds: 10000,//how much money the player has
    Debt: -1000000,
    Goodsheld: 0,
    CostPerGood: 1,// how much each good is sold for
    Marketablity: .00001, //precent of people who will buy ur product
    hour: 8,//the current in-game hour (24 hour format)
    day: 1,//the current in-game day
    inflation: 1,//the amount of inflation, this effects all prices 
    goods: 0,//the amount of goods the player has, which they can sell for money
    HourlyProduction:0 //DOOOOO NOT USE THIS FOR CALCULATIONS THIS IS FOR UI OLNLY
}
const EconomyVars ={
    InflationRate: .03,
    ValueOfDollar: 1,
    DebtInfaltionRate: .05,
    living: 8.5, //Cost of livving calulated form ((avg monthly cost)/(avg days in month))/(hours in day)
                                                        //(6k/30.437)/24
    MinimumWage: 7,
    population:(331.9 * 1000000),//us population
    DailyPopInc: 19,
    PreferdHours: 8,
}
UpdateUI();
//END OF GAME VARS
let loadedNum = 0;


//images



const imgs = [];
const imgbmps = [];
const srcs = [
    "grass1", "grass2", "grass3", "grass4", "grass5", "boxFront", "boxBack", "factory1",
    "border","SunZenith_Gradient","ViewZenith_Gradient","ground","Road","Marketing","Gradiant","splendor128",
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
	    if(factoryAt(e.offsetX, e.offsetY) === -1)return; // exit ealy 
        
        buyFactory(factoryAt(e.offsetX, e.offsetY), SelctedBuyType);
    }
});
document.addEventListener("keydown", (e) => {
    for(let i = 1; i < 3; i++){
        if(e.key === i + ""){
            SelctedBuyType = i;
            return;
        }
    }
    
});
window.addEventListener("resize", (e) => {
    canvasSetup();
    display.postMessage([1]);
});
//Game DISPLAY END



//UI DisplayStart
//
function NewsRealSetUp(){
    let Comb = "";
    let temp =[];
    let R;
    for (let i = 0; i < NewsReal.Headlines.length; i++) {
        temp.push(i);
        
    }
    let Gap  = "";
    for (let i = 0; i < 10; i++) {
        Gap += " " ;
        
    }
    for (let i = 0; i < NewsReal.Headlines.length; i++) {
        R = Math.round(Math.random() * (temp.length -1))
        Comb = Comb+Gap +"BREAKING:" + NewsReal.Headlines[temp[R]];   
        temp.splice(R,1); 
    }
    document.getElementById("NewsReal").textContent = Comb;
    indent = 1000;
}
function ScrollText(){
    const Text = document.getElementById("NewsReal");
    indent -= 1;
    //Text.textContent = NewsReal.Headlines[0];
    Text.style.textIndent = indent+"px";
}
function UpdateUI(){
    document.getElementById("DelButon").addEventListener("click",delCurFac)
    document.getElementById("MoneyText").textContent ="Money:$" + IntToPlaceValue(gameState.funds);
    document.getElementById("FactoryCountText").textContent = "Factorys:"+ factories.length;
    document.getElementById("DebtDisplay").textContent = "Debt:"+ IntToPlaceValue(gameState.Debt);
    document.getElementById("GoodsDisplay").textContent = "UnSold Goods:" + IntToPlaceValue(gameState.goods);
    document.getElementById("ProductionDisplay").textContent = "Production:" + gameState.HourlyProduction +" per hour";
    if (gameState.hour % 24 < 12) {
        document.getElementById("TimeDisplay").textContent = (((gameState.hour -1) % 12) +1) + " AM"
    }
    else{
        document.getElementById("TimeDisplay").textContent = (((gameState.hour-1) % 12) +1) + " PM"
    }
    
    
    let Cur2;
    let holder;
    if (SellectedFactory !== -1) {
        
        
        for (let i = 0; i < PUICount; i++) {
            UpdatePolicyUI(i,factories.NamesOfData[VarsToChange[i]],factories.factoryArray.getVal(SellectedFactory,VarsToChange[i]),true);  
        }
        UpdatePolicyUI(PUICount,"Goods Price",gameState.CostPerGood + "",false);

        for (let i = 0; i < StatUICount; i++) {
            Cur2 = document.getElementById("StatsRef " + i)
            Cur2.children[0].children[0].textContent = factories.NamesOfData[i];
            Cur2.children[1].children[0].textContent = factories.factoryArray.getVal(SellectedFactory,i);
            
        }
        for (let i = 0; i < upgradeData.names.length; i++) {
            holder = document.getElementById("UpgradeRef " + i);
            holder.children[1].children[0].textContent = (IntToRomanNumeral(upgradeNumbers[SellectedFactory + i] +1) + "");
            //console.log(upgradeNumbers[SellectedFactory + i]);
            holder.children[2].textContent = "$"+ IntToPlaceValue(GetUpgradeCost(SellectedFactory,i)) + "";
            holder.children[2].name = i + "";
            holder.children[2].addEventListener("click",BULLLLL);
        }
    }
    else{
        let Cur;
        for (let i = 0; i < PUICount + 1; i++) {
            Cur = document.getElementById("PolicyHolder " + i);
            Cur.style.display = 'none';
        }
    }
}
function UpdatePolicyUI (ind,LabelName,CurValue,IsFactory){
    let Cur = document.getElementById("PolicyHolder " + ind);
    Cur.style.display = 'flex';
    Cur.children[0].textContent = LabelName
    Cur.children[1].children[1].textContent = CurValue;

    if (IsFactory) {
        Cur.children[1].children[0].id = VarsToChange[ind];
        Cur.children[1].children[0].addEventListener("click",subTofacValue);
        Cur.children[1].children[2].id = VarsToChange[ind];
        Cur.children[1].children[2].addEventListener("click",addTofacValue);
    }
    else{
        
        Cur.children[1].children[0].addEventListener("click",SubToGame);
        Cur.children[1].children[2].addEventListener("click",AddToGame);
    }

    
}
function BULLLLL(){
    upgradeFactory(SellectedFactoryPos,this.name - 0);
}

function delCurFac(){
    
    removeFactory(SellectedFactoryPos);
    SellectedFactory = -1;
    SellectedFactoryPos =-1;
}
function AddToGame(){
    gameState.CostPerGood =  gameState.CostPerGood + 1;
    UpdateUI();
}
function SubToGame(){
    gameState.CostPerGood =  gameState.CostPerGood - 1;
    UpdateUI();
}
function addTofacValue(){
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

function CreateUpgradeUI(ind,UName,UpgradeLvl,Price,) {
    const UpgradeHolder = document.getElementById("UpgradesBox");
    const UpG = document.getElementById("UpgradeRef 0");
    let clone = UpG;
    if (ind != 0) {
        clone = UpG.cloneNode(true);
    }

    clone.id = "UpgradeRef " + ind;
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
 function CreatePolicyUI(count,IsGlobal) {
    let PolicyHolder = document.getElementById("PolicyBoxHolder");
    if (IsGlobal) {
       PolicyHolder = document.getElementById("GolabalPolicyBoxHolder");
    }
   
    

    const PolicyClone = document.getElementById("PolicyHolder 0");
    let clone = PolicyClone.cloneNode(true);
    clone.id = "PolicyHolder " + count

    PolicyHolder.appendChild(clone);
}
function IntToRomanNumeral (int){
    let output = ""
    let num = int;
    let temp = int;
    const Chars = ["D" ,"C","L","X","V",'I']
    const Values = [500,100,50 ,10 ,5  ,1]
        for (let i = 0; i < Values.length; i++) {
            for (let j = 0; j <  Math.floor(temp/Values[i]); j++) {
                output += (Chars[i] + "")
                num -= Values[i];
            }
            if (Values[i] != 1) {
                if (Values[i]/Values[i+1] == 5) {
                    if ((((-num % -Values[i+1]) + num)/Values[i+1]) ==4 ) {
                       num -= Values[i] - Values[i+1];
                       output += Chars[i+1] +""+ Chars[i];
                    }
                }
            }
            
            temp = num;
        }
    return (output);
}
function IntToPlaceValue(int){
    let places = [12,9,6,3]
    let Abriv =  ["T","B","M","K"]
    for (let i = 0; i < places.length; i++) {
        if (Math.abs(int) >= Math.pow(10,places[i])) {
            return (Math.round(10 * (int/Math.pow(10,places[i])))/10)+ Abriv[i];
        } 
    }
    return int;
    
}


//UI Display ENd

//GAME LOGIC

//stores the game state in the gamestate object




function upgradeFactory(position, upgradeNum){
    let index = factoryLinks.indexOf(position);
    if(index === -1)return;
    let cost = Math.round(GetUpgradeCost(index, upgradeNum)) * (1/gameState.inflation);
    if((cost) > gameState.funds){
        return;
    }
    if (cost+ "" === "NaN") {
        console.error("Upgrade cost is NaN");
        return;
    }
    console.log(cost);
    gameState.funds =  gameState.funds -(cost);
    upgradeNumbers[(position << 6) + upgradeNum]++;

    
    for (let i = 0; i < (upgradeData.effects[upgradeNum].length /2); i++) {
        let ThingToSet = upgradeData.effects[upgradeNum][i];
        factories.factoryArray.setVal(index, ThingToSet, factories.factoryArray.getVal(index,ThingToSet) + factories.upgradeData.effects[upgradeNum][i+1]);
        i++
    }
    
}
function GetUpgradeCost(position, upgradeNum){
    if (factories.upgradeData.costs[upgradeNum] +"" === "NaN") {
        console.error("Upgrade cost is NaN  :" + upgradeNum + " :");

        return
    }
    if (upgradeNumbers[(position << 6) + upgradeNum] +"" === "NaN") {
        console.error("positon retuns NaN");
        
    }
   return factories.upgradeData.costs[upgradeNum] * Math.pow(1.15 ,(upgradeNumbers[(position << 6) + upgradeNum] +1))
}
function buyFactory(position, factoryPreset){
    if(position < 0 || position > 63) return;
    if(factoryLinks.includes(position)) {
        SellectedFactory = factoryLinks.indexOf(position);
        SellectedFactoryPos = position;
        console.log(SellectedFactory);
        UpdateUI();
        return;
    }
    if((factories.presetCosts[factoryPreset] * gameState.inflation) > gameState.funds)return;
    gameState.funds -= factories.presetCosts[factoryPreset] * gameState.inflation;
    factoryLinks.push(position);
    factories.makePresetFactory(factoryPreset);
    if (factoryPreset == 1) {
        display.postMessage([7, position, "factory" + factoryPreset]);
    }
    if (factoryPreset == 2) {
        display.postMessage([7, position, "Marketing"]);
        
    }
    
    SellectedFactory =  (factories.length -1);
    SellectedFactoryPos = position;
    UpdateUI();
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
    console.log(gameState.hour);
    display.postMessage([8]);
    UpdateUI();
    if (gameState.hour === 24) { //day end
        //increases gameState.day by 1 and sets gameState.hour to 0 when 24 hours pass
        gameState.hour = 0;
        gameState.day++;
        let GoodsSold  = Math.round(ClampMax(PeopleWhoPurcahse(gameState.CostPerGood,EconomyVars.population * gameState.Marketablity,2),gameState.goods));
        gameState.funds += GoodsSold  * gameState.CostPerGood;
        gameState.goods -=  GoodsSold;
        EconomyVars.ValueOfDollar = Math.pow((1- EconomyVars.InflationRate),1/365);
        
        //Daily stat update
        EconomyVars.population += EconomyVars.DailyPopInc;
        if ((gameState.day % 90) == 0) {
            EconomyVars.ValueOfDollar = EconomyVars.ValueOfDollar * (EconomyVars.InflationRate *.25);
            EconomyVars.MinimumWage = EconomyVars.MinimumWage * (1 +(EconomyVars.InflationRate *.25));
        }

    }

    UpdateUI();
    

    if (gameState.hour < 8 & gameState.hour < 20) return;//all factories start working at 8 and end at 20
    const PrevGoods = gameState.goods;
    for (let i = 0; i < factories.length; i++) {

        if (gameState.hour > (7 + factories.getHoursWorked(i))) continue;
        //if it is past working hours, the factory doesn't generate profit or have any cost
        if (factories.getMaxWorkers(i) > factories.getWorkers(i)) {
            if (factories.getTargetWorkerAmount(i) > factories.getWorkers(i)) {
                if (factories.getHourlyPay(i) >= EconomyVars.MinimumWage){
                    if (liveableWage(i) >= 1) {
                        factories.setWorkers(i,factories.getWorkers(i)+1)
                    }
                }
            } 
        }
        

        if (factories.getWorkers(i) < factories.getMinWorkers(i)) continue;
        //if there isn't enough workers, the factory doesn't generate profit or have any cost

        gameState.funds -= (factories.getHourlyPay(i) * factories.getWorkers(i))//pays workers

        if (factories.getFactoryType(i) == 1) {
            gameState.goods += factoryNetProfit(i);
            //the production from each factory is added to the current amount of goods
        }
        if (factories.getFactoryType(i) == 2) {
            gameState.Marketablity += MarketingAdd(i);
        }
            

        if ((factories.getHappiness(i) < 0.5) && (Math.random() > 0.75))
            factories.setWorkers(i, factories.getWorkers(i) - 1);
        //workers start to quit when happiness is too low

        factories.setHappiness(i, factoryHappiness(i));//updates happiness

        factories.setWorkerUnrest(i, factoryUnrest(i));//updates unrest
    }
    gameState.HourlyProduction = (gameState.goods -PrevGoods);
    UpdateUI();
}
function ClampMax(input,max){
    if (input > max) {
        return max;
    }
    else{
        return input;
    }
}
function PeopleWhoPurcahse (Price,MaxPeopleWhoPurchase,PrecevedValue){
    const v = (PrecevedValue/(2* Price))
    return (MaxPeopleWhoPurchase * v)/ ((Price * Price) +v)

}
function MarketingAdd (index){
   
   
   
    return factories.getProduction(index) * HapeinesMultipire(index) * .0000001;
}

function factoryNetProfit(index) {//calculates the net profit eaxh factory generates
    return (
        factories.getProduction(index) * HapeinesMultipire(index)
    ) - factories.getCost(index) //base cost and profit with happiness modifier
        +
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
function HapeinesMultipire (index){
 return (factories.getHappiness(index) > 1.25 ? 1.1 : 1);
}
function factoryHappiness(index) {
    
    const Liveibalwage = Clamp01(liveableWage(index));
    return Clamp01(Liveibalwage *((2*EconomyVars.PreferdHours/(factories.getHoursWorked(index) + EconomyVars.PreferdHours))))
    
    //old function
    //return (
    //    (factories.getHappiness(index) * 8) +
    //    (-0.5 + (factories.getHourlyPay(index) / gameState.inflation) * 0.1) +
    //    (1.8 - factories.getHoursWorked(index) * 0.1)
    //) * 0.1;
}//calculates the happiness of each factory

function factoryUnrest(index) {
    return (
        (factories.getWorkerUnrest(index) * 0.999) +
        (factories.getHoursWorked(index) > 12 ? 0.01 : 0) +
        (factories.getHappiness(index) < 0.75 ? 0.01 : 0) +
        (liveableWage(index) < .5 ? 0.01 : 0)
    )
}//calculates the unrest in each factory
function Clamp01(input){
    if (input > 1) {
        return 1;
    }
    if (input < 0) {
        return 0;
    }
    return input;
}
function liveableWage (index){
   return(   (factories.getHourlyPay(index)* factories.getHoursWorked(index))/(EconomyVars.living *24)* (1/EconomyVars.ValueOfDollar))
}

//GAME LOGIC END
