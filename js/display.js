let ctx, captureSize, ratio, centerX, centerY, captureX, captureY, captureW, captureH, captureScale;
let setup = false;
centerX = 256;//the x position of center of the capture
centerY = 512;//the y position of the center of the capture
captureSize = 1024;//the size in pixels of the width of the captured area
captureX = 0;
captureY = 512 - captureH;
let cw, ch;

//mouse tracking
let mouseIsDown = false;
let oldMouseX;
let oldMouseY;
let deltaCenterX = 0;
let deltaCenterY = 0;

let img = {};//stores images
let imgArr = [];

let factoryMouseOver = -1;//the factory that the mouse is over

let rendering = false;
let renderRequest = false;
let FramesRenderd = 8;

const Scale = 1;
const BackWidth =256 *Scale;
const BackHight =128 *Scale;
let   CloudX = [120,4,64]
let   CloudY = [12,98,55]
let   CloudSpeed = [1,1,1]
const Backround = new OffscreenCanvas(BackWidth,BackHight)
let ZenithAng = [];
let SR = [];

let RenderBack;
const LookUpWidth =(256 * 256);
const LookUpTexture = new OffscreenCanvas(LookUpWidth,255);
const LookUpTextureCtx = LookUpTexture.getContext('2d');
let LutData = [];



function canvasSetup(w, h) {
    cw = w;
    ch = h;
    setup = true;
    RenderBack = true;
    //this creates a new context when each 
    offscreen = new OffscreenCanvas(w, h);
    ctx = offscreen.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = "#FF0000";
    

    //controlls the area of the game that is captured by the onscreen display
    ratio = h / w;//the aspect ratio (h/w)
    captureW = Math.round(captureSize);//the width of the capture
    captureH = Math.round(captureSize * ratio);//the height of the capture
    captureX = Math.round(256 - captureSize * 0.5) + centerX - 256;
    //the x position the capture starts at
    captureY = Math.round(256 - captureSize * 0.5 * ratio) + centerY - 256;
    //the y position the capture starts at
    captureScale = w / captureSize;
    //the amount values should be scaled to allow the capture to work
    adjustCaptureArea();
    
}

function zoom(deltaY) {//zooms the capture area
    captureSize += 3 * Math.sign(deltaY);//adjusts the capture size when the player zooms in or out

    if (captureSize < 63) captureSize = 64;//lower bound for capture size
    if (captureSize > 959) captureSize = 960;//upper bound for capture size

    //resizes capture area
    captureW = Math.round(captureSize);
    captureH = Math.round(captureSize * ratio);

    captureScale = cw / captureSize;//calculates scaling

    adjustCaptureArea();//bounds resized area

    factoryAt(oldMouseX, oldMouseY);

    
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

    if (deltaCenterX === -Math.round((X - oldMouseX) / captureScale) &&
        deltaCenterY === -Math.round((Y - oldMouseY) / captureScale)) return;

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

    if (captureX < -256) captureX = -256;
    if (captureY < 0) captureY = 0;
    if (captureX + captureW >= 768) captureX = 768 - captureW;
    if (captureY + captureH >= 512) captureY = 512 - captureH;

    if ((centerX - (captureW * 0.5)) < -256) centerX = -256 + captureW * 0.5;
    if ((centerY - (captureH * 0.5)) < 0) centerY = 0 + captureH * 0.5;
    if ((centerX + (captureW * 0.5)) >= 768) centerX = 768 - captureW * 0.5;
    if ((centerY + (captureH * 0.5)) >= 512) centerY = 512 - captureH * 0.5;
}

function factoryAt(x, y) {
    x = Math.round(x * captureW / cw + captureX);
    y = Math.round(y * captureH / ch + captureY);

    let yOff;
    let xOff;

    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            yOff = Math.abs(y - (16 * (i - (7 - j)) + 297));
            xOff = Math.abs(x - (64 * i + 32 * ((7 - j) - i) + 31.5));
            if (xOff + (yOff << 1) < 31) {
                factoryMouseOver = (i << 3) + j;
                return;
            }
        }
    }
    factoryMouseOver = -1;
};



