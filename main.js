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
const boardX = 300;
const boardY = 50;

// Create the application helper and add its render target to the page
let app = new PIXI.Application({ width: 1600, height: 900 });
document.body.appendChild(app.view);

// Create the sprite and add it to the stage
let sprite = PIXI.Sprite.from("assets/scene/BACKGROUND.jpeg");
//let sprite = PIXI.Sprite(BACKGROUND);
sprite.width = 1600;
sprite.height = 900;
app.stage.addChild(sprite);

// [row][col]
const boardContainer = new PIXI.Container();
app.stage.addChild(boardContainer);
boardContainer.x = boardX;
boardContainer.y = boardY;

let board = [];
for (let row = 0; row < boardHeight; row++) {
    rowArr = [];
    for (let col = 0; col < boardWidth; col++) {
        const spr = PIXI.Sprite.from('assets/tiles/NE.png');
        spr.x = col * 80;
        spr.y = row * 80;
        boardContainer.addChild(spr);
        rowArr.push(spr);
    }
    board.push(rowArr);
}

boardContainer.removeChild(board[2][3]);
board[2][3] = PIXI.Sprite.from('assets/tiles/NS.png');
board[2][3].x = 3 * 80;
board[2][3].y = 2 * 80;
boardContainer.addChild(board[2][3]);