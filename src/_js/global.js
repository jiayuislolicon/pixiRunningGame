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

let state, landscape, farBuild, midBuild, front, kb, girl, deadSheet, runSheet, walkSheet, jumpSheet, zombieSheet, healthBar, catchPoints;
let topZombies = [];
let bottomZombies = [];
let girlHit = false;
let gameOver = false;
let numberofHp = 3;

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

function detectAccuracy(r1, r2) {

    //Define the variables we'll need to calculate
    let hit, combinedHalfWidths, combinedHalfHeights, vx, vy;

    //hit will determine whether there's a collision

    //Find the center points of each sprite

    r1.centerX = r1.x + r1.width / 2;
    r1.centerY = r1.y + r1.height / 2 + 80;
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

    if (Math.abs(vx) < combinedHalfWidths && kb.pressed) {
        hit = 'perfect';
    } else if (Math.abs(vx) < combinedHalfWidths * 1.2 && kb.pressed) {
        hit = 'great';
    } else if (Math.abs(vx) < combinedHalfWidths * 1.5 && kb.pressed) {
        hit = 'good';
    } else if (Math.abs(vx) < combinedHalfWidths * 2 && kb.pressed) {
        hit = 'bad';
    } else if (Math.abs(vx) < combinedHalfWidths * 0.02 && !kb.pressed) {
        hit = 'miss';
    } else {
      //There's no collision on the x axis
      hit = false;
    }

    //`hit` will be either `true` or `false`
    return {hit, vx, combinedHalfWidths};
};


class keyboroad {
    constructor() {
        this.pressed = false;
        this.keyCode = null;
    }
    watch = () => {
        window.addEventListener('keydown', (e) => {
            if(e.code !== this.keyCode && !this.pressed && !e.repeat ) {
                this.pressed = true;
                this.keyCode = e.code;
                setTimeout(() => {
                    this.pressed = false;
                    this.keyCode = null;
                }, 15);
            }
        }, true);
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

    //catch points
    catchPoints = new Container();
    catchPoints.position.set(160, 80);
    landscape.addChild(catchPoints);

    let topPoint = new PIXI.Graphics();
    topPoint.beginFill(0x32ffed);
    topPoint.lineStyle(0);
    topPoint.drawCircle(50, 50, 25);
    topPoint.endFill();
    catchPoints.addChild(topPoint);

    catchPoints.top = topPoint;

    let bottomPoint = new PIXI.Graphics();
    bottomPoint.beginFill(0x32ffed);
    bottomPoint.lineStyle(0);
    bottomPoint.drawCircle(50, 50, 25);
    bottomPoint.endFill();
    bottomPoint.position.set(0, 100);
    catchPoints.addChild(bottomPoint);

    catchPoints.bottom = bottomPoint;

    let numberOfZomble = 100,
    spacing = 200,
    xOffset = 512,
    speed = 3;

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

Array.prototype.insert = function ( index, item ) {
    this.splice( index, 0, item );
};

let zombieDistance = [];

function monsterAction(array) {
    array.forEach((zombie, index) => {
        if(array[index] !== null) {
            let leave = contain(zombie, landscape);
            if(leave == 'left') {
                zombie.x = -zombie.width;
                zombie.vx = 0;
                landscape.removeChild(zombie);
            } else {
                zombie.x -= zombie.vx;
            }

            // if(detectAccuracy(catchPoints.bottom, array[0]).hit !== 'miss') {
            //     if(detectAccuracy(catchPoints.bottom, array[0]).hit !== false) {
            //         landscape.removeChild(array[0])
            //         array[0].destroy();
            //         array.splice(0, 1);
            //         console.log(detectAccuracy(catchPoints.bottom, array[0]).combinedHalfWidths)
            //         array[index] = null;
            //     }
            // } else if (detectAccuracy(catchPoints.bottom, array[0]).hit == 'miss') {
            //     girlHit = true;
            // }
            if(detectAccuracy(girl, array[0]).hit == 'miss') {
                array.splice(0, 1);
                console.log('miss')
            }
            if(girlHit) {
                if(Math.floor(healthBar.outer.width) == 0) {
                    healthBar.outer.width = 0;
                    girl.textures = deadSheet.animations["Dead"];
                } else {
                    healthBar.outer.width -= 10;
                    girl.alpha = 0.5;
                    girlHit = false;
                }
            } else {
                girl.alpha = 1;
            }
        }
    })
}

function deleteZombie(array) {

    console.log(detectAccuracy(girl, array[0]).hit)
    if(array.length !== 0) {
        if (detectAccuracy(girl, array[0]).hit !== 'miss') {
            if(detectAccuracy(girl, array[0]).hit !== false) {
                array.splice(0, 1);
            }
        }
    }
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
        deleteZombie(bottomZombies);
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
            girl.play();
            if(girl.y >= 180) {
                girl.vy = 0;
            } else {
                girl.vy = 20;
            }
        }
        
    } else {
        // girl.textures = runSheet.animations["Run"];
        // girl.gotoAndPlay(1);
        // 給個重力
        girl.vy = girl.vy + 1;
        girl.x += girl.vx;
        girl.y += girl.vy;
    }
}

Loader.onError.add((error) => console.error(error));