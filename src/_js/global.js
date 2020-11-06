import * as PIXI from "pixi.js";
// import keybroadEvent from './keybroadEvent'

const app = new PIXI.Application({width: 512, height: 384});
app.view.id = "myCanvas";
const wrapper = document.createElement('div');
wrapper.appendChild(app.view);
document.body.appendChild(wrapper);


const Loader = new PIXI.Loader(),
      TilingSprite = PIXI.TilingSprite,
      Sprite = PIXI.Sprite,
      Container = PIXI.Container,
      resources = Loader.resources;


document.cancelFullScreen = document.cancelFullScreen || document.webkitCancelFullScreen || document.mozCancelFullScreen;
let inFullscreen = false;
let el = null;



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

let state, landscape, farBuild, midBuild, front, kb, girl, deadSheet, runSheet, walkSheet, jumpSheet, zombieSheet, healthBar, catchPoints, accuracy, numofCombo, score, hitStatus;
let topZombies = [];
let bottomZombies = [];
let girlHit = false;
let gameOver = false;
let numberofHp = 3;
let isRecorded = false;
let hasItem = false;
let recoredScore = false;
let hitNumber = {
    "perfect": 0,
    "great": 0,
    "good": 0,
    "bad": 0,
    "miss": 0,
    "combo": 0,
    "recordofCombo": [],
}

const basePoint = 5000;

const accValue = {
    'perfect': 1,
    'great': 0.8,
    'good': 0.5,
    'bad': 0.2,
    'miss': 0
}

let nowScoreValue = 0;

let missTrigger = true;

let jumped = false;

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

function detectAccuracy(r1, r2, keyboardEvent) {

    //Define the variables we'll need to calculate
    let hit, combinedHalfWidths, combinedHalfHeights, vx, vy, testYaxis;

    //hit will determine whether there's a collision

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

    // if (Math.abs(vx) < combinedHalfWidths) {
    //     hit = 'perfect';
    // } else if (Math.floor(vx) < combinedHalfWidths * 1.2) {
    //     hit = 'great';
    // } else if (Math.floor(vx) < combinedHalfWidths * 1.5) {
    //     hit = 'good';
    // } else if (Math.floor(vx) < combinedHalfWidths * 2) {
    //     hit = 'bad';
    // } else if (Math.floor(vx) < combinedHalfWidths * 0.05) {
    //     hit = 'miss';
    // }

    if(keyboardEvent) {
        if (Math.abs(vx) < combinedHalfWidths && keyboardEvent) {
            hit = 'perfect';
        } else if (Math.abs(vx) < combinedHalfWidths * 1.2 && keyboardEvent) {
            hit = 'great';
        } else if (Math.abs(vx) < combinedHalfWidths * 1.5 && keyboardEvent) {
            hit = 'good';
        } else if (Math.abs(vx) < combinedHalfWidths * 2 && keyboardEvent) {
            hit = 'bad';
        } else if (Math.abs(vx) < combinedHalfWidths * 0.05 && !keyboardEvent) {
            hit = 'miss';
        } else {
            hit = false;
        }
    }else {
        if (Math.abs(vx) < combinedHalfWidths * 0.05) {
            hit = 'miss';
        } else {
          //There's no collision on the x axis
          hit = false;
        }
    }

    //`hit` will be either `true` or `false`
    return hit;
};


