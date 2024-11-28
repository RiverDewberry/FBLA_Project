let ctx, captureSize, ratio, centerX, centerY, captureX, captureY, captureW, captureH, captureScale;
let setup = false;
centerX = 256;//the x position of center of the capture
centerY = 512;//the y position of the center of the capture
captureSize = 512;//the size in pixels of the width of the captured area
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
    ratio = h/w;//the aspect ratio (h/w)
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
    if (captureSize > 511) captureSize = 512;//upper bound for capture size

    //resizes capture area
    captureW = Math.round(captureSize);
    captureH = Math.round(captureSize * ratio);

    captureScale = cw / captureSize;//calculates scaling

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

    if(deltaCenterX === -Math.round((X - oldMouseX) / captureScale) && 
	    deltaCenterY === -Math.round((Y - oldMouseY) / captureScale))return;

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
    if(!setup)return;
    if(rendering){ 
        renderRequest = true;
        return;
    }
    rendering = true;
    ctx.clearRect(0, 0, cw, ch);
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            drawScaledImg(
                img.grass1, 64 * i + 32 * ((7 - j) - i), 16 * (i - (7 - j)) + 336, 64, 64
	    );
        }
    }
    let resultBitmap = offscreen.transferToImageBitmap();
    postMessage(resultBitmap, [resultBitmap]);
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
	switch(e.data[0]) {
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
			moveCapture(e.data[1], e.data[2]);
			break;
		case 5:
			img["" + e.data[1]] = e.data[2];
			break;
		case 6:
			rendering = false;
			if(renderRequest) {
				renderRequest = false;
				drawScreen();
			}
			break;
		default:
			break;
	}
}
