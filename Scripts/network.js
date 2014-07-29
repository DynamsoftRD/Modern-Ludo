var noSupportMessage = "Your browser doesn't support WebSocket!";
var ws;
var joinNow = false;

function inputPlayerName() {
    //document.getElementById("cover").style.display = "";
    //var names = document.getElementsByClassName("playername");
    //for (var i = 0; i < names.length; i++) {
    //    playStatus[i].name = names[i].value;
    //}
    //for (var i = 0; i < names.length; i++) {
    //    if (names[i].value == "") {
    //        names[i].focus();
    //        break;
    //    }
    //}
    //var name = prompt("How shall we call you", "");
    //names[i].value = name;
    //if (name === "")
    //    return inputPlayerName()
    //else
    joinNow = true;//socket ready
    document.getElementById("joinGame").disabled = false;
    document.getElementById("joinGame").focus();
}
function joinGameNow(btn) {
    var name = document.getElementById("joinGame").value;
    if (name.trim() != "" && joinNow) {
        joinNow = false;
        var interval = 0;
        var movethePlane = setInterval(function () {
            interval += 2;
            btn.style.left = (-560 + interval * 3) + "px";
            btn.style.opacity = 1 - interval / 200;
        }, 10);
        setTimeout(function () {
            clearInterval(movethePlane);
            document.getElementById("startScreen").style.display = "none";
            document.getElementById("cover").style.display = "";
            if (name.length > 6) {
                name = name.substr(0, 6);
            }
            selfName = name.trim();
            var msg = JSON.stringify({ "player": selfName });
            sendJSONMessage(msg);
        }, 1000);
    }
    else {
        inputPlayerName();
    }
}

function appendMessage(message) {
    console.log(message);
    return;
    var div = document.createElement('div');
    div.textContent = message;
    //body.appendChild(div);
}

function connectSocketServer() {
    var support = "MozWebSocket" in window ? 'MozWebSocket' : ("WebSocket" in window ? 'WebSocket' : null);

    if (support == null) {
        appendMessage("* " + noSupportMessage);
        return;
    }

    appendMessage("Connecting to server ..");
    // create a new websocket and connect
    ws = new window[support]('ws://192.168.8.23:2012/');
    //ws = new window[support]('ws://192.168.8.84:2012/');

    // when data is comming from the server, this metod is called
    ws.onmessage = function (evt) {
        var data = evt.data;
        if (!data)
            return;

        var json = JSON.parse(data);
        var jValue;
        var isBreak = true;
        for (jProperty in json) {
            jValue = json[jProperty];
            switch (jProperty) {
                case "game":
                    document.getElementById("rollDice").style.visibility = "hidden";
                    if (jValue === "start") {
                        startTheGame();
                    }
                    else if (jValue === "join") {
                        name = inputPlayerName();
                    }
                    else if (jValue.toString().indexOf("move") != -1) {
                        var jValueAr = jValue.toString().split("$");
                        if (selfName === jValueAr[1]) {
                            document.getElementById("rollDice").style.visibility = "";
                            document.getElementById("info").innerText = "It's your turn.";
                            freezeMap = false;
                        }
                    }
                    else {
                        freezeMap = true;
                    }
                    break;
                case "room":
                    if (jValue === "full") {
                        document.getElementById("roomfull").style.display = "";
                    }
                    break;
                case "players":
                    players = jValue;
                    for (var k = 0; k < players.length; k++) {
                        var names = document.getElementsByClassName("playername");
                        var tempTwo = players[k].split("$");
                        names[tempTwo[0]].value = tempTwo[1];
                    }

                    break;
                case "player":
                    break;
                case "play":
                    isBreak = false;
                    break;
                case "diceValue":
                    diceValue = jValue;
                    rolltheDice(null, diceValue);
                    break;
                case "planeclicked":
                    aPlaneClicked(jValue, false);
                    break;
            }
            if (isBreak)
                break;
        }
    };

    // when the connection is established, this method is called
    ws.onopen = function () {
        appendMessage('* Connection open');
        //connectButton.disabled = true;
        //disconnectButton.disabled = false;
    };

    // when the connection is closed, this method is called
    ws.onclose = function () {
        appendMessage('* Connection closed');
        //playButton.disabled = true;
        //connectButton.disabled = false;
        //disconnectButton.disabled = true;
    }
}

function sendMessage() {
    if (ws) {
        var msg = {};
        msg.play = this.name;
        msg.move = 6;
        ws.send(JSON.stringify(msg));
    }
}

function JSONEncode(key, value) {
    var json = { key: value };
    var json_string = JSON.stringify(json)
    return json_string;
}

function sendJSONMessage(msg) {
    if (ws) {
        ws.send(msg);
    }
}

function disconnectWebSocket() {
    if (ws) {
        ws.close();
    }
}

function connectWebSocket() {
    connectSocketServer();
}

function JoinGame() {
    connectWebSocket();
    //sendMessage();
}