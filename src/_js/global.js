import * as PIXI from "pixi.js";
// import keybroadEvent from './keybroadEvent'

const app = new PIXI.Application({width: 512, height: 288});
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

let state, landscape, farBuild, midBuild, front, kb, touchevent, girl, deadSheet, runSheet, walkSheet, jumpSheet, zombieSheet, healthBar, catchPoints, accuracy, numofCombo, score, hitStatus;
let topZombies = [];
let bottomZombies = [];

let stripeHavePressed = false;

let fixedGirl = false;

let offKeyborad = false;
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
let direction = 'down';

let lastHitDone = false;

let isFirstStripe = true;
let detectStripePressed = false;
let islastStripe = true;

let numberOfZomble = 2,
spacing = 30,
xOffset = 512,
speed = 5;

let testArr = [
    {
        id: 1,
        spacing: 100,
        type: 'monster',
        distance: 0,
    },
    {
        id: 2,
        spacing: 100,
        type: 'monster',
        distance: 0,
    },
    {
        id: 3,
        spacing: 100,
        type: 'monster',
        distance: 0,
    },
    {
        id: 4,
        spacing: 100,
        type: 'monster',
        distance: 0,
    },
    {
        id: 5,
        spacing: 100,
        type: 'stripe',
        width: 200,
        distance: 450,
    },
    {
        id: 6,
        spacing: 100,
        type: 'monster',
        distance: 450,
    },
    {
        id: 7,
        spacing: 100,
        type: 'monster',
        distance: 450,
    },
    {
        id: 8,
        spacing: 100,
        type: 'monster',
        distance: 450,
    },
    {
        id: 9,
        spacing: 100,
        type: 'monster',
        distance: 450,
    },
    {
        id: 10,
        spacing: 100,
        type: 'monster',
        distance: 450,
    },
]

let topTestArr = [
    {
        id: 1,
        spacing: 100,
        type: 'monster',
        distance: 0,
    },
    {
        id: 2,
        spacing: 100,
        type: 'monster',
        distance: 0,
    },
    {
        id: 3,
        spacing: 100,
        type: 'monster',
        distance: 0,
    },
    {
        id: 4,
        spacing: 100,
        type: 'monster',
        distance: 0,
    },
    {
        id: 5,
        spacing: 100,
        type: 'monster',
        distance: 0,
    },
    {
        id: 6,
        spacing: 100,
        type: 'monster',
        distance: 0,
    },
    {
        id: 7,
        spacing: 100,
        type: 'monster',
        distance: 0,
    },
    {
        id: 8,
        spacing: 100,
        type: 'monster',
        distance: 0,
    },
    {
        id: 9,
        spacing: 100,
        type: 'monster',
        distance: 0,
    },
    {
        id: 10,
        spacing: 100,
        type: 'stripe',
        width: 500,
        distance: 0,
    },
]


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

