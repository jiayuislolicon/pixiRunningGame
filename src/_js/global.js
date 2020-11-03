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
    .add('dead', '/assets/images/dead.json')
    .add('jump', '/assets/images/jump.json')
    .add('run', '/assets/images/run.json')
    .add('walk', '/assets/images/walk.json')
    .add('zombie', '/assets/images/zombieWalk.json')
    .add('deadFire', '/assets/images/dead_fire.png')
    .add('fire', '/assets/images/fire.png')
    .load(setup);

let state, landscape, farBuild, midBuild, front, kb, girl, deadSheet, runSheet, walkSheet, jumpSheet, zombieSheet, healthBar;
let topZombies = [];
let bottomZombies = [];
let girlHit = false;
let gameOver = false;
let numberofHp = 3;

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

function contain(sprite, container) {

    let collision = undefined;
  
    //Left
    if (sprite.x + sprite.width < container.x) {
      sprite.x = sprite.width + container.x;
      collision = "left";
    }
    //Return the `collision` value
    return collision;
  }

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
      if (Math.abs(vy) < combinedHalfWidths) {
  
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
        this.pressed = false;
        this.keyCode = null;
    }
    watch () {
        window.addEventListener('keydown', (e) => {
            this.pressed = !e.repeat;
            this.keyCode = e.code;
        }, false);
        window.addEventListener('keyup', (e) => {
            this.pressed = false;
            this.keyCode = null;
        }, false);
    }
}

let touchStartTimeStamp = 0;
let touchEndTimeStamp   = 0;

window.addEventListener('touchstart', onTouchStart,false);
window.addEventListener('touchend', onTouchEnd,false);

let timer;
function onTouchStart(e) {
    touchStartTimeStamp = e.timeStamp;
}

function onTouchEnd(e) {
    touchEndTimeStamp = e.timeStamp;

    document.querySelector("#app").innerHTML(touchEndTimeStamp - touchStartTimeStamp);// in miliseconds
}


function setup() {

    landscape = new Container();
    app.stage.addChild(landscape)

    farBuild = new TilingSprite(resources.far.texture, 512, 256);
    farBuild.position.x = 0;
    farBuild.position.y = 0;
    farBuild.tilePosition.x = 0;
    farBuild.tilePosition.y = 0;
    farBuild.viewPortX = 0;
    farBuild.DELTA_X = 0.128;

    midBuild = new TilingSprite(resources.mid.texture, 512, 256);
    midBuild.position.x = 0;
    midBuild.position.y = 128;
    midBuild.tilePosition.x = 0;
    midBuild.tilePosition.y = 0;
    midBuild.viewPortX = 0;
    midBuild.DELTA_X = 0.64;

    landscape
        .addChild(farBuild)
        .addChild(midBuild)


    deadSheet = Loader.resources.dead.spritesheet;
    runSheet = Loader.resources.run.spritesheet;
    walkSheet = Loader.resources.walk.spritesheet;
    jumpSheet = Loader.resources.jump.spritesheet;
    zombieSheet = Loader.resources.zombie.spritesheet;


    girl = new PIXI.AnimatedSprite(runSheet.animations["Run"]);
    girl.animationSpeed = -0.167;
    girl.x = 96;
    girl.y = 0;
    girl.vy = 0;
    girl.vx = 0;
    girl.scale.x = 0.2;
    girl.scale.y = 0.2;
    girl.animationSpeed = 1;
    girl.play();
    landscape.addChild(girl);

    healthBar = new Container();
    healthBar.position.set(landscape.width - 220, 4);
    landscape.addChild(healthBar);

    //Create the black background rectangle
    let innerBar = new PIXI.Graphics();
    innerBar.beginFill(0x000000);
    innerBar.drawRect(0, 0, 200, 8);
    innerBar.endFill();
    healthBar.addChild(innerBar);

    //Create the front red rectangle
    let outerBar = new PIXI.Graphics();
    outerBar.beginFill(0xFF3300);
    outerBar.drawRect(0, 0, 200, 8);
    outerBar.endFill();
    healthBar.addChild(outerBar);

    healthBar.outer = outerBar;

    let numberOfZomble = 1,
    spacing = 48,
    xOffset = 512,
    speed = 2;

    for(let i = 0; i < numberOfZomble; i++) {
        let zombie = new PIXI.AnimatedSprite(zombieSheet.animations["zombie"]);
        // let zombieHeight = zombie.height * 0.3;
        zombie.animationSpeed = 0.5;
        zombie.x = xOffset + spacing * i;
        zombie.y = 180;
        zombie.vy = 0;
        zombie.vx = speed;
        zombie.scale.x = 0.3;
        zombie.scale.y = 0.3;
        zombie.touch = false;
        bottomZombies.push(zombie);
        zombie.play();
        landscape.addChild(zombie);
    }

    // for(let i = 0; i < numberOfZomble; i++) {
    //     let zombie = new PIXI.AnimatedSprite(zombieSheet.animations["zombie"]);
    //     // let zombieHeight = zombie.height * 0.3;
    //     zombie.x = xOffset + 500 + spacing * i;
    //     zombie.animationSpeed = 0.5;
    //     zombie.y = 80;
    //     zombie.vy = 0;
    //     zombie.vx = speed;
    //     zombie.scale.x = 0.3;
    //     zombie.scale.y = 0.3;
    //     zombie.touch = false;
    //     topZombies.push(zombie);
    //     zombie.play();
    //     landscape.addChild(zombie);
    // }

    kb = new keyboroad();
    kb.watch();

    state = play;
    app.ticker.add(delta => gameLoop(delta));
}

