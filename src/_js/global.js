import * as PIXI from "pixi.js";

const app = new PIXI.Application({width: 512, height: 384});
const Loader = new PIXI.Loader(),
      TilingSprite = PIXI.TilingSprite,
      Sprite = PIXI.Sprite,
      Container = PIXI.Container,
      resources = Loader.resources;

document.body.appendChild(app.view);

Loader
    .add('far', '/assets/images/bg-far.png')
    .add('mid', '/assets/images/bg-mid.png')
    .add('builds', '/assets/images/build.json')
    .load(setup);

let state, landscape, farBuild, midBuild, slice, slice2;

class wallSpritesPool {
    constructor() {
        this.createWindows();
        this.createDecorations();
        this.createFrontEdges();
        this.createBackEdges();
        this.createSteps();
    }
    shuffle = (arr) => {
        let len = arr.length;
        let shuffles = len * 3;
        for (let i = 0; i < shuffles; i++) {
            let wallSlice = arr.pop();
            let pos = Math.floor(Math.random() * (len - 1));
            arr.splice(pos, 0, wallSlice);
        }
    }
    addWindowSprites = (amount, frameId) => {
        for(let i = 0; i < amount; i++) {
            let sprite = new Sprite.from(resources.builds.textures[frameId]);
            this.window.push(sprite);
        }
    }
    createWindows = () => {
        this.window = [];
        this.addWindowSprites(6, "wall_2.png");
        this.addWindowSprites(6, "wall_6.png");
        this.shuffle(this.window);
    }
    borrowWindow = () => {
        //移除並回傳陣列的第一個元素
        return this.window.shift();
    }
    returnWindow = (sprite) => {
        this.window.push(sprite);
    }
    addDecorationsSprites = (amount, frameId) => {
        for(let i = 0; i < amount; i++) {
            let sprite = new Sprite.from(resources.builds.textures[frameId]);
            this.decorations.push(sprite);
        }
    }
    createDecorations = () => {
        this.decorations = [];
        this.addDecorationsSprites(6, "wall_3.png");
        this.addDecorationsSprites(6, "wall_7.png");
        this.addDecorationsSprites(6, "wall_8.png");
        this.shuffle(this.decorations);
    }
    borrowDecorations = () => {
        return this.decorations.shift();
    }
    returnDecorations = (sprite) => {
        this.decorations.push(sprite);
    }
    addFrontEdgeSprites = (amount, frameId) => {
        for(let i = 0; i < amount; i++) {
            let sprite = new Sprite.from(resources.builds.textures[frameId]);
            this.frontEdges.push(sprite);
        }
    }
    createFrontEdges = () => {
        this.frontEdges = [];
        this.addFrontEdgeSprites(2, 'wall_1.png');
        this.addFrontEdgeSprites(2, 'wall_5.png');
        this.shuffle(this.frontEdges);
    }
    borrowFrontEdge = () => {
        return this.frontEdges.shift();
    }
    returnFrontEdge = (sprite) => {
        this.frontEdges.push(sprite);
    }
    addBackEdgeSprites = (amount, frameId) => {
        for(let i = 0; i < amount; i++) {
            let sprite = new Sprite.from(resources.builds.textures[frameId]);
            sprite.anchor.x = 1;
            sprite.scale.x = -1;
            this.backEdges.push(sprite);
        }
    }
    createBackEdges = () => {
        this.backEdges = [];
        this.addBackEdgeSprites(2, 'wall_1.png');
        this.addBackEdgeSprites(2, 'wall_5.png');
        this.shuffle(this.backEdges);
    }
    borrowBackEdge = () => {
        return this.backEdges.shift();
    }
    returnBackEdge = (sprite) => {
        this.backEdges.push(sprite);
    }
    addStepSprites = (amount, frameId) => {
        for(let i = 0; i < amount; i++) {
            let sprite = new Sprite.from(resources.builds.textures[frameId]);
            sprite.anchor.y = 0.25;
            this.steps.push(sprite);
        }
    }
    createSteps = () => {
        this.steps = [];
        this.addStepSprites(2, "wall_4.png");
    }
    borrowStep = () => {
        return this.steps.shift();
    }
    returnStep = (sprite) => {
        this.steps.push(sprite);
    }
}

class main {
    constructor() {
        this.pool = new wallSpritesPool();
        this.wallSlices = [];
    }
    generateTestWallSpan = () => {
        let lookupTable = [
            this.pool.borrowFrontEdge,
            this.pool.borrowWindow,
            this.pool.borrowDecorations,
            this.pool.borrowStep,
            this.pool.borrowWindow,
            this.pool.borrowBackEdge,
        ]
    
        let yPos = [
            128,
            128,
            128,
            192,
            192,
            192
        ]
    
        for(let i = 0; i < lookupTable.length; i++) {
            let func = lookupTable[i];
            let sprite = func.call(this.pool);
            sprite.position.x = 64 + (i * 64);
            sprite.position.y = yPos[i];
            this.wallSlices.push(sprite);
            landscape.addChild(sprite);
        }
    }
    
    clearTestWallSpan = () => {
        let lookupTable = [
            this.pool.returnFrontEdge,
            this.pool.returnWindow,
            this.pool.returnDecorations,
            this.pool.returnStep,
            this.pool.returnWindow,
            this.pool.returnBackEdge,
        ]
    
        for(let i = 0; i < lookupTable.length; i++) {
            let func = lookupTable[i];
            let sprite = this.wallSlices[i];
    
            landscape.removeChild(sprite);
            func.call(this.pool, sprite);
        }
    
        this.wallSlices = [];
    }

}

// class Far {
//     constructor() {
//         TilingSprite.call(this, texture, width, height);
//         this.position.x = 0;
//         this.position.y = 0;
//         this.tilePosition.x = 0;
//         this.tilePosition.y = 0;
//     }
// }

function setup() {
    
    landscape = new Container();
    app.stage.addChild(landscape)

    farBuild = new TilingSprite(resources.far.texture, 512, 256);
    farBuild.position.x = 0;
    farBuild.position.y = 0;
    farBuild.tilePosition.x = 0;
    farBuild.tilePosition.y = 0;

    midBuild = new TilingSprite(resources.mid.texture, 512, 256);
    midBuild.position.x = 0;
    midBuild.position.y = 128;
    midBuild.tilePosition.x = 0;
    midBuild.tilePosition.y = 0;

    landscape
        .addChild(farBuild)
        .addChild(midBuild)

    let front = new main();
    front.generateTestWallSpan();
    
    state = play;
    app.ticker.add(delta => gameLoop(delta));
}

function gameLoop(delta) {
    state(delta);
}

function play(delta) {
    farBuild.tilePosition.x -= 0.128;
    midBuild.tilePosition.x -= 0.64;
}

Loader.onError.add((error) => console.error(error));