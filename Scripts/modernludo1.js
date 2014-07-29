window.onload = init;
window.onresize = resizeboard;
var maindiv;
var canvas = null, ctx = null, dicecanvas = null, dicectx = null, upcanvas = null, upctx = null;

CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    this.beginPath();
    this.moveTo(x + r, y);
    this.arcTo(x + w, y, x + w, y + h, r);
    this.arcTo(x + w, y + h, x, y + h, r);
    this.arcTo(x, y + h, x, y, r);
    this.arcTo(x, y, x + w, y, r);
    this.closePath();
    return this;
}
function init() {
    initPlayGround();
}
function initPlayGround() {
    document.getElementById("playGround").style.display = "";
    maindiv = document.getElementById("main");
    canvas = document.getElementById("gameboard");
    ctx = canvas.getContext("2d");

    ctx.font = "20px helvetica"
    ctx.globalAlpha = 1.0;
    canvas.setStyle = function (styleMap) {
        var styleString = new String();
        for (i in styleMap) {
            styleString += i + ':' + styleMap[i] + '; ';
        }
        canvas.setAttribute('style', styleString);
    }
    var canvasStyle = {
        'background': '#00aaff',
        'border': '1px solid grey'
    };
    canvas.setStyle(canvasStyle);

    upcanvas = document.getElementById("playboard");

    upctx = upcanvas.getContext("2d");
    upcanvas.setStyle = function (styleMap) {
        var styleString = new String();
        for (i in styleMap) {
            styleString += i + ':' + styleMap[i] + '; ';
        }
        upcanvas.setAttribute('style', styleString);
    }
    var canvasStyle = {
        'border': '1px solid grey'
    };

    upcanvas.setStyle(canvasStyle);
    dicecanvas = document.getElementById("dice");
    dicectx = dicecanvas.getContext("2d");
    drawTheBoard();
    placeDefaultPlanes("red");
    placeDefaultPlanes("yellow");
    placeDefaultPlanes("blue");
    placeDefaultPlanes("green");
}
function drawTheBoard() {
    refreshBoard();
    drawSkyGradient();
    var boardmap = createMap();
    for (var x = 0; x < 15; x++) {
        for (var y = 0; y < 15; y++) {
            switch (boardmap[y][x]) {
                case 0: break;
                case 1: ctx.putImageData(drawARegularTile("blue", tileWidth), tileWidth / 2 + tileWidth * x, tileWidth / 2 + tileWidth * y); break;
                case 2: ctx.putImageData(drawARegularTile("green", tileWidth), tileWidth / 2 + tileWidth * x, tileWidth / 2 + tileWidth * y); break;
                case 3: ctx.putImageData(drawARegularTile("red", tileWidth), tileWidth / 2 + tileWidth * x, tileWidth / 2 + tileWidth * y); break;
                case 4: ctx.putImageData(drawARegularTile("yellow", tileWidth), tileWidth / 2 + tileWidth * x, tileWidth / 2 + tileWidth * y); break;
                case 10: ctx.putImageData(drawArrow("up", tileWidth), tileWidth / 2 + tileWidth * x, tileWidth / 2 + tileWidth * y); break;
                case 20: ctx.putImageData(drawArrow("right", tileWidth), tileWidth / 2 + tileWidth * x, tileWidth / 2 + tileWidth * y); break;
                case 30: ctx.putImageData(drawArrow("down", tileWidth), tileWidth / 2 + tileWidth * x, tileWidth / 2 + tileWidth * y); break;
                case 40: ctx.putImageData(drawArrow("left", tileWidth), tileWidth / 2 + tileWidth * x, tileWidth / 2 + tileWidth * y); break;
                case 5: ctx.putImageData(drawTwoColorTile("ry", tileWidth, true), tileWidth / 2 + tileWidth * x, tileWidth / 2 + tileWidth * y); break;
                case 6: ctx.putImageData(drawTwoColorTile("yb", tileWidth, true), tileWidth / 2 + tileWidth * x, tileWidth / 2 + tileWidth * y); break;
                case 7: ctx.putImageData(drawTwoColorTile("rg", tileWidth, true), tileWidth / 2 + tileWidth * x, tileWidth / 2 + tileWidth * y); break;
                case 8: ctx.putImageData(drawTwoColorTile("gb", tileWidth, true), tileWidth / 2 + tileWidth * x, tileWidth / 2 + tileWidth * y); break;
                case 9: ctx.putImageData(drawCenterTile(tileWidth), tileWidth / 2 + tileWidth * x, tileWidth / 2 + tileWidth * y); break;
                case 50: ctx.putImageData(drawTwoColorTile("ry", tileWidth, false), tileWidth / 2 + tileWidth * x, tileWidth / 2 + tileWidth * y); break;
                case 60: ctx.putImageData(drawTwoColorTile("yb", tileWidth, false), tileWidth / 2 + tileWidth * x, tileWidth / 2 + tileWidth * y); break;
                case 70: ctx.putImageData(drawTwoColorTile("rg", tileWidth, false), tileWidth / 2 + tileWidth * x, tileWidth / 2 + tileWidth * y); break;
                case 80: ctx.putImageData(drawTwoColorTile("gb", tileWidth, false), tileWidth / 2 + tileWidth * x, tileWidth / 2 + tileWidth * y); break;
                default: break;
            }
        }
    }
    drawAirPort("red", tileWidth * 2.5, tileWidth * 2.5);
    ctx.translate(tileWidth * 13.5, tileWidth * 2.5)
    ctx.rotate(90 * Math.PI / 180);
    drawAirPort("yellow", 0, 0);
    ctx.translate(tileWidth * 11, tileWidth * 11)
    ctx.rotate(180 * Math.PI / 180);
    drawAirPort("green", 0, 0);
    ctx.restore();
    ctx.rotate(360 * Math.PI / 180);
    ctx.translate(0, tileWidth * 11)
    ctx.rotate(270 * Math.PI / 180);
    drawAirPort("blue", 0, 0);
    ctx.restore();
}
function createMap() {
    var mapxy = new Array();
    //notile:0, blue:1,green:2,red:3,yello:4;
    mapxy.push([0, 0, 0, 0, 1, 2, 3, 4, 1, 2, 3, 0, 0, 0, 0]);
    mapxy.push([0, 0, 0, 0, 4, 0, 0, 4, 0, 0, 4, 0, 0, 0, 0]);
    mapxy.push([0, 0, 0, 0, 3, 0, 0, 4, 0, 0, 1, 0, 0, 0, 0]);
    mapxy.push([0, 0, 0, 0, 2, 20, 20, 4, 20, 20, 2, 0, 0, 0, 0]);
    mapxy.push([2, 3, 4, 1, 80, 0, 0, 4, 0, 0, 70, 3, 4, 1, 2]);
    mapxy.push([1, 0, 0, 10, 0, 0, 0, 4, 0, 0, 0, 30, 0, 0, 3]);
    mapxy.push([4, 0, 0, 10, 0, 0, 5, 4, 6, 0, 0, 30, 0, 0, 4]);
    mapxy.push([3, 3, 3, 3, 3, 3, 3, 9, 1, 1, 1, 1, 1, 1, 1]);
    mapxy.push([2, 0, 0, 10, 0, 0, 7, 2, 8, 0, 0, 30, 0, 0, 2]);
    mapxy.push([1, 0, 0, 10, 0, 0, 0, 2, 0, 0, 0, 30, 0, 0, 3]);
    mapxy.push([4, 3, 2, 1, 60, 0, 0, 2, 0, 0, 50, 3, 2, 1, 4]);
    mapxy.push([0, 0, 0, 0, 4, 40, 40, 2, 40, 40, 4, 0, 0, 0, 0]);
    mapxy.push([0, 0, 0, 0, 3, 0, 0, 2, 0, 0, 1, 0, 0, 0, 0]);
    mapxy.push([0, 0, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 0, 0]);
    mapxy.push([0, 0, 0, 0, 1, 4, 3, 2, 1, 4, 3, 0, 0, 0, 0]);
    return mapxy;
}
function refreshBoard() {
    canvasWidth = window.innerHeight - 10;
    canvasHeight = window.innerHeight;
    maindiv.style.width = canvasWidth + "px";
    maindiv.style.height = canvasWidth + "px";
    ctx.canvas.width = canvasWidth;
    ctx.canvas.height = canvasWidth;
    upctx.canvas.width = canvasWidth;
    upctx.canvas.height = canvasWidth;
    tileWidth = Math.ceil(canvasWidth / 16);
    dicectx.canvas.width = tileWidth * 4;
    dicectx.canvas.height = tileWidth * 6;
    document.getElementById("buttondiv").style.left = tileWidth * 2 + "px";
    document.getElementById("buttondiv").style.top = tileWidth * 7.5 + "px";
}
function resizeboard() {
    refreshBoard();
    drawTheBoard();
}
function drawSkyGradient() {
    var skyGradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
    skyGradient.addColorStop(0, '#00aaff');
    skyGradient.addColorStop(1, '#ffffff');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
}
function drawARegularTile(color, width) {
    var imgData = ctx.createImageData(width, width);
    var pos = 0;
    for (var x = 0; x < width; x++) {
        for (var y = 0; y < width; y++) {
            var x2 = x - Math.ceil(width / 2);
            var y2 = y - Math.ceil(width / 2);
            var distance = Math.ceil(Math.sqrt(x2 * x2 + y2 * y2));
            var circlewall = Math.ceil(width / 2 * 0.8);
            var circleWidth = Math.ceil(width / 20);
            ys = new Array();
            for (var j = 0; j < circleWidth; j++) {
                ys.push(y - Math.ceil(circleWidth / 2 * 0.9) - +circleWidth + j);
            }
            if ((circlewall - circleWidth) < distance && distance < circlewall) {
                setColor("white");
            }
            else {
                setColor(color);
            }
            imgData.data[pos++] = colorR;
            imgData.data[pos++] = colorG;
            imgData.data[pos++] = colorB;
            imgData.data[pos++] = colorA;
        }
    }
    return imgData;
}
function drawTwoColorTile(color, width, keepColorSequence) {
    var imgData = ctx.createImageData(width, width);
    var pos = 0;
    for (var x = 0; x < width; x++) {
        for (var y = 0; y < width; y++) {
            if (x < width - y) {
                switch (color) {
                    case "yb": keepColorSequence ? setColor("yellow") : setColor("blue"); break;
                    case "rg": keepColorSequence ? setColor("red") : setColor("green"); break;
                    default: break;
                }
            }
            else {
                switch (color) {
                    case "yb": keepColorSequence ? setColor("blue") : setColor("yellow"); break;
                    case "rg": keepColorSequence ? setColor("green") : setColor("red"); break;
                    default: break;
                }
            }
            if (x < y) {
                switch (color) {
                    case "ry": keepColorSequence ? setColor("yellow") : setColor("red"); break;
                    case "gb": keepColorSequence ? setColor("blue") : setColor("green"); break;
                    default: break;
                }
            }
            else {
                switch (color) {
                    case "ry": keepColorSequence ? setColor("red") : setColor("yellow"); break;
                    case "gb": keepColorSequence ? setColor("green") : setColor("blue"); break;
                    default: break;
                }
            }
            imgData.data[pos++] = colorR;
            imgData.data[pos++] = colorG;
            imgData.data[pos++] = colorB;
            imgData.data[pos++] = colorA;
        }
    }
    return imgData;
}
function drawCenterTile(width) {
    var imgData = ctx.createImageData(width, width);
    var pos = 0;
    for (var x = 0; x < width; x++) {
        for (var y = 0; y < width; y++) {
            if (x > y - 1 && x < width - y) {
                setColor("red");
            }
            else if (x < y && x > width - y - 1) {
                setColor("blue");
            }
            else if (x > y - 1 && x < width) {
                setColor("green");
            }
            else {
                setColor("yellow");
            }
            imgData.data[pos++] = colorR;
            imgData.data[pos++] = colorG;
            imgData.data[pos++] = colorB;
            imgData.data[pos++] = colorA;
        }
    }
    return imgData;
}
function setColor(color) {
    switch (color) {
        case "blue": colorR = 150, colorG = 150, colorB = 255, colorA = 255; break;
        case "red": colorR = 255, colorG = 0, colorB = 0, colorA = 255; break;
        case "green": colorR = 51, colorG = 180, colorB = 51, colorA = 255; break;
        case "yellow": colorR = 255, colorG = 204, colorB = 0, colorA = 255; break;
        case "white": colorR = 255, colorG = 255, colorB = 255, colorA = 255; break;
        default: colorR = 0, colorG = 0, colorB = 0, colorA = 0; break;
    }
}
function drawArrow(direction, width) {
    switch (direction) {
        case "up": color = "blue"; break;
        case "down": color = "red"; break;
        case "right": color = "green"; break;
        case "left": color = "yellow"; break;
        default: color = "white"; break;
    }
    var imgData = ctx.createImageData(width, width);
    var pos = 0;
    for (var x = 0; x < width; x++) {
        for (var y = 0; y < width; y++) {
            switch (direction) {
                case "right":
                    if (x > y - 1 / 3 * width && x < 4 / 3 * width - y) {
                        setColor(color);
                        if (x > y && x < width - y) {
                            setColor("transparent");
                        }
                    }
                    else {
                        setColor("transparent");
                    }
                    break;
                case "down":
                    if (x < y + 1 / 3 * width && x < 4 / 3 * width - y) {
                        setColor(color);
                        if (x < y && x < width - y) {
                            setColor("transparent");
                        }
                    }
                    else {
                        setColor("transparent");
                    }
                    break;
                case "left":
                    if (x < y + 1 / 3 * width && x > 2 / 3 * width - y) {
                        setColor(color);
                        if (x < y && x > width - y) {
                            setColor("transparent");
                        }
                    }
                    else {
                        setColor("transparent");
                    }
                    break;
                case "up":
                    if (x > y - 1 / 3 * width && x > 2 / 3 * width - y) {
                        setColor(color);
                        if (x > y && x > width - y) {
                            setColor("transparent");
                        }
                    }
                    else {
                        setColor("transparent");
                    }
                    break;
            }
            imgData.data[pos++] = colorR;
            imgData.data[pos++] = colorG;
            imgData.data[pos++] = colorB;
            imgData.data[pos++] = colorA;
        }
    }
    return imgData;
}