function detectAccuracy(r1, r2, arrayDirection, keyboardEvent) {

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


    if(arrayDirection == direction) {
        if (Math.abs(vx) < combinedHalfWidths && keyboardEvent) {
            hit = 'perfect';
            girlHit = false;
        } else if (Math.abs(vx) < combinedHalfWidths * 1.2 && keyboardEvent) {
            hit = 'great';
            girlHit = false;
        } else if (Math.abs(vx) < combinedHalfWidths * 1.5 && keyboardEvent) {
            hit = 'good';
            girlHit = false;
        } else if (Math.abs(vx) < combinedHalfWidths * 1.8 && keyboardEvent) {
            hit = 'bad';
            girlHit = false;
        } else if (Math.abs(vx) < combinedHalfWidths * 0.05 && !keyboardEvent) {
            hit = 'miss';
            girlHit = true;
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

function detectStripeAcc(r1, r2, arrayDirection, keyboardEvent) {

    let repeat = window.innerWidth >= 1280 ? kb.repeat : touchevent.repeat;

    let fx, lx, hit, lastHit;

    r1.centerX = r1.x + r1.width / 2;
    r1.centerY = r1.y + r1.height / 2;
    r2.centerY = r2.y + r2.height / 2;
    r2.lastX = r2.x + r2.width;

    fx = r1.centerX - r2.x;
    lx = r1.centerX - r2.lastX;

    // 給個範圍來先判定準度
    // 判斷一次還有沒有壓
    // 最後判定放開時間

    // console.log(keyboardEvent)


    if(arrayDirection == direction) {
        if(isFirstStripe) {
            lastHitDone = false;
            detectStripePressed = false;
            islastStripe = true;
            if (Math.abs(fx) < 50 && keyboardEvent) {
                hit = 'perfect';
                girlHit = false;
                isFirstStripe = false;
                hitNumber.perfect += 1;
                hitNumber.combo += 1;
                recoredAcc(hit);
            } else if (Math.abs(fx) < 50 * 1.2 && keyboardEvent) {
                hit = 'great';
                girlHit = false;
                isFirstStripe = false;
                hitNumber.great += 1;
                hitNumber.combo += 1;
                recoredAcc(hit);
            } else if (Math.abs(fx) < 50 * 1.5 && keyboardEvent) {
                hit = 'good';
                girlHit = false;
                isFirstStripe = false;
                hitNumber.good += 1;
                failCombo();
                recoredAcc(hit);
            } else if (keyboardEvent) {
                hit = 'bad';
                girlHit = false;
                isFirstStripe = false;
                hitNumber.bad += 1;
                failCombo();
                recoredAcc(hit);
            } else if (Math.abs(fx) < 10 && !keyboardEvent) {
                hit = 'miss';
                lastHit = 'miss';
                r2.alpha = 0.5;
                lastHitDone = true;
                girlHit = true;
                isFirstStripe = false;
                hitNumber.miss += 1;
                recoredAcc(hit);
            } else {
                hit = false;
            }
        } else {
            hit = false;
        }

        if(lx > 0) lastHitDone = true;

        if(Math.abs(fx) < 75) {
            console.log(hit !== 'miss' && repeat && !detectStripePressed, direction == 'up')
            if(hit !== 'miss' && repeat && !detectStripePressed) {
                direction == 'up' ? fixedGirl = true : fixedGirl = false;
                // 如果有按住的話，就會縮短
                r2.x = 210;
                r2.width -= 5;
                r2.vx = 0;
                r2.alpha = 1;
                stripeHavePressed = true;
                nowScoreValue += 5;

                if(r2.width <= 0) {
                    r2.width = 0;
                    landscape.removeChild(r2);
                    // r2.clear();
                    lastHit = 'miss';
                    hitNumber.perfect += 1;
                    recoredAcc(lastHit);
                    detectStripePressed = true;
                    lastHitDone = true;
                    failCombo();
                    console.log("miss")
                }
            } else if(hit !== 'miss' && !repeat && !detectStripePressed) {
                // 如果放掉了就無法繼續
                detectStripePressed = true;
                r2.vx = speed;
                // r2.alpha = 0.5;
                if(Math.abs(lx) < 50 * 2) {
                    if(islastStripe) {
                        stripeHavePressed = false;
                        islastStripe = false;
                        if (Math.abs(lx) < 50) {
                            lastHit = 'perfect';
                            hitNumber.perfect += 1;
                            hitNumber.combo += 1;
                            girlHit = false;
                            recoredAcc(lastHit);
                            landscape.removeChild(r2);
                        } else if (Math.abs(lx) < 50 * 1.2) {
                            lastHit = 'great';
                            hitNumber.great += 1;
                            hitNumber.combo += 1;
                            girlHit = false;
                            recoredAcc(lastHit);
                            landscape.removeChild(r2);
                        } else if (Math.abs(lx) < 50 * 1.5) {
                            lastHit = 'good';
                            girlHit = false;
                            hitNumber.good += 1;
                            failCombo();
                            recoredAcc(lastHit);
                            landscape.removeChild(r2);
                        } else if (Math.abs(lx) < 50 * 2) {
                            lastHit = 'bad';
                            girlHit = false;
                            hitNumber.bad += 1;
                            failCombo();
                            recoredAcc(lastHit);
                            landscape.removeChild(r2);
                        } else {
                            lastHit = false;
                        }
                    }
                } else if(stripeHavePressed){
                    stripeHavePressed = false;
                    lastHit = 'miss';
                    girlHit = false;
                    hitNumber.miss += 1;
                    failCombo();
                    recoredAcc(lastHit);
                    r2.alpha = .5;
                    console.log("miss")
                }
            }
        }

    } else {
        fixedGirl = false;
        if (Math.abs(fx) < 50 * 0.05 && !fixedGirl) {
            hit = 'miss';
            lastHit = 'miss';
            r2.alpha = 0.5;
            hitNumber.miss += 1;
            recoredAcc(hit);
            failCombo();

            arrayDirection == 'up' ? nowHitItemNum.top += 1 : nowHitItemNum.bottom += 1;
        } else {
          //There's no collision on the x axis
          hit = false;
        }
    }
}

class keyboroad {
    constructor() {
        this.pressed = {};
        this.repeat = null;
        // this.keyCode = null;
        this.timer = null;
        this.detectRepeatTimer = null;
    }
    watch = () => {
        window.addEventListener('keydown', (e) => {
            if(offKeyborad == false) {
                this.pressed[e.key] = true;
                this.timer = setTimeout(() => {
                    this.pressed[e.key] = false;
                }, 20);
                this.detectRepeatTimer = setTimeout(this.longCheckEvent(), 50);
                offKeyborad = true;
            }

        }, false);
        window.addEventListener('keyup', (e) => {
            // this.pressed = false;
            // this.keyCode = null;
            offKeyborad = false;
            this.repeat = null;
            if(this.timer) clearTimeout(this.timer);
            if(this.detectRepeatTimer) clearTimeout(this.detectRepeatTimer);
            this.pressed[e.key] = false;
        }, false);
    }
    longCheckEvent = (key) => {
        this.repeat = true;
    }
}

class mobileTouchEvent {
    constructor() {
        this.touch = {
            'up': false,
            'down': false,
        };
        this.repeat = null;
        this.timer = null;
    }
    touchstart = (direction) => {
        // this.timer = setTimeout(this.onlongtouch, 50);
        this.onlongtouch()
        this.touch[direction] = true;
    }
    touchend = (direction) => {
        if(this.timer) clearTimeout(this.timer);
        this.touch[direction] = false;
        this.repeat = null;
    }
    onlongtouch = () => {
        console.log("longtouch");
        this.repeat = true;
    }
    createArrowupBtn = () => {
        let btn = new PIXI.Sprite.from('/assets/images/hitPoint.png');
        btn.interactive = true;
        btn.buttonMode = true;
        btn.on('touchstart', () => {this.touchstart('up')});
        btn.on('touchend', () => {this.touchend('up')});
        btn.x = 40;
        btn.y = 200;
        landscape.addChild(btn);
    }
    createArrowdownBtn = () => {
        let btn = new PIXI.Sprite.from('/assets/images/hitPoint.png');
        btn.interactive = true;
        btn.buttonMode = true;
        btn.on('touchstart', () => {this.touchstart('down')});
        btn.on('touchend', () => {this.touchend('down')});
        btn.x = 402;
        btn.y = 200;
        landscape.addChild(btn);
    }
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

function createStripe(index, array, width, distance, spacing, posY) {
    let stripe = new PIXI.Graphics;
    stripe.beginFill(0xDE3249);
    stripe.drawRect(0, 0, width, 30); // x, y, width, height
    stripe.endFill;

    stripe.vx = speed;
    stripe.x = xOffset + index * spacing + distance;
    stripe.y = posY;

    let obj = {sprite: stripe, type: 'stripe'};

    array.push(obj);
    landscape.addChild(obj.sprite);
}

function createMonster(index, array, spacing, distance, posY) {
    let zombie = new PIXI.AnimatedSprite(zombieSheet.animations["zombie"]);
    // let zombieHeight = zombie.height * 0.3;
    zombie.animationSpeed = 0.5;
    zombie.x = xOffset + spacing * index + distance;
    zombie.y = posY;
    zombie.vy = 0;
    zombie.vx = speed;
    zombie.scale.x = 0.3;
    zombie.scale.y = 0.3;
    zombie.touch = false;

    let obj = {sprite: zombie, type: 'monster'};

    array.push(obj);
    zombie.play();

    landscape.addChild(obj.sprite);
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
    if(window.innerWidth < 1280) {
        touchevent = new mobileTouchEvent();
        touchevent.createArrowupBtn();
        touchevent.createArrowdownBtn();
    }

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


    for(let i = 0; i < testArr.length; i++) {
        if(testArr[i].type == 'monster') {
            //createMonster(index, array, spacing, distance)
            createMonster(i, bottomZombies, testArr[i].spacing + 100, testArr[i].distance, 180);
        } else if(testArr[i].type == 'stripe') {
            //createStripe(index, array, width, distance, spacing)
            createStripe(i, bottomZombies, testArr[i].width, testArr[i].distance + 100, testArr[i].spacing, 215)
        }
    }

    for(let i = 0; i < topTestArr.length; i++) {
        if(topTestArr[i].type == 'monster') {
            //createMonster(index, array, spacing, distance)
            createMonster(i, topZombies, topTestArr[i].spacing, topTestArr[i].distance, 80);
        } else if(topTestArr[i].type == 'stripe') {
            //createStripe(index, array, width, distance, spacing)
            createStripe(i, topZombies, topTestArr[i].width, topTestArr[i].distance, topTestArr[i].spacing, 120)
        }
    }

    // createStripe();

    kb = new keyboroad();
    kb.watch();

    state = play;
    app.ticker.add(delta => gameLoop(delta));
}

function gameLoop(delta) {
    state(delta);
}

let nowHitItemNum = {
    top: 0,
    bottom: 0
};

function monsterAction(array, arrayDirection, keyboardEvent) {

    array.forEach((item) => {
        // 你各位啊，只要離開畫面的話，都會被拖到角落刪除的
        let leave = contain(item.sprite, landscape);
        if(leave == 'left') {
            item.sprite.x = -item.sprite.width;
            item.sprite.vx = 0;
            landscape.removeChild(item);
            // item.destroy(); //不確定怎麼用才不會bug...似乎這樣才能妥善釋放記憶體
        } else {
            item.sprite.x -= item.sprite.vx;
        }
    })

    function monsterMissAction() {
        missTrigger = false;
        hitNumber.miss += 1;
        failCombo();
        accuracy.text = 'miss';
        hitStatus = 'miss';
        recoredScore = true;

        setTimeout(() => {
            missTrigger = true;
        }, 50);
    }


    if(array == topZombies) {
        if(nowHitItemNum.top <= array.length - 1) {
            // console.log(array[nowHitItemNum.top])
            if(array[nowHitItemNum.top].type == 'monster') {
                if(detectAccuracy(girl, array[nowHitItemNum.top].sprite, arrayDirection, keyboardEvent) == 'miss' && missTrigger) {
                    nowHitItemNum.top += 1;
                    monsterMissAction();
                }
            } else if(array[nowHitItemNum.top].type == 'stripe') {
                let acc = detectStripeAcc(catchPoints, array[nowHitItemNum.top].sprite, 'up', kb.pressed.ArrowUp);
                // if(lastHitDone && acc.hit !== false) nowHitItemNum.bottom += 1;
                if(lastHitDone) {
                    isFirstStripe = true;
                    nowHitItemNum.top += 1;
                }
            }
        }
    } else if(array == bottomZombies) {
        if(nowHitItemNum.bottom <= array.length - 1) {
            if(array[nowHitItemNum.bottom].type == 'monster') {
                if(detectAccuracy(girl, array[nowHitItemNum.bottom].sprite, arrayDirection, keyboardEvent) == 'miss' && missTrigger) {
                    nowHitItemNum.bottom += 1;
                    monsterMissAction(nowHitItemNum.bottom);
                }
            } else if(array[nowHitItemNum.bottom].type == 'stripe') {
                let acc = detectStripeAcc(catchPoints, array[nowHitItemNum.bottom].sprite, 'down', kb.pressed.ArrowDown);
                // if(lastHitDone && acc.hit !== false) nowHitItemNum.bottom += 1;
                if(lastHitDone) {
                    isFirstStripe = true;
                    nowHitItemNum.bottom += 1;
                }
            }
        }
    }

}

function recoredAcc(status) {
    accuracy.text = status;
    hitStatus = status;
    recoredScore = true;
}

function deleteZombie(array, arrayDirection, keyboardEvent) {
    let status;
    // let arrayNum = array == topZombies ? nowHitItemNum.top : nowHitItemNum.bottom;

    if(array == topZombies && nowHitItemNum.top <= array.length - 1) {
        if(array[nowHitItemNum.top].type == 'monster') {
            status = detectAccuracy(girl, array[nowHitItemNum.top].sprite, arrayDirection, keyboardEvent);
            if (status !== 'miss' && status !== false ) {
                landscape.removeChild(array[nowHitItemNum.top].sprite);
                nowHitItemNum.top += 1;
                recoredAcc(status);
            }
        } else if(array[nowHitItemNum.top].type == 'stripe') {
            // nowHitItemNum.top += 1;

        }
    } else if(array == bottomZombies && nowHitItemNum.bottom <= array.length - 1) {
        if(array[nowHitItemNum.bottom].type == 'monster') {
            status = detectAccuracy(girl, array[nowHitItemNum.bottom].sprite, arrayDirection, keyboardEvent);
            if (status !== 'miss' && status !== false) {
                landscape.removeChild(array[nowHitItemNum.bottom].sprite);
                nowHitItemNum.bottom += 1;
                recoredAcc(status);
            }
        } else if(array[nowHitItemNum.bottom].type == 'stripe') {
            // nowHitItemNum.bottom += 1;
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

function failCombo() {
    hitNumber.recordofCombo.push(hitNumber.combo);
    hitNumber.combo = 0;
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

    monsterAction(topZombies, 'up', kb.pressed.ArrowUp);
    monsterAction(bottomZombies, 'down', kb.pressed.ArrowDown);
    // console.log(kb.pressed.ArrowDown)
    // stripeAction();

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

    console.log(direction)


    if (fixedGirl && direction == 'up') {
        // 長壓的時候就固定在上面
        // direction = 'up';
        girl.y = 80;
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


    if(touchevent !== undefined) {
        if(!touchevent.touch.up && jumped) {
            jumped = false;
            girl.vy = -10;
            girl.textures = runSheet.animations["Run"];
            girl.play();
            girl.loop = true;
        }
        if(touchevent.touch.up && !jumped) {
            direction = 'up';
            deleteZombie(topZombies, 'up', touchevent.touch.up);
            girl.vy = -80;
            jumped = true;
            girl.textures = jumpSheet.animations["Jump"];
            girl.play();
            girl.loop = false;
        }
        if(touchevent.touch.down) {
            direction = 'down';
            deleteZombie(bottomZombies, 'down', touchevent.touch.down);

            if(girl.y < 180) {
                girl.vy = 80;
            }
        }
        if(!touchevent.touch.up && !touchevent.repeat) {
            direction = 'down';
        }
    }

    if(touchevent == undefined) {
        if(!kb.pressed.ArrowUp && !kb.repeat) {
            direction = 'down';
        }
    }


    if (!kb.pressed.ArrowUp && jumped) {
        // 向上鍵放開往下掉的同時，重設跳躍狀態與重製成跑步狀態
        jumped = false;
        girl.vy = -10;
        girl.textures = runSheet.animations["Run"];
        girl.play();
        girl.loop = true;
    }
    if (kb.pressed.ArrowUp && !jumped) {
        // 按下向上鍵的時候，設定跳躍動作與跳躍狀態
        // array, arrayDirection, keyboardEvent
        direction = 'up';
        deleteZombie(topZombies, 'up', kb.pressed.ArrowUp);

        girl.vy = -80;
        jumped = true;
        girl.textures = jumpSheet.animations["Jump"];
        girl.play();
        girl.loop = false;
    }


    if (kb.pressed.ArrowDown) {
        // 按下向下鍵的時候，快速回到下方
        // array, arrayDirection, keyboardEvent
        direction = 'down';
        deleteZombie(bottomZombies, 'down', kb.pressed.ArrowDown);

        if(girl.y < 180) {
            girl.vy = 80;
        }
    }
}

Loader.onError.add((error) => console.error(error));