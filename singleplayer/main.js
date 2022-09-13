import { boardEdges, queueEdges } from './borders.js';

//const url = 'http://localhost:5000';
const url = 'https://carroteer-backend.herokuapp.com';

const boardWidth = 5;
const boardHeight = 7;
//const boardX = 200;
const boardY = 150;
const boardX = window.innerWidth / 2 - (boardWidth * 80 / 2);

const queueX = boardX - 120;
const queueY = 200;

const infobarX = boardX;
const infobarY = 50;

const bombDuration = 2000;
const hopSpeed = 1000;
const numStones = 5;
const numCarrots = 5;

let app = new PIXI.Application({
    width: window.innerWidth,
    height: window.innerHeight
});

document.body.appendChild(app.view);

app.loader
    .add("/assets/scene/background.jpeg")
    .add("/assets/scene/winbackground.jpg")
    .add("/assets/scene/black.jpg")
    .add("/assets/objects/bomb.png")
    .add("/assets/objects/carrot.png")
    .add("/assets/objects/stone.png")
    .add("/assets/objects/rabbit.png")
    .add("/assets/objects/select.png")
    .add("/assets/objects/x.png")
    .add("/assets/tiles/E.png")
    .add("/assets/tiles/NE.png")
    .add("/assets/tiles/NS.png")
    .add("/assets/tiles/NW.png")
    .add("/assets/tiles/SE.png")
    .add("/assets/tiles/SW.png")
    .add("/assets/tiles/WE.png")
    .add("/assets/tiles/edge.png")
    .add("/assets/tiles/corner.png")
    .add("/assets/ui/exitpressed.png")
    .add("/assets/ui/exitunpressed.png")
    .add("/assets/ui/resetpressed.png")
    .add("/assets/ui/resetunpressed.png")
    .add("/assets/ui/submitpressed.png")
    .add("/assets/ui/submitunpressed.png")
    .load(setup);