function drawAirPort(color, x, y) {
    switch (color) {
        case "blue": color = "#9696FF"; break;
        case "red": color = "#FF0000"; break;
        case "green": color = "#33B433"; break;
        case "yellow": color = "#FFCC00"; break;
        case "white": color = "#FFFFFF"; break;
    }

    ctx.shadowBlur = 0;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x - 1.5 * tileWidth, y + tileWidth * 1.5, tileWidth * 0.5, 2 * Math.PI, 0, true);
    ctx.fill();
    ctx.fillStyle = "lightgrey";
    ctx.strokeStyle = "lightgrey";
    ctx.lineWidth = 1;
    ctx.shadowBlur = 20;
    ctx.shadowColor = "grey";
    ctx.roundRect(x - 1.5 * tileWidth + tileWidth / 2 * 0.8, y - tileWidth * 2, tileWidth * 3, tileWidth * 3, tileWidth / 3).stroke();
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.moveTo(x - 1.0 * tileWidth, y + 0.5 * tileWidth);
    ctx.lineTo(x - 1.5 * tileWidth, y + 1.1 * tileWidth);
    ctx.arc(x - 1.5 * tileWidth, y + tileWidth * 1.5, tileWidth * 0.4, 1.5 * Math.PI, 0, true);
    ctx.lineTo(x - 0.5 * tileWidth, y + 1.0 * tileWidth);
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
    ctx.fillStyle = color;
    ctx.roundRect(x - 1.0 * tileWidth, y - 1.9 * tileWidth, tileWidth * 1.4, tileWidth * 1.4, tileWidth / 6).stroke();
    ctx.fill();
    ctx.roundRect(x + 0.4 * tileWidth, y - 1.9 * tileWidth, tileWidth * 1.4, tileWidth * 1.4, tileWidth / 6).stroke();
    ctx.fill();
    ctx.roundRect(x - 1.0 * tileWidth, y - 0.5 * tileWidth, tileWidth * 1.4, tileWidth * 1.4, tileWidth / 6).stroke();
    ctx.fill();
    ctx.roundRect(x + 0.4 * tileWidth, y - 0.5 * tileWidth, tileWidth * 1.4, tileWidth * 1.4, tileWidth / 6).stroke();
    ctx.fill();
}

