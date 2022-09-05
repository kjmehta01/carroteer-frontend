//const io = require('socket.io-client');
import { boardEdges, queueEdges } from './borders.js';

WebFont.load({
    google: {
        families: ['DynaPuff']
    }
});

const url = 'http://localhost:5000';
//const url = 'https://carroteer-backend.herokuapp.com';

const boardWidth = 8;
const boardHeight = 8;
//const boardX = 200;
const boardY = 150;
const boardX = window.innerWidth / 2 - (boardWidth * 80 / 2) - 50;

const queueX = boardX - 120;
const queueY = 200;

const bombDuration = 2000;

let p1p2 = 'p2';
let frozen = false;
let started = false;

//multiplayer setup
const socket = io.connect(url, {
    port: 5000
});

socket.on('connect', function () {
    console.log("socket connected");


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
        .add("/assets/tiles/red.png")
        .add("/assets/tiles/blue.png")
        .add("/assets/tiles/purple.png")
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
                    app.renderer.resize(window.innerWidth, window.innerHeight);

                    background.width = app.screen.width;
                    background.height = app.screen.height;

                    boardContainer.x = window.innerWidth / 2 - (boardWidth * 80 / 2);

                    infobarContainer.x = boardContainer.x;

                    queueContainer.x = boardContainer.x - 120;

                    p1BarContainer.x = boardContainer.x + 80 * boardWidth + 25;
                    p2BarContainer.x = boardContainer.x + 80 * boardWidth + 25;
                }, 100);
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
        board[boardHeight - 1][boardWidth - 1].texture = resources["/assets/tiles/SW.png"].texture;

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

        function viewQueue() {
            return queue[0];
        }

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

        let p1CarrotCount = 0;
        let p2CarrotCount = 0;




        // STONES
        let stoneContainer = new PIXI.Container();

        let stones = [];
        for (let row = 0; row < boardHeight; row++) {
            stones[row] = [];
            for (let col = 0; col < boardWidth; col++) {
                stones[row][col] = undefined;
            }
        }




        // GAME BOARD CURSOR ("SELECT")
        let select = new PIXI.Sprite(resources["/assets/objects/x.png"].texture);
        select.x = boardWidth * 80 - 80;
        select.y = boardHeight * 80 - 80;

        let isPlaceable = false;
        function updateSelect() {
            let tempX = select.x / 80;
            let tempY = select.y / 80;
            if (isPlaceable && (board[tempY][tempX]._texture.textureCacheIds[0] != "/assets/tiles/E.png" || stones[tempY][tempX] != undefined || haze[tempY][tempX] != undefined)) {
                isPlaceable = false;
                select.texture = resources["/assets/objects/x.png"].texture
            }
            else if (!isPlaceable && (board[tempY][tempX]._texture.textureCacheIds[0] == "/assets/tiles/E.png" && stones[tempY][tempX] == undefined && haze[tempY][tempX] == undefined)) {
                isPlaceable = true;
                select.texture = resources["/assets/objects/select.png"].texture
            }
        }



        // PLAYER
        const player1 = new PIXI.Sprite(resources["/assets/objects/rabbit.png"].texture);

        let player1X = 0;
        let player1Y = 0;
        let player1Direction = 'E';
        setPlayerPosition(player1, player1X, player1Y, player1Direction);

        const player2 = new PIXI.Sprite(resources["/assets/objects/rabbit.png"].texture);

        let player2X = boardWidth - 1;
        let player2Y = boardHeight - 1;
        let player2Direction = 'W';
        setPlayerPosition(player2, player2X, player2Y, player2Direction);

        function setPlayerPosition(player, playerX, playerY, playerDirection) {
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



        // POWERUPS
        //let 



        // INFOBAR
        let startTime = 0;
        let infobarContainer = new PIXI.Container();

        let timer = new PIXI.Text("0:00", { fontFamily: ['DynaPuff'], fontSize: 56, fill: 0x444444, align: 'center' });

        function setTime() {
            if (startTime != 0) {
                let elapsed = (Date.now() - startTime) / 1000;
                let mins = Math.floor(elapsed / 60);
                let secs = String(Math.round(elapsed % 60)).padStart(2, '0');
                timer.text = mins + ":" + secs;
            }
        }

        infobarContainer.addChild(timer);
        let timerInterval = undefined;


        infobarContainer.x = boardX;
        infobarContainer.y = boardY - infobarContainer.height - 30;

        // PLAYER 1 Bar
        let p1BarContainer = new PIXI.Container();

        let p1Text = new PIXI.Text("Player 1", { fontFamily: ['DynaPuff'], fontSize: 36, fill: 0x444444, align: 'center' });
        p1BarContainer.addChild(p1Text);

        let infoCarrot = new PIXI.Sprite(resources["/assets/objects/carrot.png"].texture);
        infoCarrot.width = 30;
        infoCarrot.height = 30;
        infoCarrot.y = p1Text.height;
        p1BarContainer.addChild(infoCarrot);

        let carrotText1 = new PIXI.Text(p1CarrotCount, { fontFamily: ['DynaPuff'], fontSize: 36, fill: 0x444444, align: 'center' });
        carrotText1.x = 30;
        carrotText1.y = p1Text.height - 6;
        p1BarContainer.addChild(carrotText1);

        p1BarContainer.x = boardX + 80 * boardWidth + 25;
        p1BarContainer.y = boardY;

        // PLAYER 2 Bar
        let p2BarContainer = new PIXI.Container();

        let p2Text = new PIXI.Text("Player 2", { fontFamily: ['DynaPuff'], fontSize: 36, fill: 0x444444, align: 'center' });
        p2BarContainer.addChild(p2Text);

        let info2Carrot = new PIXI.Sprite(resources["/assets/objects/carrot.png"].texture);
        info2Carrot.width = 30;
        info2Carrot.height = 30;
        info2Carrot.y = p2Text.height;
        p2BarContainer.addChild(info2Carrot);

        let carrotText2 = new PIXI.Text(p2CarrotCount, { fontFamily: ['DynaPuff'], fontSize: 36, fill: 0x444444, align: 'center' });
        carrotText2.x = 30;
        carrotText2.y = p2Text.height - 6;
        p2BarContainer.addChild(carrotText2);

        p2BarContainer.x = boardX + 80 * boardWidth + 25;
        p2BarContainer.y = boardY + 80 * boardHeight - p2BarContainer.height;



        // HAZE
        let hazeContainer = new PIXI.Container();

        let haze;
        function initializeHaze(p1p2) {
            console.log(p1p2);
            haze = [];
            for (let row = 0; row < boardHeight; row++) {
                let rowArr = [];
                for (let col = 0; col < boardWidth; col++) {
                    if (p1p2 == 'p2' && row < boardHeight / 2) {
                        let spr = new PIXI.Sprite(resources["/assets/tiles/red.png"].texture);
                        spr.alpha = 0.5;
                        spr.x = col * 80;
                        spr.y = row * 80;
                        hazeContainer.addChild(spr);
                        rowArr.push(spr);
                    }
                    else if (p1p2 == 'p1' && row >= boardHeight / 2) {
                        let spr = new PIXI.Sprite(resources["/assets/tiles/red.png"].texture);
                        spr.alpha = 0.5;
                        spr.x = col * 80;
                        spr.y = row * 80;
                        hazeContainer.addChild(spr);
                        rowArr.push(spr);
                    }
                    else {
                        rowArr.push(undefined);
                    }
                }
                haze.push(rowArr);
            }
        }

        function updateHaze(p1p2) {
            for (let row = 0; row < boardHeight; row++) {
                for (let col = 0; col < boardWidth; col++) {
                    if (p1p2 == 'p2') {
                        // opponent is on tile
                        if (player1X == col && player1Y == row) {
                            makeRed(row, col)
                        }
                        // you are near tile
                        else if (Math.abs(player2X - col) < 2 && Math.abs(player2Y - row) < 2) {
                            makeClear(row, col)
                        }
                        // they are near tile
                        else if (Math.abs(player1X - col) < 2 && Math.abs(player1Y - row) < 2) {
                            makeRed(row, col)
                        }
                        // their half
                        else if (row < boardHeight / 2) {
                            makeRed(row, col)
                        }
                        // your half
                        else {
                            makeClear(row, col)
                        }
                    }
                    else if (p1p2 == 'p1') {
                        // opponent is on tile
                        if (player2X == col && player2Y == row) {
                            makeRed(row, col)
                        }
                        // you are near tile
                        else if (Math.abs(player1X - col < 2) && Math.abs(player1Y - row) < 2) {
                            makeClear(row, col)
                        }
                        // they are near tile
                        else if (Math.abs(player2X - col < 2) && Math.abs(player2Y - row) < 2) {
                            makeRed(row, col)
                        }
                        // their half
                        else if (row >= boardHeight / 2) {
                            makeRed(row, col)
                        }
                        // your half
                        else {
                            makeClear(row, col)
                        }
                    }
                    else {
                        console.log('api call error, neither p1 nor p2?')
                    }
                }
            }
        }

        function makeRed(row, col) {
            if (haze[row][col] == undefined) {
                let spr = new PIXI.Sprite(resources["/assets/tiles/red.png"].texture);
                spr.alpha = 0.5;
                spr.x = col * 80;
                spr.y = row * 80;
                hazeContainer.addChild(spr);
                haze[row][col] = spr;
            }
        }

        function makeClear(row, col) {
            if (haze[row][col] != undefined) {
                hazeContainer.removeChild(haze[row][col]);
                haze[row][col] = undefined;
            }
        }




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

                if (board[row][col]._texture.textureCacheIds[0] == "/assets/tiles/E.png" && stones[row][col] == undefined && haze[row][col] == undefined && !frozen) {
                    //board[row][col].texture = updateQueue().texture;

                    //blocksPlaced++;

                    let texture = viewQueue()._texture.textureCacheIds[0];
                    if (texture == "/assets/tiles/NE.png") {
                        socket.emit('place piece', row, col, 'NE');
                    }
                    else if (texture == "/assets/tiles/SE.png") {
                        socket.emit('place piece', row, col, 'SE');
                    }
                    else if (texture == "/assets/tiles/NW.png") {
                        socket.emit('place piece', row, col, 'NW');
                    }
                    else if (texture == "/assets/tiles/SW.png") {
                        socket.emit('place piece', row, col, 'SW');
                    }
                    else if (texture == "/assets/tiles/NS.png") {
                        socket.emit('place piece', row, col, 'NS');
                    }
                    else if (texture == "/assets/tiles/WE.png") {
                        socket.emit('place piece', row, col, 'WE');
                    }

                    frozen = true;
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
        boardContainer.addChild(player1);
        boardContainer.addChild(player2);
        boardContainer.addChild(bombsContainer);
        boardContainer.addChild(hazeContainer);
        boardContainer.addChild(select);
        boardContainer.addChild(edgeContainer);

        queueContainer.addChild(queueEdgeContainer);

        app.stage.addChild(background);
        app.stage.addChild(queueContainer);
        app.stage.addChild(boardContainer);
        app.stage.addChild(infobarContainer);
        app.stage.addChild(p1BarContainer);
        app.stage.addChild(p2BarContainer);



        socket.on('opp disconnect', () => {
            console.log('opp disconnect');
        });

        socket.on('p1', () => {
            p1p2 = 'p1';
            select.x = 0;
            select.y = 0;
            updateSelect();
        });

        socket.on('board', (myboard, mycarrots, mystones, p1x, p1y, p1dir, p1count, p2x, p2y, p2dir, p2count) => {
            if (startTime == 0) {
                startTime = Date.now();
                timerInterval = setInterval(setTime, 1000);
            }
            if (haze == undefined) {
                initializeHaze(p1p2);
            }

            for (let row = 0; row < boardHeight; row++) {
                for (let col = 0; col < boardWidth; col++) {
                    board[row][col].texture = resources['/assets/tiles/' + myboard[row][col] + '.png'].texture;

                    if (mycarrots[row][col] && carrots[row][col] == undefined) {
                        carrots[row][col] = new PIXI.Sprite(resources["/assets/objects/carrot.png"].texture);
                        carrots[row][col].x = col * 80 + 20;
                        carrots[row][col].y = row * 80 + 20;
                        carrotContainer.addChild(carrots[row][col])
                    }
                    else if (!mycarrots[row][col] && carrots[row][col] != undefined) {
                        carrotContainer.removeChild(carrots[row][col]);
                        carrots[row][col] = undefined;
                    }

                    if (mystones[row][col] && stones[row][col] == undefined) {
                        stones[row][col] = new PIXI.Sprite(resources["/assets/objects/stone.png"].texture);
                        stones[row][col].x = col * 80;
                        stones[row][col].y = row * 80;
                        stoneContainer.addChild(stones[row][col])
                    }
                    else if (!mystones[row][col] && stones[row][col] != undefined) {
                        stoneContainer.removeChild(stones[row][col]);
                        stones[row][col] = undefined;
                    }
                }
            }

            player1X = p1x;
            player1Y = p1y;
            player1Direction = p1dir;
            player2X = p2x;
            player2Y = p2y;
            player2Direction = p2dir;
            p1CarrotCount = p1count;
            p2CarrotCount = p2count;
            carrotText1.text = p1CarrotCount;
            carrotText2.text = p2CarrotCount;
            setPlayerPosition(player1, player1X, player1Y, player1Direction);
            setPlayerPosition(player2, player2X, player2Y, player2Direction);
            updateHaze(p1p2);
            updateSelect();
        });

        socket.on('place success', () => {
            updateQueue();
            frozen = false;
        });

    }


});