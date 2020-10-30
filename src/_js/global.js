import * as PIXI from "pixi.js";
// import keybroadEvent from './keybroadEvent'

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
    .add('zombieWalk', '/assets/images/zombieWalk.json')
    .load(setup);

let state, landscape, farBuild, midBuild, front, zombie, kb;

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

function hitTestRectangle(r1, r2) {

    //Define the variables we'll need to calculate
    let hit, combinedHalfWidths, combinedHalfHeights, vx, vy;
  
    //hit will determine whether there's a collision
    hit = false;
  
    //Find the center points of each sprite
    r1.centerX = r1.x + r1.width / 2;
    r1.centerY = r1.y + r1.height / 2;
    r2.centerX = r2.x + r2.width / 2;
    r2.centerY = r2.y + r2.height / 2;
  
    //Find the half-widths and half-heights of each sprite
    r1.halfWidth = r1.width / 2;
    r1.halfHeight = r1.height / 2;
    r2.halfWidth = r2.width / 2;
    r2.halfHeight = r2.height / 2;
  
    //Calculate the distance vector between the sprites
    vx = r1.centerX - r2.centerX;
    vy = r1.centerY - r2.centerY;
  
    //Figure out the combined half-widths and half-heights
    combinedHalfWidths = r1.halfWidth + r2.halfWidth;
    combinedHalfHeights = r1.halfHeight + r2.halfHeight;
  
    //Check for a collision on the x axis
    if (Math.abs(vx) < combinedHalfWidths) {
  
      //A collision might be occurring. Check for a collision on the y axis
      if (Math.abs(vy) < combinedHalfHeights) {
  
        //There's definitely a collision happening
        hit = true;
      } else {
  
        //There's no collision on the y axis
        hit = false;
      }
    } else {
  
      //There's no collision on the x axis
      hit = false;
    }
  
    //`hit` will be either `true` or `false`
    return hit;
};

class keyboroad {
    constructor() {
        this.pressed = {};
    }
    watch () {
        window.addEventListener('keydown', (e) => {
            this.pressed[e.key] = true;
        }, false);
        window.addEventListener('keyup', (e) => {
            this.pressed[e.key] = false;
        }, false);
    }
}

class testFar {
    constructor() {
        
    }
}


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

    front = new main();
    front.generateTestWallSpan();

    let sheet = Loader.resources.zombieWalk.spritesheet;
    zombie = new PIXI.AnimatedSprite(sheet.animations["zombie"]);
    zombie.animationSpeed = -0.167;
    zombie.x = 96;
    zombie.y = 0;
    zombie.vy = 0;
    zombie.vx = 0;
    zombie.scale.x = 0.3;
    zombie.scale.y = 0.3;
    zombie.play();
    landscape.addChild(zombie);

    kb = new keyboroad();
    kb.watch();

    state = play;
    app.ticker.add(delta => gameLoop(delta));
}

function gameLoop(delta) {
    state(delta);
}

function play(delta) {
    farBuild.tilePosition.x -= 0.128;
    midBuild.tilePosition.x -= 0.64;

    // 給殭屍一個重力
    zombie.vy = zombie.vy + 1;
    zombie.x += zombie.vx;
    zombie.y += zombie.vy;

    if (zombie.vy > 0 && zombie.y > 80) {
        for(let i = 0; i < zombie.vy; i++) {
            zombie.vy = 0;
            break;
        }
        zombie.y = 80;
    }

    if(zombie.y < 0) {
        zombie.y -= zombie.vy;
    }

    if(kb.pressed.ArrowUp) {
        zombie.vy = -10;
    }
}

Loader.onError.add((error) => console.error(error));