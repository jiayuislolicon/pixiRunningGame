import * as PIXI from 'pixi.js';

export default class TriggerEntity {
    constructor(model, direction, type) {
        this.model = model || {};
        this.dead = false;
        this.noPress = false;

        if(type === 'monster') {
            switch (direction) {
                case 'top':
                    this.tempoItem = new PIXI.AnimatedSprite(model.topMonsters.texture);
                    break;
                case 'bottom':
                    this.tempoItem = new PIXI.AnimatedSprite(model.bottomMonsters.texture);
                    break;
                default:
                    break;
            }
        } else if(type === 'stripe') {
            switch (direction) {
                case 'top':
                    this.tempoItem = new PIXI.AnimatedSprite(model.topStripe.texture);
                    break;
                case 'bottom':
                    this.tempoItem = new PIXI.AnimatedSprite(model.bottomStripe.texture);
                    break;
                default:
                    break;
            }
        } else if(type === 'item') {
            this.tempoItem = new PIXI.AnimatedSprite(model.items.texture);
        }
    }
    update() {
        // transform animation
        // dead = true就要被刪除destroy()
    }
    collisionX(role, item) {
        // 計算x軸，偵測是否碰撞
    }
    collisionY(role, item) {
        // 計算y軸，偵測是否碰撞
    }
    leave() {
        // 對每個項目演算有無離開畫面外
    }
    damaged() {
        // 對會照成傷害的物件演算
        // 怪物跟觸碰點的x碰上，就回傳miss
        // 如果是stripe就給他透明度
        // 怪物跟觸碰點的x,y皆碰上，角色就要受傷
    }
    range() {
        // 判定準度的範圍標準
    }
    hitMonster() {
        // 單擊怪物

        // 如果碰撞到的是怪物：
        // 透過碰撞的差距距離與是否所在於xy軸，就回傳精準度
        // ++count
    }
    hitStripe() {
        // 長壓長條

        // 如果碰撞到的是怪物：
        // 透過碰撞的差距距離與是否所在於xy軸，就回傳一次精準度
        // 中間的時候也不可以再用(noPress = true)
    }
    midStripe() {
        // 長壓長條

        // 如果碰撞到的是長條：
        // 透過碰撞的差距距離與是否所在於xy軸，就回傳一次精準度
        // ++count
    }
    lastStripe() {
        // 長壓長條

        // 如果碰撞到的是長條：
        // 透過碰撞的差距距離與是否所在於xy軸，就回傳一次精準度
    }
    getItem() {
        // 撿道具

        // 如果碰撞到的是道具：
        // 接觸的數值會很相近以及是否所在於xy軸，有就給予加分判定
        // 將人物的動畫轉成拿到的狀態
        // ++count
    }
    destroy() {
        //destroy
    }
}