function setup() {
    let resources = app.loader.resources;

    // Create the background and add it to the stage
    let background = new PIXI.Sprite(resources["/assets/scene/background.jpeg"].texture);
    background.width = app.screen.width;
    background.height = app.screen.height;


    window.addEventListener('resize', resize);

    // Resize function window
    let isResizing = false;
    function resize() {
        if (!isResizing) {
            isResizing = true;
            setTimeout(function () {
                isResizing = false;
                // Resize the renderer
                app.renderer.resize(window.innerWidth, window.innerHeight);

                // You can use the 'screen' property as the renderer visible
                // area, this is more useful than view.width/height because
                // it handles resolution
                background.width = app.screen.width;
                background.height = app.screen.height;

                blackLayer.width = app.screen.width;
                blackLayer.height = app.screen.height;

                boardContainer.x = app.screen.width / 2 - (boardWidth * 80 / 2);
                infobarContainer.x = boardContainer.x;
                queueContainer.x = boardContainer.x - 120;

                winScreenContainer.x = window.innerWidth / 2 - winScreenContainer.width / 2;
                winScreenContainer.y = window.innerHeight / 2 - winScreenContainer.height / 2;
            }, 250);
        }
    }

    //overarching board container
    const boardContainer = new PIXI.Container();
    boardContainer.x = boardX;
    boardContainer.y = boardY;

    // [row][col]
    const tileContainer = new PIXI.Container();

    // fill board with empty tiles
    let board = [];
    for (let row = 0; row < boardHeight; row++) {
        let rowArr = [];
        for (let col = 0; col < boardWidth; col++) {
            const spr = new PIXI.Sprite(resources["/assets/tiles/E.png"].texture);
            spr.x = col * 80;
            spr.y = row * 80;
            tileContainer.addChild(spr);
            rowArr.push(spr);
        }
        board.push(rowArr);
    }


    board[0][0].texture = resources["/assets/tiles/NE.png"].texture;

    function removeTile(x, y) {
        board[x][y].texture = resources["/assets/tiles/E.png"].texture;
    }


    //bombs
    let bombsContainer = new PIXI.Container();

    let bombs = [];
    for (let row = 0; row < boardHeight; row++) {
        let rowArr = [];
        for (let col = 0; col < boardWidth; col++) {
            rowArr.push(undefined);
        }
        bombs.push(rowArr);
    }

    function addBombs(x, y) {
        for (let row = y - 1; row <= y + 1; row++) {
            for (let col = x - 1; col <= x + 1; col++) {
                if (row >= 0 && row < boardHeight && col >= 0 && col < boardWidth && bombs[row][col] == undefined && stones[row][col] == undefined && !(row == 0 && col == 0)) {
                    bombs[row][col] = new PIXI.Sprite(resources["/assets/objects/bomb.png"].texture);
                    bombs[row][col].x = 80 * col;
                    bombs[row][col].y = 80 * row;
                    bombs[row][col].width = 80;
                    bombs[row][col].height = 80;
                    bombsContainer.addChild(bombs[row][col]);

                    setTimeout(function () {
                        bombsContainer.removeChild(bombs[row][col]);
                        bombs[row][col] = undefined;
                        removeTile(row, col);
                        updateSelect();

                        if (playerX == col && playerY == row) {
                            playerX = 0;
                            playerY = 0;
                            playerDirection = 'E';
                            setPlayerPosition();
                            updatePlayerCoords();
                        }
                    }, bombDuration);
                }
            }
        }
    }



    // QUEUE
    let queueContainer = new PIXI.Container();
    queueContainer.x = queueX;
    queueContainer.y = queueY;



    let queue = [];
    for (let i = 0; i < 200; i++) {
        let choice = Math.floor(Math.random() * 6);
        if (choice == 0) {
            queue.push(new PIXI.Sprite(resources["/assets/tiles/NE.png"].texture));
        }
        else if (choice == 1) {
            queue.push(new PIXI.Sprite(resources["/assets/tiles/NS.png"].texture));
        }
        else if (choice == 2) {
            queue.push(new PIXI.Sprite(resources["/assets/tiles/NW.png"].texture));
        }
        else if (choice == 3) {
            queue.push(new PIXI.Sprite(resources["/assets/tiles/SE.png"].texture));
        }
        else if (choice == 4) {
            queue.push(new PIXI.Sprite(resources["/assets/tiles/SW.png"].texture));
        }
        else if (choice == 5) {
            queue.push(new PIXI.Sprite(resources["/assets/tiles/WE.png"].texture));
        }
    }

    queue[0].x = 0;
    queue[0].y = 0;
    queueContainer.addChild(queue[0]);

    queue[1].x = 0;
    queue[1].y = 120;
    queueContainer.addChild(queue[1]);

    queue[2].x = 0;
    queue[2].y = 200;
    queueContainer.addChild(queue[2]);

    queue[3].x = 0;
    queue[3].y = 280;
    queueContainer.addChild(queue[3]);


    function updateQueue() {
        queueContainer.removeChild(queue[0]);
        let ret = queue.shift();

        queue[0].x = 0;
        queue[0].y = 0;

        queue[1].x = 0;
        queue[1].y = 120;

        queue[2].x = 0;
        queue[2].y = 200;

        queue[3].x = 0;
        queue[3].y = 280;
        queueContainer.addChild(queue[3]);

        return ret;
    }



    // CARROTS
    let carrotContainer = new PIXI.Container();


    let carrots = [];
    for (let row = 0; row < boardHeight; row++) {
        carrots[row] = [];
        for (let col = 0; col < boardWidth; col++) {
            carrots[row][col] = undefined;
        }
    }
    for (let i = 0; i < numCarrots; i++) {
        do {
            var xtemp = Math.floor(Math.random() * boardWidth);
            var ytemp = Math.floor(Math.random() * boardHeight);

            var duplicate = false;

            if (xtemp == 0 && ytemp == 0) {
                duplicate = true;
            }
            if (carrots[ytemp][xtemp] != undefined) {
                duplicate = true;
            }
        } while (duplicate);

        carrots[ytemp][xtemp] = new PIXI.Sprite(resources["/assets/objects/carrot.png"].texture);
        carrots[ytemp][xtemp].x = xtemp * 80 + 20;
        carrots[ytemp][xtemp].y = ytemp * 80 + 20;
        carrotContainer.addChild(carrots[ytemp][xtemp])
    }

    let carrotCount = 0;




    // STONES
    let stoneContainer = new PIXI.Container();

    let stones = [];
    for (let row = 0; row < boardHeight; row++) {
        stones[row] = [];
        for (let col = 0; col < boardWidth; col++) {
            stones[row][col] = undefined;
        }
    }
    for (let i = 0; i < numStones; i++) {
        do {
            var xtemp = Math.floor(Math.random() * boardWidth);
            var ytemp = Math.floor(Math.random() * boardHeight);

            var duplicate = false;

            if ((xtemp == 0 || xtemp == 1) && ytemp == 0) {
                duplicate = true;
            }
            if (carrots[ytemp][xtemp] != undefined || stones[ytemp][xtemp] != undefined) {
                duplicate = true;
            }
        } while (duplicate);

        stones[ytemp][xtemp] = new PIXI.Sprite(resources["/assets/objects/stone.png"].texture);
        stones[ytemp][xtemp].x = xtemp * 80;
        stones[ytemp][xtemp].y = ytemp * 80;
        stoneContainer.addChild(stones[ytemp][xtemp])
    }




    // GAME BOARD CURSOR ("SELECT")
    let select = new PIXI.Sprite(resources["/assets/objects/x.png"].texture);

    let isPlaceable = false;
    function updateSelect() {
        let tempX = select.x / 80;
        let tempY = select.y / 80;
        if (isPlaceable && (board[tempY][tempX]._texture.textureCacheIds[0] != "/assets/tiles/E.png" || stones[tempY][tempX] != undefined)) {
            isPlaceable = false;
            select.texture = resources["/assets/objects/x.png"].texture
        }
        else if (!isPlaceable && (board[tempY][tempX]._texture.textureCacheIds[0] == "/assets/tiles/E.png" && stones[tempY][tempX] == undefined)) {
            isPlaceable = true;
            select.texture = resources["/assets/objects/select.png"].texture
        }
    }



    // PLAYER
    const player = new PIXI.Sprite(resources["/assets/objects/rabbit.png"].texture);


    let playerX = 0;
    let playerY = 0;
    let playerDirection = 'E';
    setPlayerPosition();

    // PLAYER FUNCTIONS
    function eatCarrot() {
        if (carrots[playerY][playerX] != undefined) {
            carrotContainer.removeChild(carrots[playerY][playerX]);
            carrots[playerY][playerX] = undefined;
            carrotCount++;
            carrotText.text = carrotCount;
            checkWin();
        }
    }

    function setPlayerPosition() {
        if (playerDirection == 'E') {
            player.rotation = Math.PI / 2;
            player.x = 80 * playerX + 60;
            player.y = 80 * playerY + 20;
        }
        else if (playerDirection == 'N') {
            player.rotation = 0;
            player.x = 80 * playerX + 20;
            player.y = 80 * playerY + 20;
        }
        else if (playerDirection == 'W') {
            player.rotation = 3 * Math.PI / 2;
            player.x = 80 * playerX + 20;
            player.y = 80 * playerY + 60;
        }
        else if (playerDirection == 'S') {
            player.rotation = Math.PI;
            player.x = 80 * playerX + 60;
            player.y = 80 * playerY + 60;
        }
    }

    let isWaiting = false;

    function updatePlayerCoords() {
        function overAndOver(xdiff, ydiff, newDir) {
            playerX += xdiff;
            playerY += ydiff;
            playerDirection = newDir;
            setPlayerPosition();
            eatCarrot();
            updatePlayerCoords();
        }

        if (!isWaiting) {
            isWaiting = true;
            setTimeout(
                function () {
                    isWaiting = false;
                    if (playerDirection == 'E') {
                        if (playerX + 1 < boardWidth) {
                            if (board[playerY][playerX + 1]._texture.textureCacheIds[0] == "/assets/tiles/NW.png") {
                                overAndOver(1, 0, 'N');
                            }
                            else if (board[playerY][playerX + 1]._texture.textureCacheIds[0] == "/assets/tiles/SW.png") {
                                overAndOver(1, 0, 'S');
                            }
                            else if (board[playerY][playerX + 1]._texture.textureCacheIds[0] == "/assets/tiles/WE.png") {
                                overAndOver(1, 0, 'E');
                            }
                        }
                    }
                    else if (playerDirection == 'N') {
                        if (playerY - 1 >= 0) {
                            if (board[playerY - 1][playerX]._texture.textureCacheIds[0] == "/assets/tiles/SW.png") {
                                overAndOver(0, -1, 'W');
                            }
                            else if (board[playerY - 1][playerX]._texture.textureCacheIds[0] == "/assets/tiles/SE.png") {
                                overAndOver(0, -1, 'E');
                            }
                            else if (board[playerY - 1][playerX]._texture.textureCacheIds[0] == "/assets/tiles/NS.png") {
                                overAndOver(0, -1, 'N');
                            }
                        }
                    }
                    else if (playerDirection == 'W') {
                        if (playerX - 1 >= 0) {
                            if (board[playerY][playerX - 1]._texture.textureCacheIds[0] == "/assets/tiles/NE.png") {
                                overAndOver(-1, 0, 'N');
                            }
                            else if (board[playerY][playerX - 1]._texture.textureCacheIds[0] == "/assets/tiles/SE.png") {
                                overAndOver(-1, 0, 'S');
                            }
                            else if (board[playerY][playerX - 1]._texture.textureCacheIds[0] == "/assets/tiles/WE.png") {
                                overAndOver(-1, 0, 'W');
                            }
                        }
                    }
                    else if (playerDirection == 'S') {
                        if (playerY + 1 < boardHeight) {
                            if (board[playerY + 1][playerX]._texture.textureCacheIds[0] == "/assets/tiles/NE.png") {
                                overAndOver(0, 1, 'E');
                            }
                            else if (board[playerY + 1][playerX]._texture.textureCacheIds[0] == "/assets/tiles/NW.png") {
                                overAndOver(0, 1, 'W');
                            }
                            else if (board[playerY + 1][playerX]._texture.textureCacheIds[0] == "/assets/tiles/NS.png") {
                                overAndOver(0, 1, 'S');
                            }
                        }
                    }
                }
                , hopSpeed);
        }
    }



    // POWERUPS
    //let 



    // INFOBAR
    let startTime = 0;
    let infobarContainer = new PIXI.Container();

    let infoCarrot = new PIXI.Sprite(resources["/assets/objects/carrot.png"].texture);
    infoCarrot.width = 50;
    infoCarrot.height = 50;
    infobarContainer.addChild(infoCarrot);

    let carrotText = new PIXI.Text(carrotCount, { fontFamily: ['DynaPuff'], fontSize: 56, fill: 0x444444, align: 'center' });
    carrotText.x = 50;
    infobarContainer.addChild(carrotText);


    let timer = new PIXI.Text("0:00", { fontFamily: ['DynaPuff'], fontSize: 56, fill: 0x444444, align: 'center' });
    timer.x = boardWidth * 80 - timer.width;

    function setTime() {
        if (startTime != 0) {
            let elapsed = (Date.now() - startTime) / 1000;
            let mins = Math.floor(elapsed / 60);
            let secs = String(Math.round(elapsed % 60)).padStart(2, '0');
            timer.text = mins + ":" + secs;
            timer.x = boardWidth * 80 - timer.width;
        }
    }

    infobarContainer.addChild(timer);
    let timerInterval = undefined;


    infobarContainer.x = boardX;
    infobarContainer.y = boardY - infobarContainer.height - 30;





    // WIN SCREEN
    let blackLayer = new PIXI.Container();

    let blackSprite = new PIXI.Sprite(resources['/assets/scene/black.jpg'].texture);
    blackSprite.alpha = 0.8;

    blackLayer.addChild(blackSprite);
    blackLayer.width = window.innerWidth;
    blackLayer.height = window.innerHeight;

    let winScreenContainer = new PIXI.Container();
    let margConst = 50;


    let outerBox = new PIXI.Sprite(resources['/assets/scene/winbackground.jpg'].texture);
    outerBox.width = 1100;
    outerBox.height = 550;
    winScreenContainer.addChild(outerBox);
    winScreenContainer.x = window.innerWidth / 2 - winScreenContainer.width / 2;
    winScreenContainer.y = window.innerHeight / 2 - winScreenContainer.height / 2;

    let winText = new PIXI.Text("you collected all the carrots", { fontFamily: 'DynaPuff', fontSize: 48, fill: 0x000000, align: 'right', wordWrap: true, wordWrapWidth: 420 });
    winText.x = winScreenContainer.width / 2 - winText.width - margConst;
    winText.y = 50
    winScreenContainer.addChild(winText);


    let resetButton = new PIXI.Sprite(resources["/assets/ui/resetunpressed.png"].texture);
    resetButton.height = 100;
    resetButton.length = 100;
    resetButton.x = winScreenContainer.width / 2 - resetButton.width - margConst;
    resetButton.y = 380;

    resetButton.interactive = true;
    resetButton.buttonMode = true;
    resetButton.on('mouseover', resetButtonMouseover);
    resetButton.on('mouseout', resetButtonMouseout);
    resetButton.on('click', resetButtonClick);

    function resetButtonMouseover() {
        resetButton.texture = resources["/assets/ui/resetpressed.png"].texture;
    }
    function resetButtonMouseout() {
        resetButton.texture = resources["/assets/ui/resetunpressed.png"].texture;
    }
    function resetButtonClick() {
        window.location.reload();
    }
    winScreenContainer.addChild(resetButton);


    let exitButton = new PIXI.Sprite(resources["/assets/ui/exitunpressed.png"].texture);
    exitButton.height = 100;
    exitButton.length = 100;
    exitButton.x = winScreenContainer.width / 2 - exitButton.width * 3 - margConst;
    exitButton.y = 380;

    exitButton.interactive = true;
    exitButton.buttonMode = true;
    exitButton.on('mouseover', exitButtonMouseover);
    exitButton.on('mouseout', exitButtonMouseout);
    exitButton.on('click', exitButtonClick);

    function exitButtonMouseover() {
        exitButton.texture = resources["/assets/ui/exitpressed.png"].texture;
    }
    function exitButtonMouseout() {
        exitButton.texture = resources["/assets/ui/exitunpressed.png"].texture;
    }
    function exitButtonClick() {
        location.href = '/';
    }
    winScreenContainer.addChild(exitButton);


    let blocksPlaced = 0;
    function checkWin() {
        if (carrotCount == numCarrots) {
            clearInterval(timerInterval);

            let elapsed = Math.floor((Date.now() - startTime) / 1000);
            let mins = Math.floor(elapsed / 60);
            let secs = String(elapsed % 60).padStart(2, '0');
            let timeText = new PIXI.Text("time: " + mins + ":" + secs, { fontFamily: 'DynaPuff', fontSize: 48, fill: 0x000000, align: 'center' });
            timeText.x = winScreenContainer.width / 2 - timeText.width - margConst;
            timeText.y = winText.y + winText.height + 60;
            winScreenContainer.addChild(timeText);

            let blockText = new PIXI.Text("blocks: " + blocksPlaced, { fontFamily: 'DynaPuff', fontSize: 48, fill: 0x000000, align: 'center' });
            blockText.x = winScreenContainer.width / 2 - blockText.width - margConst;
            blockText.y = winText.y + winText.height + blockText.height + 65;
            winScreenContainer.addChild(blockText);

            if (elapsed < highestTime || numEntries < 5) {

                let youWonText = new PIXI.Text("submit your highscore!!", { fontFamily: 'DynaPuff', fontSize: 24, fill: 0x000000, align: 'center' });
                youWonText.x = winScreenContainer.width / 2 + margConst;
                youWonText.y = 400
                winScreenContainer.addChild(youWonText);

                let input = new PIXI.TextInput({
                    input: {
                        font: 'DynaPuff',
                        fontSize: '24px',
                        padding: '10px',
                        width: '200px',
                        color: '#26272E'
                    },
                    box: {
                        default: { fill: 0xE8E9F3, rounded: 12, stroke: { color: 0xCBCEE0, width: 3 } },
                        focused: { fill: 0xE1E3EE, rounded: 12, stroke: { color: 0xABAFC6, width: 3 } },
                        disabled: { fill: 0xDBDBDB, rounded: 12 }
                    }
                })
                input.placeholder = "name";
                input.maxLength = 10;
                input.x = winScreenContainer.width / 2 + margConst;
                input.y = 430;
                winScreenContainer.addChild(input);

                let submitButton = new PIXI.Sprite(resources["/assets/ui/submitunpressed.png"].texture);
                submitButton.height = 50;
                submitButton.width = 50;
                submitButton.x = winScreenContainer.width / 2 + 300;
                submitButton.y = 430;

                submitButton.interactive = true;
                submitButton.buttonMode = true;
                submitButton.on('mouseover', submitButtonMouseover);
                submitButton.on('mouseout', submitButtonMouseout);
                submitButton.on('click', submitButtonClick);

                function submitButtonMouseover() {
                    submitButton.texture = resources["/assets/ui/submitpressed.png"].texture;
                }
                function submitButtonMouseout() {
                    submitButton.texture = resources["/assets/ui/submitunpressed.png"].texture;
                }
                function submitButtonClick() {
                    if (input.text != "") {
                        addScore(input.text, elapsed);
                        input.disabled = true;
                        winScreenContainer.removeChild(submitButton);
                    }
                }
                winScreenContainer.addChild(submitButton);
            }
            else {
                resetButton.x = winScreenContainer.width / 2 - resetButton.width - margConst;
                exitButton.x = winScreenContainer.width / 2 + margConst;
            }


            app.stage.addChild(blackLayer);
            app.stage.addChild(winScreenContainer);
        }
    }

    async function addScore(n, t) {
        const response = await fetch(url + '/addScore', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: n,
                time: t
            })
        });
        if (response.status == 200) {
            const response2 = await fetch(url + '/getScores');
            const json = await response2.json();

            for (let i = 0; i < 5; i++) {
                if (i < json.length) {
                    let mins = Math.floor(json[i].time / 60);
                    let secs = String(json[i].time % 60).padStart(2, '0');
                    let time = mins + ":" + secs;
                    leaderboardEntries[i].text = (i + 1) + ". " + json[i].name + " - " + time;
                }
                else {
                    leaderboardEntries[i].text = (i + 1) + ".";
                }
            }
        }
    }

    let highestTime = -1;
    let numEntries = 0;
    let leaderboardEntries = [];
    async function getLeaderboard() {
        const response = await fetch(url + '/getScores');
        const json = await response.json();

        let leaderboardText = new PIXI.Text("leaderboard:", { fontFamily: 'DynaPuff', fontSize: 48, fill: 0x000000, align: 'center' });
        leaderboardText.x = winScreenContainer.width / 2 + margConst;
        leaderboardText.y = 50
        winScreenContainer.addChild(leaderboardText);

        for (let i = 0; i < 5; i++) {
            let leaderboardEntryText = undefined;
            if (i < json.length) {
                if (json[i].time > highestTime) {
                    highestTime = json[i].time;
                }
                numEntries++;

                let mins = Math.floor(json[i].time / 60);
                let secs = String(json[i].time % 60).padStart(2, '0');
                let time = mins + ":" + secs;
                leaderboardEntryText = new PIXI.Text((i + 1) + ". " + json[i].name + " - " + time, { fontFamily: 'DynaPuff', fontSize: 36, fill: 0x000000, align: 'left' });
            }
            else {
                leaderboardEntryText = new PIXI.Text((i + 1) + ".", { fontFamily: 'DynaPuff', fontSize: 36, fill: 0x000000, align: 'left' });
            }
            leaderboardEntryText.x = winScreenContainer.width / 2 + margConst;
            leaderboardEntryText.y = 20 + leaderboardText.height + 40 + leaderboardEntryText.height * i;
            winScreenContainer.addChild(leaderboardEntryText);
            leaderboardEntries.push(leaderboardEntryText);
        }

        let timeResetText = new PIXI.Text("resets daily at 10am est", { fontFamily: 'DynaPuff', fontSize: 24, fill: 0x000000, align: 'center' });
        timeResetText.x = winScreenContainer.width / 2 + margConst;
        timeResetText.y = leaderboardEntries[4].y + leaderboardEntries[4].height + 5;
        winScreenContainer.addChild(timeResetText);
    }

    getLeaderboard();


    /*
    *
    * KEY LISTENERS
    *
    * */
    document.onkeydown = checkKey;


    function checkKey(e) {

        e = e || window.event;

        if (e.keyCode == '38' || e.keyCode == '87') {
            // up arrow or w
            if (select.y != 0) {
                select.y = select.y - 80;
            }
            updateSelect();
        }
        else if (e.keyCode == '40' || e.keyCode == '83') {
            // down arrow or s
            if (select.y != boardHeight * 80 - 80) {
                select.y = select.y + 80;
            }
            updateSelect();
        }
        else if (e.keyCode == '37' || e.keyCode == '65') {
            // left arrow or a
            if (select.x != 0) {
                select.x = select.x - 80;
            }
            updateSelect();
        }
        else if (e.keyCode == '39' || e.keyCode == '68') {
            // right arrow
            if (select.x != boardWidth * 80 - 80) {
                select.x = select.x + 80;
            }
            updateSelect();
        }
        else if (e.keyCode == '74' || e.keyCode == '32') {
            // j
            let row = select.y / 80;
            let col = select.x / 80;

            if (board[row][col]._texture.textureCacheIds[0] == "/assets/tiles/E.png" && stones[row][col] == undefined) {
                if (startTime == 0) {
                    startTime = Date.now();
                    timerInterval = setInterval(setTime, 1000);
                }

                board[row][col].texture = updateQueue().texture;

                updatePlayerCoords();
                updateSelect();

                blocksPlaced++;
            }
        }
        else if (e.keyCode == '75') {
            // k
            let row = select.y / 80;
            let col = select.x / 80;
            addBombs(col, row);
        }

    }


    //board edge
    let edgeContainer = boardEdges(resources["/assets/tiles/corner.png"].texture, resources["/assets/tiles/edge.png"].texture, boardHeight, boardWidth, queueX, queueY);


    // queue edge
    let queueEdgeContainer = queueEdges(resources["/assets/tiles/corner.png"].texture, resources["/assets/tiles/edge.png"].texture, boardHeight, boardWidth, queueX, queueY);





    boardContainer.addChild(tileContainer);
    boardContainer.addChild(carrotContainer);
    boardContainer.addChild(stoneContainer);
    boardContainer.addChild(player);
    boardContainer.addChild(bombsContainer);
    boardContainer.addChild(select);
    boardContainer.addChild(edgeContainer);

    queueContainer.addChild(queueEdgeContainer);

    app.stage.addChild(background);
    app.stage.addChild(queueContainer);
    app.stage.addChild(boardContainer);
    app.stage.addChild(infobarContainer);

}