function setFarViewPortX(newViewPortX, target) {
    let distanceTravelled = newViewPortX - target.viewPortX;
    target.viewPortX = newViewPortX;
    target.tilePosition.x -= (distanceTravelled * target.DELTA_X);
}

function setViewPortX(viewPortX) {
    farBuild.setViewPortX(viewPortX);
    midBuild.setViewPortX(viewPortX);
}

function gameLoop(delta) {
    state(delta);
}

function monsterAction(array) {
    array.forEach((zombie) => {
        let leave = contain(zombie, landscape);
        if(leave == 'left') {
            zombie.x = -zombie.width;
            zombie.vx = 0;
            landscape.removeChild(zombie);
        } else {
            zombie.x -= zombie.vx;
        }
        if(hitTestRectangle(girl, zombie)) {
            // girlHit = true;
            console.log("trigger")
        }
        if(girlHit) {
            if(Math.floor(healthBar.outer.width) == 0) {
                healthBar.outer.width = 0;
                girl.textures = deadSheet.animations["Dead"];
                girl.play();
            } else {
                healthBar.outer.width -= 10;
                girl.alpha = 0.5;
                girlHit = false;
            }
        } else {
            girl.alpha = 1;
        }
    })
}

function play(delta) {
    farBuild.tilePosition.x -= 0.128;
    midBuild.tilePosition.x -= 0.64;
    // zombie.x -= 1

    monsterAction(bottomZombies);
    monsterAction(topZombies);

    if (girl.vy > 0 && girl.y > 180) {
        for(let i = 0; i < girl.vy; i++) {
            girl.vy = 0;
            break;
        }
        girl.y = 180;
    }


    if(kb.pressed && !gameOver) {
        girl.y += girl.vy;
        if(kb.keyCode == 'ArrowUp') {
            girl.textures = jumpSheet.animations["Jump"];
            girl.play();
            if(girl.y <= 80) {
                girl.vy = 0;
            } else {
                girl.vy = -20;
            }
        } else if(kb.keyCode == 'ArrowDown') {
            girl.textures = runSheet.animations["Run"];
            if(girl.y >= 180) {
                girl.vy = 0;
            } else {
                girl.vy = 20;
            }
        }
    } else {
        girl.textures = runSheet.animations["Run"];
        // girl.gotoAndPlay(1);
        // 給個重力
        girl.vy = girl.vy + 1;
        girl.x += girl.vx;
        girl.y += girl.vy;
    }
}

Loader.onError.add((error) => console.error(error));