///NOT CURSED CODE LAND I SWEAR
function CreatLookUpTexture(){
    ImgToData();
    const ImgData = LookUpTextureCtx.createImageData(LookUpWidth,255);
    const PalateData = LutData.data;
    for (let x = 0; x < (LookUpWidth); x++) {
        for (let y = 0; y < 256; y++) {
            let curColor = [x % 255,Math.floor(x/255),y,255];
            
            let BestDist = 10000000000;
            let besti = 0;
           for (let i = 0; i < 50; i++) {
                let d = ColorDist(curColor[0],curColor[1],curColor[2],PalateData[4*i],PalateData[(i*4)+1],PalateData[(i*4)+2]);
                if (d <= BestDist) {
                    BestDist = d;
                    besti = i;
                }
           }
            setPixel(ImgData,x,y,PalateData[besti*4],PalateData[(besti*4)+1],PalateData[(besti*4)+2],255);
            
        }
    }
    LookUpTexture.getContext('2d').putImageData(ImgData,0,0);
    
}
function ColorDist(R1,G1,B1,R2,G2,B2){
    return Math.sqrt(Math.pow(R1-R2,2)+Math.pow(G1-G2,2)+Math.pow(B1-B2,2))

}
function ImgToData(){
    const width =50;
    const TempCanvas2 = new OffscreenCanvas(width,1);
    const TempCtx2 = TempCanvas2.getContext('2d');
    TempCtx2.drawImage(img.Gradiant,0,0,width,1);
    LutData = TempCanvas2.getContext('2d').getImageData(0,0,width,1);
    
}
function CreateBacroundImg(){
    
    if (RenderBack == true) {
        while (CloudX.length < 100) {
            CloudX.push(Math.round(Math.random()* BackWidth +100) - 50);
            CloudY.push(Math.round(Math.random()* BackHight));
            CloudSpeed.push((Math.random() *.5)+ .5);
        }
        for (let i = 0; i < CloudX.length; i++) {
            CloudX[i] -= CloudSpeed[i] * ((((CloudY[i]+1)/BackHight)*.5) +.5)
            if (CloudX[i] <= -50) {
                CloudX[i] = BackWidth +50;
                CloudY[i] = Math.round(Math.random()* BackHight);
                CloudSpeed[i] = (Math.random()* .5) +.5
            }
        } 
    }
   
    AvgSpeeds();
    let d =0;
    const ImgDat = Backround.getContext('2d').createImageData(BackWidth,BackHight);
    const Range = (.7 * BackWidth * (1/CloudX.length));
    const TSpeed = 12
    let XReadTime = 0;
    let Yrand = 0;
    for (let x = 0; x < BackWidth; x++) {
        for (let y = 0; y < BackHight; y++) {
            
            //XReadTime = Math.round(120*((-.5 * Math.cos((3.141/24) * (FramesRenderd ))) + .5)) + Math.round(Math.abs(y-BackHight)/24) ;
            XReadTime = Math.round(120 * HoursSinFuntion(FramesRenderd)) +  Math.round(Math.abs(y-BackHight)/24)
            Yrand += Math.round(Math.random() *.5);
            d = AvgDist(x,y * 1.5);
            Rd = Math.round(Math.log10(((.3* d) +1))* 2 * 255)


            if (Rd > 255) {Rd = 255;}
            if (d >  Range) {
                // clouds and stuff
                setPixel(ImgDat,x,y,235,235,235,255);
                if( Math.round(d ) ==3){
                    setPixel(ImgDat,x,y,235 -(Rd*.2),235 -(Rd*.2),235-(Rd*.2),255);
                }
                if (y != 0) {
                    if (getPixelValue(ImgDat,x,y-1,"A") == 254) {
                        setPixel(ImgDat,x,y,255,255,254,255)
                    }
                }
            }

            else{
                //set blue sky
                SR= getPixelValue(ZenithAng,XReadTime,Yrand % 4);
                              
                
                setPixel(ImgDat,x,y,SR[0],SR[1] ,SR[2] ,254);
                if (y != 0) {
                    if (getPixelValue(ImgDat,x,y-1,"A") == 255) {
                        setPixel(ImgDat,x,y-1,100,100,100,254)
                    }
                }
                
            } 
            
        }
    }
    RenderBack = false;
    Backround.getContext('2d').putImageData(ImgDat,0,0);

}
function ZenithImgCreation (){
    const TempCanvas = new OffscreenCanvas(128,4);
    const TempCtx = TempCanvas.getContext('2d');
    TempCtx.drawImage(img.SunZenith_Gradient,0,0,128,4);
    ZenithAng = TempCanvas.getContext('2d').getImageData(0,0,128,4); 
    
}