class keyboroad {
    constructor() {
        this.pressed = {};
        this.repeat = null;
        // this.keyCode = null;
    }
    watch = () => {
        window.addEventListener('keydown', (e) => {
            // if(e.code !== this.keyCode && !this.pressed && !e.repeat ) {
            //     this.pressed = true;
            //     this.keyCode = e.key;
                // setTimeout(() => {
                //     this.pressed = false;
                //     this.keyCode = null;
                // }, 15);
            // }
            this.repeat = e.repeat;
            this.pressed[e.key] = true;
            setTimeout(() => {
                this.pressed[e.key] = false;
            }, 100);
        }, false);
        window.addEventListener('keyup', (e) => {
            // this.pressed = false;
            // this.keyCode = null;
            this.repeat = null;
            this.pressed[e.key] = false;
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


function createBtn(x, y) {
    let btn = new PIXI.Sprite.from('https://pixijs.io/examples/examples/assets/bunny.png');
    btn.interactive = true;
    btn.buttonMode = true;
    btn.on('pointerup', btn_onDragEnd);
    btn.x = x;
    btn.y = y;
    landscape.addChild(btn);
}

function btn_onDragEnd() {
    fullscreen(!inFullscreen);
}

function fullscreen(value) {
	if(el == null) {
		var el = wrapper;
			el.addEventListener("webkitfullscreenchange", onFullscreenChange);
			el.addEventListener("mozfullscreenchange", onFullscreenChange);
			el.addEventListener("fullscreenchange", onFullscreenChange);
	}

	if(value) {
		if ( el.webkitRequestFullScreen ) {
			el.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
		} else {
			el.mozRequestFullScreen();
		}
	}
	else {
		document.cancelFullScreen();
	}
}

function onFullscreenChange(e) {
	inFullscreen = !inFullscreen;
    wrapper.className = inFullscreen ? 'fullscreen' : '';
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

    let _fullscreenBtn = createBtn(20, 20);

    girl = new PIXI.AnimatedSprite(runSheet.animations["Run"]);
    girl.animationSpeed = -0.167;
    girl.x = 96;
    girl.y = 0;
    girl.vy = 0;
    girl.vx = 0;
    girl.scale.x = 0.2;
    girl.scale.y = 0.2;
    girl.autoUpdate = true;
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

    let numberOfZomble = 10,
    spacing = 200,
    xOffset = 512,
    speed = 5;

    accuracy = new PIXI.Text('', accuracyStyle);
	accuracy.x = 195;
	accuracy.y = 50;
    landscape.addChild(accuracy);

    numofCombo = new PIXI.Text('0', comboStyle);
    numofCombo.x = 195;
    numofCombo.y = 30;
    landscape.addChild(numofCombo);

    score = new PIXI.Text('0'. scoreStyle);
    score.x = 400;
    score.y = 30;
    landscape.addChild(score);

    const accuracyStyle = new PIXI.TextStyle({
        fontFamily: 'Arial',
        fontSize: 12,
        fontWeight: 'bold',
        fill: '#ffffff',
        lineJoin: 'round'
    });
    const comboStyle = new PIXI.TextStyle({
        fontFamily: 'Arial',
        fontSize: 24,
        fontWeight: 'bold',
        fill: '#ffffff',
        lineJoin: 'round'
    });
    const scoreStyle = new PIXI.TextStyle({
        fontFamily: 'Arial',
        fontSize: 12,
        fontWeight: 'bold',
        fill: '#ffffff',
        lineJoin: 'round'
    });


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

    for(let i = 0; i < numberOfZomble; i++) {
        let zombie = new PIXI.AnimatedSprite(zombieSheet.animations["zombie"]);
        // let zombieHeight = zombie.height * 0.3;
        zombie.x = xOffset + 500 + spacing * i;
        zombie.animationSpeed = 0.5;
        zombie.y = 80;
        zombie.vy = 0;
        zombie.vx = speed;
        zombie.scale.x = 0.3;
        zombie.scale.y = 0.3;
        zombie.touch = false;
        topZombies.push(zombie);
        zombie.play();
        landscape.addChild(zombie);
    }

    kb = new keyboroad();
    kb.watch();

    state = play;
    app.ticker.add(delta => gameLoop(delta));
}

function gameLoop(delta) {
    state(delta);
}

function monsterAction(array, keyboardEvent) {
    array.forEach((zombie) => {
        let leave = contain(zombie, landscape);
        if(leave == 'left') {
            zombie.x = -zombie.width;
            zombie.vx = 0;
            landscape.removeChild(zombie);
        } else {
            zombie.x -= zombie.vx;
        }

        if(array.length !== 0) {

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
            // console.log(detectAccuracy(girl, array[0]).hit, keyboardEvent)

            if(detectAccuracy(girl, array[0], keyboardEvent) == 'miss' && missTrigger) {
                missTrigger = false;
                array.splice(0, 1);
                landscape.removeChild(zombie);
                hitNumber.miss += 1;
                failCombo();
                accuracy.text = 'miss';
                hitStatus = 'miss';
                recoredScore = true;

                setTimeout(() => {
                    missTrigger = true;
                }, 50);
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

function failCombo() {
    hitNumber.recordofCombo.push(hitNumber.combo);
    hitNumber.combo = 0;
}

function deleteZombie(array, keyboardEvent) {
    if(array.length !== 0) {

        let status = detectAccuracy(girl, array[0], keyboardEvent);

        if (status !== 'miss') {
            if(status !== false) {
                landscape.removeChild(array[0]);
                array[0].destroy();
                array.splice(0, 1);
                accuracy.text = status;
                hitStatus = status;
                recoredScore = true;
            }
        }
        if(status == 'perfect') {
            hitNumber.perfect += 1;
            hitNumber.combo += 1;
        } else if(status == 'great') {
            hitNumber.great += 1;
            hitNumber.combo += 1;
        } else if(status == 'good') {
            hitNumber.good += 1;
            failCombo();
        } else if(status == 'bad') {
            hitNumber.bad += 1;
            failCombo();
        }
    }
}

function recoredLastofCombo() {
    if(topZombies.length == 0 && bottomZombies.length == 0 && !isRecorded) {
        isRecorded = true;
        hitNumber.recordofCombo.push(hitNumber.combo);
    }
}

function updateScore() {
    const itemBonus = 1.5;
    let accBonus;
    let comboBonus = Math.floor(hitNumber.combo / 1000 + 1);

    if(hitStatus !== undefined && recoredScore) {
        if(hitStatus == 'perfect') {
            accBonus = accValue.perfect;
        } else if(hitStatus == 'great') {
            accBonus = accValue.great;
        } else if(hitStatus == 'good') {
            accBonus = accValue.good;
        } else if(hitStatus == 'bad') {
            accBonus = accValue.bad;
        } else if(hitStatus == 'miss') {
            accBonus = accValue.miss;
        }

        hasItem ? nowScoreValue += basePoint * itemBonus * comboBonus * accBonus : nowScoreValue += basePoint * comboBonus * accBonus;
        recoredScore = false;

    }
}


function play(delta) {
    farBuild.tilePosition.x -= 0.128;
    midBuild.tilePosition.x -= 0.64;

    monsterAction(topZombies, kb.pressed.ArrowUp);
    monsterAction(bottomZombies, kb.pressed.ArrowDown);

    recoredLastofCombo();

    numofCombo.text = hitNumber.combo;
    updateScore();
    score.text = nowScoreValue;

    // hitNumber.combo == 0 ? numofCombo.alpha = 0 : numofCombo.alpha = 1;

    girl.vy = girl.vy + 1;
    girl.x += girl.vx;
    girl.y += girl.vy;

    if (girl.vy > 0) {
        // 往下的時候，要是人物位置大於180就固定在180，且不再增加速度，加上break來防止繼續演算
        for (let i = 0; i < girl.vy; i++) {
          let posY = girl.y;
          if (posY > 180) {
            girl.vy = 0;
            girl.y = 180;
            break;
          }
        }
    }

    if (girl.vy < 0) {
        // 往上的時候，要是人物位置小於80就固定在80
        for (let i = girl.vy; i < 0; i++) {
            let posY = girl.y;
            if (posY < 80) {
                girl.y = 80;
            }
        }
    }

    if (girl.y >= 80 && kb.repeat == true) {
        // 常壓的時候就固定在上面
        girl.y = 80;
    }

    if (!kb.pressed.ArrowUp && jumped) {
        // 向上鍵放開往下掉的同時，重設跳躍狀態與重製成跑步狀態
        jumped = false;
        girl.textures = runSheet.animations["Run"];
        girl.play();
        girl.loop = true;
    }
    if (kb.pressed.ArrowUp && !jumped) {
        // 按下向上鍵的時候，設定跳躍動作與跳躍狀態
        girl.vy = -100;
        jumped = true;
        deleteZombie(topZombies, kb.pressed.ArrowUp);
        girl.textures = jumpSheet.animations["Jump"];
        girl.play();
        girl.loop = false;
    }

    if (kb.pressed.ArrowDown) {
        // 按下向下鍵的時候，快速回到下方
        deleteZombie(bottomZombies, kb.pressed.ArrowDown);
        if(girl.y <= 80) {
            girl.vy = 100;
        }
    }
}

Loader.onError.add((error) => console.error(error));