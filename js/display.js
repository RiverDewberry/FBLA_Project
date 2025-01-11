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

function canvasSetup(w, h) {
    cw = w;
    ch = h;
    setup = true;
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
    if (captureSize > 1023) captureSize = 1024;//upper bound for capture size

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

function drawScreen() {
    if (!setup) return;
    if (rendering) {
        renderRequest = true;
        return;
    }
    rendering = true;
    ctx.clearRect(0, 0, cw, ch);
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
                64 * i + 32 * ((7 - j) - i), 16 * (i - (7 - j)) + 250, 64, 64);
            drawScaledImg(imgArr[(i << 3) | j],
                64 * i + 32 * ((7 - j) - i), 16 * (i - (7 - j)) + 250, 64, 64);
            if(factoryMouseOver === (i << 3) + j)
                drawScaledImg(img.boxFront,
                64 * i + 32 * ((7 - j) - i), 16 * (i - (7 - j)) + 250, 64, 64);
        }
    }
    let resultBitmap = offscreen.transferToImageBitmap();
    postMessage(resultBitmap, [resultBitmap]);
    postMessage([captureX, captureY, captureW, captureH]);
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
    }
}