function blurCanvas(offscreenCanvas, blurAmount) {
    const ctx = offscreenCanvas.getContext('2d');
    const width = offscreenCanvas.width;
    const height = offscreenCanvas.height;
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    const weights = [];
    const kernelSize = Math.floor(blurAmount * 2) + 1;
    const halfKernelSize = Math.floor(kernelSize / 2);
    const sigma = blurAmount / 3;
    const sigma2 = sigma * sigma;
    const sigma2x2 = 2 * sigma2;
    const sqrtSigmaPi2 = Math.sqrt(Math.PI * sigma2);
    let sum = 0;

    for (let i = -halfKernelSize; i <= halfKernelSize; i++) {
        const weight = Math.exp(-0.5 * (i * i) / sigma2) / sqrtSigmaPi2;
        weights.push(weight);
        sum += weight;
    }

    for (let i = 0; i < weights.length; i++) {
        weights[i] /= sum;
    }

    const applyKernel = (data, width, height, weights, kernelSize) => {
        const halfKernelSize = Math.floor(kernelSize / 2);
        const output = new Uint8ClampedArray(data.length);

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let r = 0, g = 0, b = 0, a = 0;
                for (let ky = -halfKernelSize; ky <= halfKernelSize; ky++) {
                    for (let kx = -halfKernelSize; kx <= halfKernelSize; kx++) {
                        const weight = weights[ky + halfKernelSize] * weights[kx + halfKernelSize];
                        const ix = Math.min(width - 1, Math.max(0, x + kx));
                        const iy = Math.min(height - 1, Math.max(0, y + ky));
                        const index = (iy * width + ix) * 4;
                        r += data[index] * weight;
                        g += data[index + 1] * weight;
                        b += data[index + 2] * weight;
                        a += data[index + 3] * weight;
                    }
                }
                const index = (y * width + x) * 4;
                output[index] = r;
                output[index + 1] = g;
                output[index + 2] = b;
                output[index + 3] = a;
            }
        }

        return output;
    };

    const blurredData = applyKernel(data, width, height, weights, kernelSize);
    ctx.putImageData(new ImageData(blurredData, width, height), 0, 0);
}
function getPixelValue(imageData, x, y, channel) {
    const index = ((y * imageData.width) + x) * 4;
    switch (channel) {
        case 'R':
            return imageData.data[index];
        case 'G':
            return imageData.data[index + 1];
        case 'B':
            return imageData.data[index + 2];
        case 'A':
            return imageData.data[index + 3];
        default:
            throw new Error('Invalid channel. Use "R", "G", "B", or "A".');
    }
}
function getPixelValue(imgDat,x,y){
    const index = ((y * imgDat.width) + x) * 4;
    return [imgDat.data[index],imgDat.data[index + 1],imgDat.data[index + 2],imgDat.data[index + 3]];
}
function AvgSpeeds(){
    for (let i = 0; i < CloudSpeed.length; i++) {
        for (let j = 0; j < CloudSpeed.length; j++) {
            if (i != j) {
                CloudSpeed[i]= (CloudSpeed[i])+ ((CloudSpeed[j]-CloudSpeed[i]) * 1/(dist(CloudX[i],CloudY[i],CloudX[j],CloudY[j])+1))
            }
            
            
        }  
    }

}
// Function to write to a specific pixel on the canvas
function setPixel(imageData, x, y, r, g, b, a) {
    const index = (y * imageData.width + x) * 4;
    imageData.data[index] = r;
    imageData.data[index + 1] = g;
    imageData.data[index + 2] = b;
    imageData.data[index + 3] = a;
}
function AvgDist (x,y){
    let avg = 0; 
    const L = CloudX.length;
    for (let i = 1; i < L; i++) {
        let Zratio =(BackHight * 1.5)/(((CloudY[i]+1))+BackHight)
        avg += 1/(dist(x,y,CloudX[i],CloudY[i]*Zratio)+1);  
    }
    return avg;
}
function dist(x,y,x2,y2){
        const dx = x - x2;
        const dy = y - y2;
        return Math.sqrt(dx * dx + dy * dy);
}
function HoursSinFuntion(input){
    return (-.5 * Math.cos(.261799387799 * input)) +.5
}