function placeDefaultPlanes(color) {
    var redposes = [1.65, 0.75, 3.05, 0.75, 1.65, 2.15, 3.05, 2.15, 0.5, 3.5];
    var yellowposes = [12.75, 1.65, 14.15, 1.65, 12.75, 3.05, 14.15, 3.05, 11.5, 0.5];
    var blueposes = [11.85, 12.75, 13.25, 12.75, 11.85, 14.15, 13.25, 14.15, 14.5, 11.5];
    var greenposes = [0.75, 11.85, 2.15, 11.85, 0.75, 13.25, 2.15, 13.25, 3.5, 14.5];
    var currentpos = null;
    var i_role = null;
    switch (color) {
        case "red": currentpos = redposes; i_role = 0; break;
        case "yellow": currentpos = yellowposes; i_role = 1; break;
        case "blue": currentpos = blueposes; i_role = 2; break;
        case "green": currentpos = greenposes; i_role = 3; break;
        default: break;
    }
    var currentplane = color + "plane";
    var img = document.getElementById(currentplane);
    upctx.shadowBlur = 10;
    upctx.shadowOffsetX = 2;
    upctx.shadowOffsetY = 2;
    upctx.shadowColor = "black";

    for (var i = 0; i < 8; i++) {
        upctx.drawImage(img, tileWidth * currentpos[i], tileWidth * currentpos[++i], tileWidth, tileWidth);
    }
}

