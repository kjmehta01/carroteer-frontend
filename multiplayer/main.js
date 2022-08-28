//const io = require('socket.io-client');
import { boardEdges, queueEdges } from './borders.js';

WebFont.load({
    google: {
        families: ['DynaPuff']
    }
});

const url = 'http://localhost:5000';
//const url = 'https://carroteer-backend.herokuapp.com';

const boardWidth = 5;
const boardHeight = 8;
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


//multiplayer setup
const socket = io.connect(url, {
    port: 5000
});

socket.on('connect', function () {
    console.log("socket connected");

    /*socket.on('test', () => {
        console.log('test');
    });*/



    let app = new PIXI.Application({
        width: window.innerWidth,
        height: window.innerHeight
    });

    document.body.appendChild(app.view);

    app.loader
        .add("assets/scene/background.jpeg")
        .add("assets/scene/winbackground.jpg")
        .add("assets/scene/black.jpg")
        .add("assets/objects/bomb.png")
        .add("assets/objects/carrot.png")
        .add("assets/objects/stone.png")
        .add("assets/objects/rabbit.png")
        .add("assets/objects/select.png")
        .add("assets/objects/x.png")
        .add("assets/tiles/E.png")
        .add("assets/tiles/NE.png")
        .add("assets/tiles/NS.png")
        .add("assets/tiles/NW.png")
        .add("assets/tiles/SE.png")
        .add("assets/tiles/SW.png")
        .add("assets/tiles/WE.png")
        .add("assets/tiles/edge.png")
        .add("assets/tiles/corner.png")
        .add("assets/ui/exitpressed.png")
        .add("assets/ui/exitunpressed.png")
        .add("assets/ui/resetpressed.png")
        .add("assets/ui/resetunpressed.png")
        .add("assets/ui/submitpressed.png")
        .add("assets/ui/submitunpressed.png")
        .load(setup);

    function setup() {
        let resources = app.loader.resources;

        // Create the background and add it to the stage
        let background = new PIXI.Sprite(resources["assets/scene/background.jpeg"].texture);
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

                    boardContainer.x = window.innerWidth / 2 - (boardWidth * 80 / 2);
                    infobarContainer.x = boardContainer.x;
                    queueContainer.x = boardContainer.x - 120;
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
                const spr = new PIXI.Sprite(resources["assets/tiles/E.png"].texture);
                spr.x = col * 80;
                spr.y = row * 80;
                tileContainer.addChild(spr);
                rowArr.push(spr);
            }
            board.push(rowArr);
        }


        //board[0][0].texture = resources["assets/tiles/NE.png"].texture;

        function removeTile(x, y) {
            board[x][y].texture = resources["assets/tiles/E.png"].texture;
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
                        bombs[row][col] = new PIXI.Sprite(resources["assets/objects/bomb.png"].texture);
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
                queue.push(new PIXI.Sprite(resources["assets/tiles/NE.png"].texture));
            }
            else if (choice == 1) {
                queue.push(new PIXI.Sprite(resources["assets/tiles/NS.png"].texture));
            }
            else if (choice == 2) {
                queue.push(new PIXI.Sprite(resources["assets/tiles/NW.png"].texture));
            }
            else if (choice == 3) {
                queue.push(new PIXI.Sprite(resources["assets/tiles/SE.png"].texture));
            }
            else if (choice == 4) {
                queue.push(new PIXI.Sprite(resources["assets/tiles/SW.png"].texture));
            }
            else if (choice == 5) {
                queue.push(new PIXI.Sprite(resources["assets/tiles/WE.png"].texture));
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




        // GAME BOARD CURSOR ("SELECT")
        let select = new PIXI.Sprite(resources["assets/objects/x.png"].texture);

        let isPlaceable = false;
        function updateSelect() {
            let tempX = select.x / 80;
            let tempY = select.y / 80;
            if (isPlaceable && (board[tempY][tempX]._texture.textureCacheIds[0] != "assets/tiles/E.png" || stones[tempY][tempX] != undefined)) {
                isPlaceable = false;
                select.texture = resources["assets/objects/x.png"].texture
            }
            else if (!isPlaceable && (board[tempY][tempX]._texture.textureCacheIds[0] == "assets/tiles/E.png" && stones[tempY][tempX] == undefined)) {
                isPlaceable = true;
                select.texture = resources["assets/objects/select.png"].texture
            }
        }



        // PLAYER
        const player = new PIXI.Sprite(resources["assets/objects/rabbit.png"].texture);

        let playerX = 0;
        let playerY = 0;
        let playerDirection = 'E';
        setPlayerPosition();

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



        // POWERUPS
        //let 



        // INFOBAR
        let startTime = 0;
        let infobarContainer = new PIXI.Container();

        let infoCarrot = new PIXI.Sprite(resources["assets/objects/carrot.png"].texture);
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

                if (board[row][col]._texture.textureCacheIds[0] == "assets/tiles/E.png" && stones[row][col] == undefined) {
                    if (startTime == 0) {
                        startTime = Date.now();
                        timerInterval = setInterval(setTime, 1000);
                    }

                    //board[row][col].texture = updateQueue().texture;

                    //blocksPlaced++;

                    let texture = updateQueue()._texture.textureCacheIds[0];
                    if (texture == "assets/tiles/NE.png") {
                        socket.emit('place piece', row, col, 'NE');
                    }
                    else if (texture == "assets/tiles/SE.png") {
                        socket.emit('place piece', row, col, 'SE');
                    }
                    else if (texture == "assets/tiles/NW.png") {
                        socket.emit('place piece', row, col, 'NW');
                    }
                    else if (texture == "assets/tiles/SW.png") {
                        socket.emit('place piece', row, col, 'SW');
                    }
                    else if (texture == "assets/tiles/NS.png") {
                        socket.emit('place piece', row, col, 'NS');
                    }
                    else if (texture == "assets/tiles/WE.png") {
                        socket.emit('place piece', row, col, 'WE');
                    }
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
        let edgeContainer = boardEdges(resources["assets/tiles/corner.png"].texture, resources["assets/tiles/edge.png"].texture, boardHeight, boardWidth, queueX, queueY);


        // queue edge
        let queueEdgeContainer = queueEdges(resources["assets/tiles/corner.png"].texture, resources["assets/tiles/edge.png"].texture, boardHeight, boardWidth, queueX, queueY);





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



        socket.on('opp disconnect', () => {
            console.log('opp disconnect');
        });

        socket.on('board', (myboard, mycarrots, mystones, p1x, p1y, p1dir, p1count, p2x, p2y, p2dir, p2count) => {
            console.log('board received');
            for (let row = 0; row < boardHeight; row++) {
                for (let col = 0; col < boardWidth; col++) {
                    board[row][col].texture = resources['assets/tiles/' + myboard[row][col] + '.png'].texture;

                    if (mycarrots[row][col] && carrots[row][col] == undefined) {
                        carrots[row][col] = new PIXI.Sprite(resources["assets/objects/carrot.png"].texture);
                        carrots[row][col].x = col * 80 + 20;
                        carrots[row][col].y = row * 80 + 20;
                        carrotContainer.addChild(carrots[row][col])
                    }
                    else if (!mycarrots[row][col] && carrots[row][col] != undefined) {
                        carrotContainer.removeChild(carrots[row][col]);
                        carrots[row][col] = undefined;
                    }

                    if (mystones[row][col] && stones[row][col] == undefined) {
                        stones[row][col] = new PIXI.Sprite(resources["assets/objects/stone.png"].texture);
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

            playerX = p1x;
            playerY = p1y;
            playerDirection = p1dir;
            carrotCount = p1count;
            //updatePlayerCoords();
            updateSelect();
        });

    }


});