function drawScreen() {
    if (!setup) return;
    if (rendering) { // if not rending dont do anything else
        renderRequest = true;
        return;
    }
    rendering = true;
    
    ctx.clearRect(0, 0, cw, ch);
    if(FramesRenderd == 8){
 //       CreatLookUpTexture();
         ImgToData();
    }
    ZenithImgCreation();
   
    CreateBacroundImg(); // genreat backround img
    blurCanvas(Backround,4);
    
   
    //drawScaledImg(img.Road, -62, 81, 630, 630);
    drawScaledImg(img.ground, -64, 137, 640, 512);

    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            
            drawScaledImg(img.border,
                64 * i + 32 * ((7 - j) - i), 16 * (i - (7 - j)) + 250, 64, 64);
        }
    }
    
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            if(factoryMouseOver === (i << 3) + j)
                drawScaledImg(img.boxBack,
                64 * i + 32 * ((7 - j) - i), 
                16 * (i - (7 - j)) + 250, 
                64, 
                64);
            drawScaledImg(imgArr[(i << 3) | j],
                64 * i + 32 * ((7 - j) - i), 
                16 * (i - (7 - j)) + 250, 
                64, 
                64);
            if(factoryMouseOver === (i << 3) + j)
                drawScaledImg(img.boxFront,
                64 * i + 32 * ((7 - j) - i), 
                16 * (i - (7 - j)) + 250, 
                64, 
                64);
        }
    }

    DrawOver( .5 * HoursSinFuntion(FramesRenderd + 12));
    ctx.globalCompositeOperation = "destination-over";
    drawScaledImg(Backround,-255,-15,BackWidth*(4/Scale) ,BackHight*(4/Scale))// draw it
    ctx.globalCompositeOperation = "source-over";
//    DoGradiant();
    doGradient();

    let resultBitmap = offscreen.transferToImageBitmap();
    postMessage(resultBitmap, [resultBitmap]);
    postMessage([captureX, captureY, captureW, captureH]);
}

let paletteIOMap = [];//arrays in javascript are actually hash maps, so the way that is used isn't actually that cursed
function doGradient(){
    const PalateData = LutData.data;
    const BigData = ctx.getImageData(0,0,offscreen.width,offscreen.height);
    let CurData = [0,0,0,0];
    for (let x = 0; x < offscreen.width; x++) {
        for (let y = 0; y < offscreen.height; y++) {

            curData = getPixelValue(BigData,x,y);
            let besti = paletteIOMap[(((curData[2] << 8) + curData[1]) << 8) + curData[0]];
	    if(besti === undefined){
                besti = 0;
		let BestDist = 10000000000;
                for (let i = 0; i < 50; i++) {
                    let d = ColorDist(curData[0],curData[1],curData[2],PalateData[4*i],PalateData[(i*4)+1],PalateData[(i*4)+2]);
                    if (d <= BestDist) {
                        BestDist = d;
                        besti = i;
                    }
                }
		paletteIOMap[(((curData[2] << 8) + curData[1]) << 8) + curData[0]] = besti;
	    }
	    
	    setPixel(BigData, x, y, PalateData[4*besti], PalateData[(besti*4)+1], PalateData[(besti*4)+2], curData[3]);

        }
    }
    ctx.putImageData(BigData,0,0);
}
function GetLutvalue(Dat,R,G,B){
    const x = R + (G * 255);
    const y = B
    return getPixelValue(Dat,x,y);
}

function DrawOver(amount){
    ctx.globalCompositeOperation = "source-atop";
    ctx.fillStyle = "rgba(0, 0, 0,"+(amount)+")";
    ctx.fillRect(0, 0,offscreen.width , offscreen.height);
    ctx.globalCompositeOperation = "source-over";
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

onmessage = (e) => {
    switch (e.data[0]) {
        case 0:
            canvasSetup(e.data[1], e.data[2]);
            
            break;
        case 1:
            drawScreen();
            break;
        case 2:
            zoom(e.data[1]);
            break;
        case 3:
            mouseIsDown = e.data[1];
            break;
        case 4:
            let oldPos = factoryMouseOver;
            moveCapture(e.data[1], e.data[2]);
            factoryAt(e.data[1], e.data[2]);
            if(oldPos !== factoryMouseOver)drawScreen();
            break;
        case 5:
            for (let i = 0; i < e.data[3]; i++) {
                img["" + e.data[1][i]] = e.data[2][i];
            }

            for(let i = 0; i < 64; i++) {
                imgArr[i] = img["grass" + (1 + Math.floor(Math.random() * 5))];
	        }
            break;
        case 6:
            rendering = false;
            if (renderRequest) {
                renderRequest = false;
                drawScreen();
            }
            break;
	    case 7:
            imgArr[e.data[1]] = img["" + e.data[2]];
            drawScreen();
            break;
        default:
            break;
        case 8:
            FramesRenderd = FramesRenderd +1 ;
            console.log(FramesRenderd)
            RenderBack = true;
            drawScreen();

        break;
    }
}
