export function boardEdges(corner, edge, boardHeight, boardWidth) {
    let edgeContainer = new PIXI.Container();

    let temp = new PIXI.Sprite(corner);
    temp.x = -20;
    temp.y = -20;
    edgeContainer.addChild(temp);

    temp = new PIXI.Sprite(corner);
    temp.x = -20;
    temp.y = boardHeight * 80 + 20;
    temp.rotation = -Math.PI / 2;
    edgeContainer.addChild(temp);

    temp = new PIXI.Sprite(corner);
    temp.x = boardWidth * 80 + 20;
    temp.y = boardHeight * 80 + 20;
    temp.rotation = Math.PI;
    edgeContainer.addChild(temp);

    temp = new PIXI.Sprite(corner);
    temp.x = boardWidth * 80 + 20;
    temp.y = -20;
    temp.rotation = Math.PI / 2;
    edgeContainer.addChild(temp);

    for (let i = 0; i < boardWidth; i++) {
        temp = new PIXI.Sprite(edge);
        temp.x = i * 80 + 80;
        temp.y = -20;
        temp.rotation = Math.PI / 2;
        edgeContainer.addChild(temp);
    }

    for (let i = 0; i < boardWidth; i++) {
        temp = new PIXI.Sprite(edge);
        temp.x = i * 80;
        temp.y = boardHeight * 80 + 20;
        temp.rotation = 3 * Math.PI / 2;
        edgeContainer.addChild(temp);
    }

    for (let i = 0; i < boardHeight; i++) {
        temp = new PIXI.Sprite(edge);
        temp.x = boardWidth * 80 + 20;
        temp.y = i * 80 + 80;
        temp.rotation = Math.PI;
        edgeContainer.addChild(temp);
    }

    for (let i = 0; i < boardHeight; i++) {
        temp = new PIXI.Sprite(edge);
        temp.x = -20;
        temp.y = i * 80;
        edgeContainer.addChild(temp);
    }

    return edgeContainer;
}

export function queueEdges(corner, edge) {
    let queueEdgeContainer = new PIXI.Container();

    let temp = new PIXI.Sprite(corner);
    temp.x = -20;
    temp.y = -20;
    queueEdgeContainer.addChild(temp);

    temp = new PIXI.Sprite(corner);
    temp.x = 100;
    temp.y = -20;
    temp.rotation = Math.PI / 2;
    queueEdgeContainer.addChild(temp);

    temp = new PIXI.Sprite(corner);
    temp.x = 100;
    temp.y = 100;
    temp.rotation = Math.PI;
    queueEdgeContainer.addChild(temp);

    temp = new PIXI.Sprite(corner);
    temp.x = -20;
    temp.y = 100;
    temp.rotation = 3 * Math.PI / 2;
    queueEdgeContainer.addChild(temp);




    temp = new PIXI.Sprite(corner);
    temp.x = -20;
    temp.y = 100;
    queueEdgeContainer.addChild(temp);

    temp = new PIXI.Sprite(corner);
    temp.x = 100;
    temp.y = 100;
    temp.rotation = Math.PI / 2;
    queueEdgeContainer.addChild(temp);

    temp = new PIXI.Sprite(corner);
    temp.x = 100;
    temp.y = 380;
    temp.rotation = Math.PI;
    queueEdgeContainer.addChild(temp);

    temp = new PIXI.Sprite(corner);
    temp.x = -20;
    temp.y = 380;
    temp.rotation = 3 * Math.PI / 2;
    queueEdgeContainer.addChild(temp);




    temp = new PIXI.Sprite(edge);
    temp.x = -20;
    temp.y = 0;
    queueEdgeContainer.addChild(temp);

    temp = new PIXI.Sprite(edge);
    temp.x = 80;
    temp.y = -20;
    temp.rotation = Math.PI / 2;
    queueEdgeContainer.addChild(temp);

    temp = new PIXI.Sprite(edge);
    temp.x = 100;
    temp.y = 80;
    temp.rotation = Math.PI;
    queueEdgeContainer.addChild(temp);

    temp = new PIXI.Sprite(edge);
    temp.x = 0;
    temp.y = 100;
    temp.rotation = 3 * Math.PI / 2;
    queueEdgeContainer.addChild(temp);





    temp = new PIXI.Sprite(edge);
    temp.x = 80;
    temp.y = 100;
    temp.rotation = Math.PI / 2;
    queueEdgeContainer.addChild(temp);

    temp = new PIXI.Sprite(edge);
    temp.x = 0;
    temp.y = 380;
    temp.rotation = 3 * Math.PI / 2;
    queueEdgeContainer.addChild(temp);


    for (let i = 0; i < 3; i++) {
        temp = new PIXI.Sprite(edge);
        temp.x = -20;
        temp.y = 120  + 80*i;
        queueEdgeContainer.addChild(temp);
    }

    for (let i = 0; i < 3; i++) {
        temp = new PIXI.Sprite(edge);
        temp.x = 100;
        temp.y = 200  + 80*i;
        temp.rotation = Math.PI;
        queueEdgeContainer.addChild(temp);
    }


    return queueEdgeContainer;
}