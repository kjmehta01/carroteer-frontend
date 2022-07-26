const boardWidth = 10;
const boardHeight = 8;
//const boardX = 200;
const boardY = 200;
const boardX = window.innerWidth / 2 - (boardWidth * 80 / 2);

const queueX = boardX - 140;
const queueY = 240;

const infobarX = boardX;
const infobarY = 50;

const bombDuration = 2000;
const hopSpeed = 1000;

let app = new PIXI.Application({
    width: window.innerWidth,
    height: window.innerHeight
});

document.body.appendChild(app.view);

app.loader
    .add("assets/scene/background.jpeg")
    .add("assets/objects/bomb.png")
    .add("assets/objects/carrot.png")
    .add("assets/objects/rabbit.png")
    .add("assets/objects/select.png")
    .add("assets/objects/x.png")
    .add("assets/tiles/EMPTY.png")
    .add("assets/tiles/NE.png")
    .add("assets/tiles/NS.png")
    .add("assets/tiles/NW.png")
    .add("assets/tiles/SE.png")
    .add("assets/tiles/SW.png")
    .add("assets/tiles/WE.png")
    .load(setup);

function setup() {
    let resources = app.loader.resources;

    // Create the background and add it to the stage
    let background = new PIXI.Sprite(resources["assets/scene/background.jpeg"].texture);
    background.width = window.innerWidth;
    background.height = window.innerHeight;

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
                queueContainer.x = boardContainer.x - 140;
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
            const spr = new PIXI.Sprite(resources["assets/tiles/EMPTY.png"].texture);
            spr.x = col * 80;
            spr.y = row * 80;
            tileContainer.addChild(spr);
            rowArr.push(spr);
        }
        board.push(rowArr);
    }


    board[0][0].texture = resources["assets/tiles/NE.png"].texture;

    function removeTile(x, y) {
        board[x][y].texture = resources["assets/tiles/EMPTY.png"].texture;
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
                if (row >= 0 && row < boardHeight && col >= 0 && col < boardWidth && bombs[row][col] == undefined && !(row == 0 && col == 0)) {
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
    for (let i = 0; i < 100; i++) {
        choice = Math.floor(Math.random() * 6);
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


    let carrots = [];
    for (let row = 0; row < boardHeight; row++) {
        carrots[row] = [];
        for (let col = 0; col < boardWidth; col++) {
            carrots[row][col] = undefined;
        }
    }
    for (let i = 0; i < 15; i++) {
        do {
            var xtemp = Math.floor(Math.random() * boardWidth);
            var ytemp = Math.floor(Math.random() * boardHeight);

            var duplicate = false;

            if (xtemp == 0 && ytemp == 0) {
                duplicate = true;
            }
            for (let j = 0; j < carrots.length; j++) {
                if (carrots[ytemp][xtemp] != undefined) {
                    duplicate = true;
                }
            }
        } while (duplicate);

        carrots[ytemp][xtemp] = new PIXI.Sprite(resources["assets/objects/carrot.png"].texture);
        carrots[ytemp][xtemp].x = xtemp * 80 + 20;
        carrots[ytemp][xtemp].y = ytemp * 80 + 20;
        carrotContainer.addChild(carrots[ytemp][xtemp])
    }

    let carrotCount = 0;

    // GAME BOARD CURSOR ("SELECT")
    let select = new PIXI.Sprite(resources["assets/objects/x.png"].texture);

    let isPlaceable = false;
    function updateSelect() {
        let tempX = select.x / 80;
        let tempY = select.y / 80;
        if (isPlaceable && board[tempY][tempX]._texture.textureCacheIds[0] != "assets/tiles/EMPTY.png") {
            isPlaceable = false;
            select.texture = resources["assets/objects/x.png"].texture
        }
        else if (!isPlaceable && board[tempY][tempX]._texture.textureCacheIds[0] == "assets/tiles/EMPTY.png") {
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

    // PLAYER FUNCTIONS
    function eatCarrot() {
        if (carrots[playerY][playerX] != undefined) {
            carrotContainer.removeChild(carrots[playerY][playerX]);
            carrots[playerY][playerX] = undefined;
            carrotCount++;
            carrotText.text = carrotCount;
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
                            if (board[playerY][playerX + 1]._texture.textureCacheIds[0] == "assets/tiles/NW.png") {
                                overAndOver(1, 0, 'N');
                            }
                            else if (board[playerY][playerX + 1]._texture.textureCacheIds[0] == "assets/tiles/SW.png") {
                                overAndOver(1, 0, 'S');
                            }
                            else if (board[playerY][playerX + 1]._texture.textureCacheIds[0] == "assets/tiles/WE.png") {
                                overAndOver(1, 0, 'E');
                            }
                        }
                    }
                    else if (playerDirection == 'N') {
                        if (playerY - 1 >= 0) {
                            if (board[playerY - 1][playerX]._texture.textureCacheIds[0] == "assets/tiles/SW.png") {
                                overAndOver(0, -1, 'W');
                            }
                            else if (board[playerY - 1][playerX]._texture.textureCacheIds[0] == "assets/tiles/SE.png") {
                                overAndOver(0, -1, 'E');
                            }
                            else if (board[playerY - 1][playerX]._texture.textureCacheIds[0] == "assets/tiles/NS.png") {
                                overAndOver(0, -1, 'N');
                            }
                        }
                    }
                    else if (playerDirection == 'W') {
                        if (playerX - 1 >= 0) {
                            if (board[playerY][playerX - 1]._texture.textureCacheIds[0] == "assets/tiles/NE.png") {
                                overAndOver(-1, 0, 'N');
                            }
                            else if (board[playerY][playerX - 1]._texture.textureCacheIds[0] == "assets/tiles/SE.png") {
                                overAndOver(-1, 0, 'S');
                            }
                            else if (board[playerY][playerX - 1]._texture.textureCacheIds[0] == "assets/tiles/WE.png") {
                                overAndOver(-1, 0, 'W');
                            }
                        }
                    }
                    else if (playerDirection == 'S') {
                        if (playerY + 1 < boardHeight) {
                            if (board[playerY + 1][playerX]._texture.textureCacheIds[0] == "assets/tiles/NE.png") {
                                overAndOver(0, 1, 'E');
                            }
                            else if (board[playerY + 1][playerX]._texture.textureCacheIds[0] == "assets/tiles/NW.png") {
                                overAndOver(0, 1, 'W');
                            }
                            else if (board[playerY + 1][playerX]._texture.textureCacheIds[0] == "assets/tiles/NS.png") {
                                overAndOver(0, 1, 'S');
                            }
                        }
                    }
                }
                , hopSpeed);
        }
    }


    // INFOBAR
    let infobarContainer = new PIXI.Container();
    infobarContainer.x = infobarX;
    infobarContainer.y = infobarY;

    let infoCarrot = new PIXI.Sprite(resources["assets/objects/carrot.png"].texture);
    infoCarrot.width = 100;
    infoCarrot.height = 100;
    infobarContainer.addChild(infoCarrot);

    let carrotText = new PIXI.Text(carrotCount, { fontFamily: 'Arial', fontSize: 108, fill: 0x444444, align: 'center' });
    carrotText.x = 100;
    infobarContainer.addChild(carrotText);





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
        else if (e.keyCode == '74') {
            // j
            row = select.y / 80;
            col = select.x / 80;

            if (board[row][col]._texture.textureCacheIds[0] == "assets/tiles/EMPTY.png") {
                board[row][col].texture = updateQueue().texture;

                updatePlayerCoords();
                updateSelect();
            }
        }
        else if (e.keyCode == '75') {
            // k
            row = select.y / 80;
            col = select.x / 80;
            addBombs(col, row);
        }

    }

    boardContainer.addChild(tileContainer);
    boardContainer.addChild(carrotContainer);
    boardContainer.addChild(player);
    boardContainer.addChild(bombsContainer);
    boardContainer.addChild(select);


    app.stage.addChild(background);
    app.stage.addChild(queueContainer);
    app.stage.addChild(boardContainer);
    app.stage.addChild(infobarContainer);

}