function returnDiceImg(val) {
    var currentdice = "dice" + "one";
    switch (val) {
        case 1: currentdice = "dice" + "one"; break;
        case 2: currentdice = "dice" + "two"; break;
        case 3: currentdice = "dice" + "three"; break;
        case 4: currentdice = "dice" + "four"; break;
        case 5: currentdice = "dice" + "five"; break;
        case 6: currentdice = "dice" + "six"; break;
        default: break;
    }
    var img = document.getElementById(currentdice);
    return img;
}


function rolltheDice(btn) {
    dicectx.clearRect(0, 0, tileWidth * 4, tileWidth * 4);
    var diceposi = [0, 1, 1, 0];
    var diceposj = [0, 0, 1, 1];
    var i = -1;
    var rolling = setInterval(function () {
        dicectx.clearRect(tileWidth * 2 * (diceposi[i % 4]), tileWidth * 2 * (diceposj[i % 4]), tileWidth * 2, tileWidth * 2);
        diceValue = rand(6);
        var img = returnDiceImg(diceValue);
        i++;
        dicectx.drawImage(img, tileWidth * 2 * (diceposi[i % 4]), tileWidth * 2 * (diceposj[i % 4]), tileWidth * 2, tileWidth * 2);
    }, 180);
    setTimeout(function () {
        clearInterval(rolling);
    }, 2000);
}