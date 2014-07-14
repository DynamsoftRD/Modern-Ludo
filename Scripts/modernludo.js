window.onload = init;
window.onresize = resizeboard;
var maindiv, ua, onmobile = null, continueplay = false;
var canvas = null, ctx = null, dicecanvas = null, dicectx = null, upcanvas = null, upctx = null, canvasWidth = 0, canvasHeight = 0, tileWidth = 0;
var colorR = 0, colorG = 0, colorB = 0, colorA = 255;
var valueMap = null;
var playhand = { role: null, color: null, value: null }, diceValue = 0, handcount = 0, tempindex = 0;
var canvas_x = null, canvas_y = null;
var routs = [];
var specialPos = [];
var flyOverPos = [72, 82, 92, 62];
var roles = ["red", "yellow", "blue", "green"];
var hands = ["#FF0000", "#FFCC00", "#9696FF", "#33B433"];
var toHit = [[], []];
var clickOverflow = false;
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
    if (navigator.userAgent.toLowerCase().indexOf("ipad") != -1)
        ua = 'ipad';
    if (navigator.userAgent.toLowerCase().indexOf("iphone") != -1)
        ua = 'iphone';
    if (ua == 'ipad' || ua == 'iphone') {
        onmobile = true;
        document.getElementById("buttondiv").style.display = "none";
        document.getElementById("cover").className = "coveronmobile";
        document.getElementById("cover").style.display = "";
    }
    else {
        onmobile = false;
        document.getElementById("cover").style.display = "";
    }
}
function startTheGame(btn) {
    if (!continueplay) {
        var names = document.getElementsByClassName("playername");
        for (var i = 0; i < names.length; i++) {
            if (names[i].value == "") {
                btn.value = "Need Names~";
                names[i].focus();
                setTimeout(function () {
                    btn.value = "Let's start~";
                }, 2000);
                return;
            }
            else {
                playStatus[i].name = names[i].value;
            }
        }
        document.getElementById("buttons").style.display = "none";
        document.getElementById("loading").style.display = "";
        coverCanvas = document.getElementById("loading");
        coverCtx = coverCanvas.getContext("2d");
    }
    startUp();
}
function startUp() {
    if (!continueplay) {
        coverCtx.fillStyle = "khaki";
        var interval = 1;
        var startUpSeed = setInterval(function () {
            interval++;
            coverCtx.fillRect(0, 0, 500 * (interval / 100), 30);
        }, 10);
    }
    setTimeout(function () {
        if (!continueplay)
            clearInterval(startUpSeed);
        document.getElementById("cover").style.display = "none";
        document.getElementById("copyright").style.display = "none";
        document.getElementById("backtomenu").style.display = "";
        initPlayGround();
    }, 1000);
}
function showMenu() {
    document.getElementById("cover").style.display = "";
    document.getElementById("copyright").style.display = "";
    document.getElementById("backtomenu").style.display = "none";
    document.getElementById("playGround").style.display = "none";
    document.getElementById("buttons").style.display = "";
    document.getElementById("gameon").value = "Continue Playing";
    continueplay = true;
    coverCanvas.style.display = "none";
}
function initPlayGround() {
    document.getElementById("playGround").style.display = "";
    if (!continueplay) {
        continueplay = false;
        maindiv = document.getElementById("main");
        canvas = document.getElementById("gameboard");
        ctx = canvas.getContext("2d");
        upcanvas = document.getElementById("playboard");
        upcanvas.onmousemove = updatePos;
        upcanvas.onclick = updateRouts;
        upctx = upcanvas.getContext("2d");
        dicecanvas = document.getElementById("dice");
        dicectx = dicecanvas.getContext("2d");
        if (onmobile)
            dicecanvas.onclick = rolltheDice;
        ctx.font = "20px helvetica"
        ctx.globalAlpha = 1.0;
        canvas.setStyle = function (styleMap) {
            var styleString = new String();
            for (i in styleMap) {
                styleString += i + ':' + styleMap[i] + '; ';
            }
            canvas.setAttribute('style', styleString);
        }
        upcanvas.setStyle = function (styleMap) {
            var styleString = new String();
            for (i in styleMap) {
                styleString += i + ':' + styleMap[i] + '; ';
            }
            upcanvas.setAttribute('style', styleString);
        }
        var canvasStyle = {
            'background': '#00aaff',
            'border': '1px solid grey'
        };
        canvas.setStyle(canvasStyle);
        var canvasStyle = {
            'border': '1px solid grey'
        };
        upcanvas.setStyle(canvasStyle);
        valueMap = createValueMap();
        initiatePlaneRouts();
    }
    resizeboard();
    drawTheBoard();
    updateAllPlanes();
}
function changeHands() {
    if (playhand.role) {
        if (playhand.role.continuePlaying) {
            document.getElementById("rollDice").style.visibility = "";
            handcount--;
        }
    }
    playhand.color = hands[handcount % 4];
    playhand.role = playStatus[handcount % 4];
    setTimeout(function () {
        if (playhand.role.win) {
            handcount++;
            changeHands();
        }
        playhand.value = handcount % 4;
        dicectx.fillStyle = playhand.color;
        if (onmobile) {
            dicectx.fillRect(0, tileWidth * 2, tileWidth * 2, tileWidth * 2);
            dicectx.clearRect(0, 0, tileWidth * 2, tileWidth * 2);
            dicectx.font = "15px white";
            dicectx.fillText("Click Here", tileWidth / 10, tileWidth * 1.1);
        }
        else {
            dicectx.fillRect(0, tileWidth * 4, tileWidth * 4, tileWidth * 2);
            dicectx.clearRect(0, 0, tileWidth * 4, tileWidth * 4);
            document.getElementById("rollDice").style.visibility = "";
        }
        diceValue = 0;
    }, 500);
}
function updatePlayBoard() {
    var ifChangeHands = -1;
    if (playhand.role) {
        for (var i = 0; i < playhand.role.planes.length; i++) {
            if (ifChangeHands < playhand.role.planes[i].value)
                ifChangeHands = playhand.role.planes[i].value;
            if (playhand.role.planes[i].value != playhand.role.planes[i].previousValue) {//a plane needs to be moved
                var coordinates = moveAPlane(playhand.role.planes[i], playhand.role.planes[i].previousValue, playhand.role.planes[i].value);
                playhand.role.planes[i].pos.left = Math.floor(coordinates.co_x) - 1;
                playhand.role.planes[i].pos.top = Math.floor(coordinates.co_y) - 1;
                playhand.role.planes[i].pos.right = Math.floor(coordinates.co_x + tileWidth) + 1;
                playhand.role.planes[i].pos.bottom = Math.floor(coordinates.co_y + tileWidth) + 1;
                if (playhand.role.planes[i].previousValue == playhand.role.planes[i].value) {
                    handcount++;
                    changeHands();
                }
                break;
            }
        }
    }
    if (ifChangeHands == -1 && clickOverflow != true) {
        handcount++;
        changeHands();
    }
}
function updateAllPlanes() {
    upctx.clearRect(0, 0, tileWidth * 16, tileWidth * 16);
    for (var j = 0; j < 4; j++) {//role index
        if (j != tempindex) {
            for (var k = 0; k < 4; k++) {
                if (playStatus[j].planes[k].value == -1)
                    placeDefaultPlanes(playStatus[j].color, k);
                else if (playStatus[j].planes[k].value == 0) {
                    placeDefaultPlanes(playStatus[j].color, k, true);
                }
                else {
                    onlyPlaceAPlane(playStatus[j].color, playStatus[j].index, playStatus[j].planes[k].value, k);
                }
            }
        }
    }
    for (var k = 0; k < 4; k++) {
        if (playStatus[tempindex].planes[k].value == -1)
            placeDefaultPlanes(playStatus[tempindex].color, k);
        else if (playStatus[tempindex].planes[k].value == 0) {
            placeDefaultPlanes(playStatus[tempindex].color, k, true);
        }
        else {
            onlyPlaceAPlane(playStatus[tempindex].color, playStatus[tempindex].index, playStatus[tempindex].planes[k].value, k);
        }
    }
    var tempstr = "";
    for (var j = 0; j < 4; j++) {
        switch (playStatus[j].touchBaseCount) {
            case 4:
                tempstr += "<strong style = 'color: " + playStatus[j].color + "'>" + playStatus[j].name + " has won!</strong><br />";
                playStatus[j].win = true;
                break;
            default:
                if (onmobile)

                    tempstr += "<strong style = 'color: " + playStatus[j].color + "'>" + playStatus[j].name + " </strong><br />" + playStatus[j].touchBaseCount + " plane(s)<br />";
                else
                    tempstr += "<strong style = 'color: " + playStatus[j].color + "'>" + playStatus[j].name + ": </strong><br />" + playStatus[j].touchBaseCount + " plane(s) have landed.<br />"; break;
        }
    }
    document.getElementById("players").innerHTML = tempstr;
}
function moveAPlane(plane, preValue, Value) {
    var dif = Math.abs(Value - preValue);
    var coordinates;
    if (Value < 0) {//only apply to 'out of airport' scenario
        coordinates = placeAPlane(playhand.role.color, Value, 1, plane.previousValue, plane);
        plane.value = 0;
        plane.previousValue = plane.value;
        return coordinates;
    }
    else {
        coordinates = placeAPlane(playhand.role.color, Value, dif, plane.previousValue, plane);
        plane.previousValue = plane.value;
        return coordinates;
    }
}
function onlyPlaceAPlane(color, index, value, planeindex) {
    var currentplane = color + "plane";
    var img = document.getElementById(currentplane);
    var breakTwice = false;
    for (var x = 0; x < 15; x++) {
        for (var y = 0; y < 15; y++) {
            var tempValue = routs[index][value - 1];
            if (valueMap[y][x] == tempValue) {
                upctx.shadowBlur = 10;
                upctx.shadowOffsetX = 2;
                upctx.shadowOffsetY = 2;
                upctx.shadowColor = "black";
                upctx.drawImage(img, tileWidth / 2 + tileWidth * x, tileWidth / 2 + tileWidth * y, tileWidth, tileWidth);
                breakTwice = true;
                break;
            }
        }
        if (breakTwice) {
            breakTwice = false;
            break;
        }
    }
    playStatus[index].planes[planeindex].pos.left = Math.floor(tileWidth / 2 + tileWidth * x) - 1;
    playStatus[index].planes[planeindex].pos.top = Math.floor(tileWidth / 2 + tileWidth * y) - 1;
    playStatus[index].planes[planeindex].pos.right = Math.floor(tileWidth / 2 + tileWidth * x + tileWidth) + 1;
    playStatus[index].planes[planeindex].pos.bottom = Math.floor(tileWidth / 2 + tileWidth * y + tileWidth) + 1;
}
function placeAPlane(color, value, steps, previousValue, currentPlane) {
    tempindex = playhand.role.index;
    var currentplaneimg = color + "plane";
    var img = document.getElementById(currentplaneimg);
    var breakTwice = false;
    var stepsToTake = [], stepIn = 0;
    if (value < 0) {//Taking off
        switch (value) {
            case -1: stepsToTake.push(value); break;
            default: stepsToTake.push(0); break;
        }

    }
    else {
        if (value > 55) {//over the limit
            var stepsOne = 56 - (value - playhand.role.overLimit);
            playhand.role.overLimit = 0;
            for (var j = 0; j < stepsOne; j++) {// value - 57 is the end of rout -->99
                stepsToTake.push(previousValue + j + 1);
            }
            if (value == 56) {//One Plane has touched the base
                playhand.role.touchBaseCount++;
            }
            else {
                var stepsTwo = value - 56;
                for (var j = 0; j < stepsTwo; j++) {// value - 57 is the end of rout -->99
                    stepsToTake.push(55 - j);
                }
            }
        }
        else {
            if (steps > 12 && playhand.role.fly) {//fly  
                playhand.role.fly = false;
                var tempValue = null;
                for (var j = 0; j < steps - 12; j++) {
                    stepsToTake.push(previousValue + j + 1);
                }
                tempValue = routs[playhand.role.index][previousValue + j - 1];//hit working
                toHit[0].push(j);
                toHit[1].push(tempValue);
                steps = steps - 12 + 2;
                stepsToTake.push(57);
                tempValue = flyOverPos[playhand.role.index];//hit working
                toHit[0].push(j + 1);
                toHit[1].push(tempValue);
                stepsToTake.push(value);
                tempValue = routs[playhand.role.index][value - 1];//hit working
                toHit[0].push(j + 2);
                toHit[1].push(tempValue);
            }
            else if (playhand.role.fly) {//fly  over 4 
                playhand.role.fly = false;
                var tempValue = null;
                for (var j = 0; j < steps - 4; j++) {
                    stepsToTake.push(previousValue + j + 1);
                }
                tempValue = routs[playhand.role.index][previousValue + j - 1];//hit working
                toHit[0].push(j);
                toHit[1].push(tempValue);
                stepsToTake.push(value);
                steps = steps - 4 + 1;
                tempValue = routs[playhand.role.index][value - 1];//hit working
                toHit[0].push(j + 1);
                toHit[1].push(tempValue);
            }
            else {
                var tempValue = null;
                for (var j = 0; j < steps; j++) {
                    stepsToTake.push(previousValue + j + 1);
                }
                tempValue = routs[playhand.role.index][value - 1];//hit working
                toHit[0].push(j);
                toHit[1].push(tempValue);
            }
        }
    }
    var moveSeed = setInterval(function () {
        currentPlane.value = stepsToTake[stepIn];
        currentPlane.previousValue = stepsToTake[stepIn];
        stepIn++;
        for (var n = 0; n < toHit[0].length; n++) {
            if (stepIn == toHit[0][n]) {
                hitAPlane(tempindex, toHit[1][n]);
            }
        }
        updateAllPlanes();
        if (stepIn == steps) {
            toHit = [[], []];
            clearInterval(moveSeed);
        }
    }, 500);
    var coordinates = null;
    var tempValue = -1;
    if (value < 0)
        tempValue = value;
    else if (value > 56)
        tempValue = routs[playhand.role.index][56 - value + 56];
    else
        tempValue = routs[playhand.role.index][value - 1];
    if (tempValue == -1) {
        coordinates = {
            co_x: 0,
            co_y: 0
        }
    } else {
        for (var x = 0; x < 15; x++) {
            for (var y = 0; y < 15; y++) {
                if (valueMap[y][x] == tempValue) {
                    coordinates = {
                        co_x: tileWidth / 2 + tileWidth * x,
                        co_y: tileWidth / 2 + tileWidth * y
                    }
                    breakTwice = true;
                    break;
                }
            }
            if (breakTwice) {
                breakTwice = false;
                break;
            }
        }
    }
    return coordinates;
}
function hitAPlane(ind, val) {
    for (var j = 0; j < 4; j++) {//role index
        for (var k = 0; k < 4; k++) {//plane index in each role
            if (j != ind && //Not the same color
                playStatus[j].planes[k].value != 0 &&
                routs[j][playStatus[j].planes[k].value - 1] == val) { //overlapped
                playStatus[j].planes[k].value = -1; //This plane is sent back home, there might be more than 1 plane that fit this
                playStatus[j].planes[k].previousValue = -1;
            }
        }
    }
}
function placeDefaultPlanes(color, planeindex, atTheDoor) {
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
    if (planeindex != undefined) {//not initiation  
        var tempPosInd = 0;
        if (atTheDoor == true) {
            tempPosInd = 8;
        }
        else {
            tempPosInd = planeindex * 2
        }
        upctx.drawImage(img, tileWidth * currentpos[tempPosInd], tileWidth * currentpos[tempPosInd + 1], tileWidth, tileWidth);
        playStatus[i_role].planes[planeindex].pos.left = Math.floor(tileWidth * currentpos[tempPosInd]) - 1;
        playStatus[i_role].planes[planeindex].pos.top = Math.floor(tileWidth * currentpos[tempPosInd + 1]) - 1;
        playStatus[i_role].planes[planeindex].pos.right = Math.floor(tileWidth * currentpos[tempPosInd] + tileWidth) + 1;
        playStatus[i_role].planes[planeindex].pos.bottom = Math.floor(tileWidth * currentpos[tempPosInd + 1] + tileWidth) + 1;
    }
    else {
        for (var i = 0; i < 8; i++) {
            upctx.drawImage(img, tileWidth * currentpos[i], tileWidth * currentpos[++i], tileWidth, tileWidth);
        }
        for (var j = 0; j < playStatus[i_role].planes.length; j++) {
            playStatus[i_role].planes[j].pos.left = Math.floor(tileWidth * currentpos[0 + j * 2]) - 1;
            playStatus[i_role].planes[j].pos.top = Math.floor(tileWidth * currentpos[1 + j * 2]) - 1;
            playStatus[i_role].planes[j].pos.right = Math.floor(tileWidth * currentpos[0 + j * 2] + tileWidth) + 1;
            playStatus[i_role].planes[j].pos.bottom = Math.floor(tileWidth * currentpos[1 + j * 2] + tileWidth) + 1;
        }
    }
}
function rolltheDice(btn) {
    if (onmobile)
        dicectx.clearRect(0, 0, tileWidth * 2, tileWidth * 2);
    else {
        btn.style.visibility = "hidden";
        dicectx.clearRect(0, 0, tileWidth * 4, tileWidth * 4);
    }
    document.getElementById("info").innerText = "";
    var diceposi = [0, 1, 1, 0];
    var diceposj = [0, 0, 1, 1];
    var i = -1;
    var rolling = setInterval(function () {
        if (onmobile)
            dicectx.clearRect(0, 0, tileWidth * 2, tileWidth * 2);
        else
            dicectx.clearRect(tileWidth * 2 * (diceposi[i % 4]), tileWidth * 2 * (diceposj[i % 4]), tileWidth * 2, tileWidth * 2);
        diceValue = Math.floor((Math.random() * 6) + 1);
        var currentdice = "dice" + "one";
        switch (diceValue) {
            case 1: currentdice = "dice" + "one"; break;
            case 2: currentdice = "dice" + "two"; break;
            case 3: currentdice = "dice" + "three"; break;
            case 4: currentdice = "dice" + "four"; break;
            case 5: currentdice = "dice" + "five"; break;
            case 6: currentdice = "dice" + "six"; break;
            default: break;
        }
        var img = document.getElementById(currentdice);
        i++;
        if (onmobile)
            dicectx.drawImage(img, 0, 0, tileWidth * 2, tileWidth * 2);
        else
            dicectx.drawImage(img, tileWidth * 2 * (diceposi[i % 4]), tileWidth * 2 * (diceposj[i % 4]), tileWidth * 2, tileWidth * 2);
    }, 180);
    setTimeout(function () {
        clearInterval(rolling);
        updatePlanesStatus(diceValue);
        if (playhand.role) {
            var ifChangeHands = -1;
            for (var i = 0; i < playhand.role.planes.length; i++) {
                if (ifChangeHands < playhand.role.planes[i].value && playhand.role.planes[i].value != 56)
                    ifChangeHands = playhand.role.planes[i].value;
            }
            if (diceValue != 6 && ifChangeHands == -1) {//All planes are in the airport and there is no chance of taking off
                handcount++;
                changeHands();
            }
        }
    }, 2000);
}
function updatePlanesStatus(val) {
    if (val == 6)
        playhand.role.continuePlaying = true;
    else
        playhand.role.continuePlaying = false;
    for (var i = 0; i < playhand.role.planes.length; i++) {
        switch (playhand.role.planes[i].value) {
            case -1: if (val == 6) playhand.role.allowTakeOff = true; break;
            case 0: break;
            default: break;
        }
    }
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
function createValueMap() {
    var mapxy = new Array();
    mapxy.push([00, 00, 00, 00, 01, 02, 03, 04, 05, 06, 07, -4, 00, 00, 00]);
    mapxy.push([00, 00, 00, 00, 52, 00, 00, 60, 00, 00, 08, 00, 00, 00, 00]);
    mapxy.push([00, 00, 00, 00, 51, 00, 00, 61, 00, 00, 09, 00, 00, 00, 00]);
    mapxy.push([-5, 00, 00, 00, 50, 00, 00, 62, 00, 00, 10, 00, 00, 00, 00]);
    mapxy.push([46, 47, 48, 49, 00, 00, 00, 63, 00, 00, 00, 11, 12, 13, 14]);
    mapxy.push([45, 00, 00, 00, 00, 00, 00, 64, 00, 00, 00, 00, 00, 00, 15]);
    mapxy.push([44, 00, 00, 00, 00, 00, 00, 65, 00, 00, 00, 00, 00, 00, 16]);
    mapxy.push([43, 90, 91, 92, 93, 94, 95, 99, 75, 74, 73, 72, 71, 70, 17]);
    mapxy.push([42, 00, 00, 00, 00, 00, 00, 85, 00, 00, 00, 00, 00, 00, 18]);
    mapxy.push([41, 00, 00, 00, 00, 00, 00, 84, 00, 00, 00, 00, 00, 00, 19]);
    mapxy.push([40, 39, 38, 37, 00, 00, 00, 83, 00, 00, 00, 23, 22, 21, 20]);
    mapxy.push([00, 00, 00, 00, 36, 00, 00, 82, 00, 00, 24, 00, 00, 00, -3]);
    mapxy.push([00, 00, 00, 00, 35, 00, 00, 81, 00, 00, 25, 00, 00, 00, 00]);
    mapxy.push([00, 00, 00, 00, 34, 00, 00, 80, 00, 00, 26, 00, 00, 00, 00]);
    mapxy.push([00, 00, 00, -2, 33, 32, 31, 30, 29, 28, 27, 00, 00, 00, 00]);
    return mapxy;
}
function initiatePlaneRouts() {
    //fly over index -->17 ~ 29 **57 each~~
    var redRout = [
        46, 47, 48, 49, 50, 51, 52, 01, 02, 03, 04, 05, 06, 07, 08, 09, 10, 11, 12, 13,
        14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33,
        34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 90, 91, 92, 93, 94, 95, 72];
    var yellowRout = [07, 08, 09, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27,
        28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 01, 02, 03, 04,
        60, 61, 62, 63, 64, 65, 82];
    var blueRout = [20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
        41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 01, 02, 03, 04, 05, 06, 07, 08, 09, 10, 11, 12, 13, 14, 15, 16, 17,
        70, 71, 72, 73, 74, 75, 92];
    var greenRout = [33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 01,
        02, 03, 04, 05, 06, 07, 08, 09, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
        80, 81, 82, 83, 84, 85, 62];
    routs.push(redRout);
    routs.push(yellowRout);
    routs.push(blueRout);
    routs.push(greenRout);
    var redSpecial = [47, 51, 03, 07, 11, 15, 19, 23, 27, 31, 35, 39];
    var yellowSpecial = [08, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52];
    var blueSpecial = [21, 25, 29, 33, 37, 41, 45, 49, 01, 05, 09, 13];
    var greenSpecial = [34, 38, 42, 46, 50, 02, 06, 10, 14, 18, 22, 26];
    specialPos.push(redSpecial);
    specialPos.push(yellowSpecial);
    specialPos.push(blueSpecial);
    specialPos.push(greenSpecial);
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
    if (onmobile) {
        dicectx.canvas.width = tileWidth * 2;
        dicectx.canvas.height = tileWidth * 4;
        document.getElementById("info").style.width = tileWidth * 2 + "px";
        document.getElementById("players").style.width = tileWidth * 2 + "px";
    }
    else {
        dicectx.canvas.width = tileWidth * 4;
        dicectx.canvas.height = tileWidth * 6;
    }
    if (onmobile) {
        document.getElementById("dice").style.left = tileWidth + "px";
        document.getElementById("playerStatus").style.left = tileWidth + "px";
        document.getElementById("playerStatus").style.top = tileWidth * 6 + "px";
    }
    else {
        document.getElementById("buttondiv").style.left = tileWidth * 2 + "px";
        document.getElementById("buttondiv").style.top = tileWidth * 7.5 + "px";
        document.getElementById("playerStatus").style.left = tileWidth + "px";
        document.getElementById("playerStatus").style.top = tileWidth * 9 + "px";
    }
}
function resizeboard() {
    refreshBoard();
    drawTheBoard();
    updateAllPlanes();
    //handcount = handcount == 0 ? 0 : handcount - 1;
    changeHands();
    if (!onmobile)
        document.getElementById("buttondiv").style.visibility = "";
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
var playStatus = (function () {
    var s = [];
    for (var k = 0; k < roles.length; k++) {
        var role = {
            name: null,
            color: roles[k],
            index: k,
            allowTakeOff: false,
            continuePlaying: false,
            overlap: false,
            hit: false,
            fly: false,
            overLimit: 0,
            touchBaseCount: 0,
            win: false,
            planes: []
        };
        for (var j = 0; j < 4; j++) {
            var plane = {
                previousValue: -1,
                value: -1,
                pos: {
                    left: -1,
                    top: -1,
                    right: -1,
                    bottom: -1
                }
            };
            role.planes.push(plane);
        }
        s.push(role);
    }
    return s;
})();
function updatePos(evt) {
    canvas_x = (parseInt(evt.pageX) - parseInt(upcanvas.offsetLeft));
    canvas_y = (parseInt(evt.pageY) - parseInt(upcanvas.offsetTop));
    var tempvar = null;
    if (playhand.role) {
        if ((playhand.role.planes[0].pos.left < canvas_x && canvas_x < playhand.role.planes[0].pos.right &&
            playhand.role.planes[0].pos.top < canvas_y && canvas_y < playhand.role.planes[0].pos.bottom) ||
            (playhand.role.planes[1].pos.left < canvas_x && canvas_x < playhand.role.planes[1].pos.right &&
            playhand.role.planes[1].pos.top < canvas_y && canvas_y < playhand.role.planes[1].pos.bottom) ||
            (playhand.role.planes[2].pos.left < canvas_x && canvas_x < playhand.role.planes[2].pos.right &&
            playhand.role.planes[2].pos.top < canvas_y && canvas_y < playhand.role.planes[2].pos.bottom) ||
            (playhand.role.planes[3].pos.left < canvas_x && canvas_x < playhand.role.planes[3].pos.right &&
            playhand.role.planes[3].pos.top < canvas_y && canvas_y < playhand.role.planes[3].pos.bottom)) {
            tempvar = true;
        }
        else
            tempvar = false;
        if (tempvar) {
            upcanvas.style.cursor = "pointer";
        }
        else {
            upcanvas.style.cursor = "default";
        }
    }
}
function updateRouts(evt) {
    canvas_x = (parseInt(evt.pageX) - parseInt(upcanvas.offsetLeft));
    canvas_y = (parseInt(evt.pageY) - parseInt(upcanvas.offsetTop));
    var tempvar = null;
    if (playhand.role) {
        for (var i = 0; i < playhand.role.planes.length; i++) {
            if (playhand.role.planes[i].pos.left < canvas_x && canvas_x < playhand.role.planes[i].pos.right &&
                    playhand.role.planes[i].pos.top < canvas_y && canvas_y < playhand.role.planes[i].pos.bottom) {
                tempvar = i;
                clickOverflow = false;
                break;
            }
            else {
                tempvar = null;
                clickOverflow = true;
            }
        }
        if (tempvar == null) {
            return; //Player didn't click on a plane
        }
        else {
            if (playhand.role.planes[tempvar].value == 56)//clicking on one that has touched base. do nothing
                return;
            if (diceValue == 0) {
                document.getElementById("info").innerText = "Please roll dice";
                return;
            }
            if (diceValue != 6 && playhand.role.planes[tempvar].value == -1) {//There is a plane flying, but he choose to click on one in the airport
                return;
            }
            playhand.role.planes[tempvar].previousValue = playhand.role.planes[tempvar].value;
            switch (playhand.role.planes[tempvar].value) {
                case -1: if (playhand.role.allowTakeOff) { playhand.role.allowTakeOff = false; playhand.role.planes[tempvar].value = -5 + playhand.value; } diceValue = 0; break;
                default:
                    playhand.role.planes[tempvar].value += diceValue;
                    if (playhand.role.planes[tempvar].value > 55) {
                        playhand.role.overLimit = diceValue;
                    }
                    if (playhand.role.planes[tempvar].value < 57 && playhand.role.planes[tempvar].value > 0) {
                        var tempRoutValue = routs[playhand.role.index][playhand.role.planes[tempvar].value - 1];
                        for (var j = 0; j < specialPos[playhand.role.index].length; j++) {
                            if (specialPos[playhand.role.index][j] == tempRoutValue) {
                                switch (j) {
                                    case 4: playhand.role.planes[tempvar].value += 12; playhand.role.fly = true; break;
                                    default: playhand.role.planes[tempvar].value += 4; playhand.role.fly = true; break;
                                }
                            }
                        }
                    }
                    diceValue = 0; break;
            }
        }
        updatePlayBoard();
        if (onmobile) {
            dicectx.clearRect(0, 0, tileWidth * 2, tileWidth * 2);
        }
        else
            dicectx.clearRect(0, 0, tileWidth * 4, tileWidth * 4);
    }
}
function saveGame(btn) {
    cookieDelete();
    var expireDate = new Date();
    expireDate.setMonth(expireDate.getMonth() + 1);
    var gameData = "";
    var gameDataExtra = "";
    for (var i = 0; i < playStatus.length; i++) {
        for (var j = 0; j < playStatus[i].planes.length; j++) {
            gameData += playStatus[i].color;
            gameData += "@" + playStatus[i].planes[j].value.toString() + "@";
        }
        gameDataExtra += playStatus[i].name;
        gameDataExtra += "@" + (playStatus[i].win ? "1" : "0") + "@";
    }
    gameData += "handcount" + "@" + handcount.toString() + "@";
    gameData += "~" + gameDataExtra;
    document.cookie = "gameData=" + gameData + ";expires=" + expireDate.toGMTString();
    btn.value = "Saved";
    setTimeout(function () {
        btn.value = "Save Game";
    }, 3000);
}
function loadGame(btn) {
    var gameData = showCookies();
    if (gameData == "NoData") {
        btn.value = "No Data";
        setTimeout(function () {
            btn.value = "Load Game";
        }, 3000);
    }
    else {
        btn.value = "Loading...";
        setTimeout(function () {
            btn.value = "Load Game";
        }, 5000);
        var parsedData = gameData.split("~");
        parsedAData = parsedData[0].split("@");
        parsedBData = parsedData[1].split("@");
        for (var i = 0; i < playStatus.length; i++) {
            playStatus[i].touchBaseCount = 0;
            for (var j = 0; j < playStatus[i].planes.length; j++) {
                playStatus[i].planes[j].value = parseInt((parsedAData[2 * (i * 4 + j) + 1]));
                if (playStatus[i].planes[j].value == 56) {
                    playStatus[i].touchBaseCount++;
                }
                playStatus[i].planes[j].previousValue = playStatus[i].planes[j].value;
            }
            playStatus[i].name = parsedBData[i * 2] == "null" ? null : parsedBData[i * 2];
            playStatus[i].win = parsedBData[i * 2 + 1] == "1" ? true : false;
        }
        handcount = parseInt(parsedAData[parsedAData.length - 2]);
        startTheGame();
    }
}
function cookieDelete() {
    var cookieCt = 0;
    if (document.cookie != "") {
        var thisCookie = document.cookie.split("; ");
        cookieCt = thisCookie.length;
        var expireDate = new Date();
        expireDate.setDate(expireDate.getDate() - 1);
        for (var i = 0; i < cookieCt; i++) {
            var cookieName = thisCookie[i].split("=")[0];
            document.cookie = cookieName + "=;expires=" + expireDate.toGMTString();
        }
    }
}
function showCookies() {
    var outMsg = "";
    if (document.cookie == "") {
        outMsg = "NoData";
    }
    else {
        var thisCookie = document.cookie.split("; ");
        for (var i = 0; i < thisCookie.length; i++) {
            if (thisCookie[i].split("=")[0] == "gameData") {
                outMsg += thisCookie[i].split("=")[1];
                break;
            }
            else {
                outMsg = "NoData";
            }
        }
    }
    return outMsg;
}