const EMPTY = PIXI.Texture.from('assets/tiles/EMPTY.png');
const NW = PIXI.Texture.from('assets/tiles/NW.png');
const SW = PIXI.Texture.from('assets/tiles/SW.png');
const SE = PIXI.Texture.from('assets/tiles/SE.png');
const NE = PIXI.Texture.from('assets/tiles/NE.png');
const NS = PIXI.Texture.from('assets/tiles/NS.png');
const WE = PIXI.Texture.from('assets/tiles/WE.png');

const BACKGROUND = PIXI.Texture.from('assets/scene/BACKGROUND.jpeg');

const boardWidth = 8;
const boardHeight = 10;
const boardX = 200;
const boardY = 100;

const queueX = 60;
const queueY = 150;

/*PIXI.Loader.shared
    .add(["assets/tiles/EMPTY.png",
        "assets/tiles/NW.png",
        "assets/tiles/SW.png",
        "assets/tiles/SE.png",
        "assets/tiles/NE.png",
        "assets/tiles/NS.png",
        "assets/tiles/WE.png",
        "assets/scene/BACKGROUND.jpeg"
    ])
    .load(setup);*/

gameSetup();


function gameSetup() {

    // Create the application helper and add its render target to the page
    let app = new PIXI.Application({ width: 1600, height: 1000 });
    document.body.appendChild(app.view);

    // Create the sprite and add it to the stage
    let sprite = PIXI.Sprite.from("assets/scene/BACKGROUND.jpeg");
    sprite.width = 1600;
    sprite.height = 1000;
    app.stage.addChild(sprite);




    // [row][col]
    const boardContainer = new PIXI.Container();
    app.stage.addChild(boardContainer);
    boardContainer.x = boardX;
    boardContainer.y = boardY;

    // fill board with empty tiles
    let board = [];
    for (let row = 0; row < boardHeight; row++) {
        rowArr = [];
        for (let col = 0; col < boardWidth; col++) {
            const spr = PIXI.Sprite.from('assets/tiles/EMPTY.png');
            spr.x = col * 80;
            spr.y = row * 80;
            boardContainer.addChild(spr);
            rowArr.push(spr);
        }
        board.push(rowArr);
    }


    boardContainer.removeChild(board[0][0]);
    board[0][0] = PIXI.Sprite.from("assets/tiles/NE.png");
    boardContainer.addChild(board[0][0]);


    // GAME BOARD CURSOR ("SELECT")
    let select = PIXI.Sprite.from("assets/objects/SELECT.png");
    select.x = boardX;
    select.y = boardY;
    app.stage.addChild(select);





    // QUEUE
    let queueContainer = new PIXI.Container();
    queueContainer.x = queueX;
    queueContainer.y = queueY;
    app.stage.addChild(queueContainer);


    let queue = [];
    for (let i = 0; i < 100; i++) {
        choice = Math.floor(Math.random() * 6);
        if (choice == 0) {
            queue.push(PIXI.Sprite.from("assets/tiles/NE.png"));
        }
        else if (choice == 1) {
            queue.push(PIXI.Sprite.from("assets/tiles/NS.png"));
        }
        else if (choice == 2) {
            queue.push(PIXI.Sprite.from("assets/tiles/NW.png"));
        }
        else if (choice == 3) {
            queue.push(PIXI.Sprite.from("assets/tiles/SE.png"));
        }
        else if (choice == 4) {
            queue.push(PIXI.Sprite.from("assets/tiles/SW.png"));
        }
        else if (choice == 5) {
            queue.push(PIXI.Sprite.from("assets/tiles/WE.png"));
        }
    }

    queue[0].x = 0;
    queue[0].y = 0;
    queueContainer.addChild(queue[0]);

    queue[1].x = 0;
    queue[1].y = 160;
    queueContainer.addChild(queue[1]);

    queue[2].x = 0;
    queue[2].y = 320;
    queueContainer.addChild(queue[2]);

    queue[3].x = 0;
    queue[3].y = 480;
    queueContainer.addChild(queue[3]);


    function updateQueue() {
        queueContainer.removeChild(queue[0]);
        let ret = queue.shift();

        queue[0].x = 0;
        queue[0].y = 0;

        queue[1].x = 0;
        queue[1].y = 160;

        queue[2].x = 0;
        queue[2].y = 320;

        queue[3].x = 0;
        queue[3].y = 480;
        queueContainer.addChild(queue[3]);

        return ret;
    }


    // CARROTS
    let carrotContainer = new PIXI.Container();
    carrotContainer.x = boardX;
    carrotContainer.y = boardY;
    app.stage.addChild(carrotContainer);

    carrots = [];
    for (let i = 0; i < 15; i++) {
        do {
            var xtemp = Math.floor(Math.random() * boardWidth);
            var ytemp = Math.floor(Math.random() * boardWidth);

            var duplicate = false;
            for (let j = 0; j < carrots.length; j++) {
                if(carrots[j].x == xtemp && carrots[j].y == ytemp){
                    duplicate = true;
                }
            }
        } while (duplicate);

        carrots[i] = PIXI.Sprite.from("assets/objects/carrot.jpg");
        carrots[i].x = xtemp * 80 + 20;
        carrots[i].y = ytemp * 80 + 20;
        carrotContainer.addChild(carrots[i])
    }



    // PLAYER
    const player = PIXI.Sprite.from("assets/objects/rabbit.jpg");
    app.stage.addChild(player);

    let playerX = 0;
    let playerY = 0;
    let playerDirection = 'E';
    let temp = playerCoords();
    player.x = temp[0];
    player.y = temp[1];

    // PLAYER FUNCTIONS
    function playerCoords() {
        if (playerDirection == 'E') {
            return [boardX + 80 * playerX + 50, boardY + 80 * playerY + 20];
        }
        else if (playerDirection == 'N') {
            return [boardX + 80 * playerX + 20, boardY + 80 * playerY - 10];
        }
        else if (playerDirection == 'W') {
            return [boardX + 80 * playerX - 10, boardY + 80 * playerY + 20];
        }
        else if (playerDirection == 'S') {
            return [boardX + 80 * playerX + 20, boardY + 80 * playerY + 50];
        }
        else {
            return [0, 0];
        }
    }

    function updatePlayerCoords() {
        if (playerDirection == 'E') {
            if (playerX + 1 < boardWidth) {
                if (board[playerY][playerX + 1]._texture.textureCacheIds[0] == "assets/tiles/NW.png") {
                    playerX = playerX + 1;
                    playerDirection = 'N';
                    updatePlayerCoords();
                }
                else if (board[playerY][playerX + 1]._texture.textureCacheIds[0] == "assets/tiles/SW.png") {
                    playerX = playerX + 1;
                    playerDirection = 'S';
                    updatePlayerCoords();
                }
                else if (board[playerY][playerX + 1]._texture.textureCacheIds[0] == "assets/tiles/WE.png") {
                    playerX = playerX + 1;
                    playerDirection = 'E';
                    updatePlayerCoords();
                }
            }
        }
        else if (playerDirection == 'N') {
            if (playerY - 1 >= 0) {
                if (board[playerY - 1][playerX]._texture.textureCacheIds[0] == "assets/tiles/SW.png") {
                    playerY = playerY - 1;
                    playerDirection = 'W';
                    updatePlayerCoords();
                }
                else if (board[playerY - 1][playerX]._texture.textureCacheIds[0] == "assets/tiles/SE.png") {
                    playerY = playerY - 1;
                    playerDirection = 'E';
                    updatePlayerCoords();
                }
                else if (board[playerY - 1][playerX]._texture.textureCacheIds[0] == "assets/tiles/NS.png") {
                    playerY = playerY - 1;
                    playerDirection = 'N';
                    updatePlayerCoords();
                }
            }
        }
        else if (playerDirection == 'W') {
            if (playerX - 1 >= 0) {
                if (board[playerY][playerX - 1]._texture.textureCacheIds[0] == "assets/tiles/NE.png") {
                    playerX = playerX - 1;
                    playerDirection = 'N';
                    updatePlayerCoords();
                }
                else if (board[playerY][playerX - 1]._texture.textureCacheIds[0] == "assets/tiles/SE.png") {
                    playerX = playerX - 1;
                    playerDirection = 'S';
                    updatePlayerCoords();
                }
                else if (board[playerY][playerX - 1]._texture.textureCacheIds[0] == "assets/tiles/WE.png") {
                    playerX = playerX - 1;
                    playerDirection = 'W';
                    updatePlayerCoords();
                }
            }
        }
        else if (playerDirection == 'S') {
            if (playerY + 1 < boardHeight) {
                if (board[playerY + 1][playerX]._texture.textureCacheIds[0] == "assets/tiles/NE.png") {
                    playerY = playerY + 1;
                    playerDirection = 'E';
                    updatePlayerCoords();
                }
                else if (board[playerY + 1][playerX]._texture.textureCacheIds[0] == "assets/tiles/NW.png") {
                    playerY = playerY + 1;
                    playerDirection = 'W';
                    updatePlayerCoords();
                }
                else if (board[playerY + 1][playerX]._texture.textureCacheIds[0] == "assets/tiles/NS.png") {
                    playerY = playerY + 1;
                    playerDirection = 'S';
                    updatePlayerCoords();
                }
            }
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
            if (select.y != boardY) {
                select.y = select.y - 80;
            }
        }
        else if (e.keyCode == '40' || e.keyCode == '83') {
            // down arrow or s
            if (select.y != boardY + boardHeight * 80 - 80) {
                select.y = select.y + 80;
            }
        }
        else if (e.keyCode == '37' || e.keyCode == '65') {
            // left arrow or a
            if (select.x != boardX) {
                select.x = select.x - 80;
            }
        }
        else if (e.keyCode == '39' || e.keyCode == '68') {
            // right arrow
            if (select.x != boardX + boardWidth * 80 - 80) {
                select.x = select.x + 80;
            }
        }
        else if (e.keyCode == '74') {
            // j
            row = (select.y - boardY) / 80;
            col = (select.x - boardX) / 80;

            if (board[row][col]._texture.textureCacheIds[0] == "assets/tiles/EMPTY.png") {
                boardContainer.removeChild(board[row][col]);
                board[row][col] = updateQueue();
                board[row][col].x = col * 80;
                board[row][col].y = row * 80;
                boardContainer.addChild(board[row][col]);

                updatePlayerCoords();
                temp = playerCoords();
                player.x = temp[0];
                player.y = temp[1];
            }
        }

    }
}

