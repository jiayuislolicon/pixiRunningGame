import * as PIXI from 'pixi.js';

export default class bgEntity {
    constructor(model) {
        this.model = model || {};

        if (model) {
            this.far = new PIXI.TilingSprite(model.far, 1024, 512);
            this.far.position.x = 0;
            this.far.position.y = 0;
            this.far.tilePosition.x = 0;
            this.far.tilePosition.y = 0;
            this.far.viewPortX = 0;
            this.far.DELTA_X = 0.128;

            this.mid = new PIXI.TilingSprite(model.mid, 1024, 512);
            this.mid.position.x = 0;
            this.mid.position.y = 128;
            this.mid.tilePosition.x = 0;
            this.mid.tilePosition.y = 0;
            this.mid.viewPortX = 0;
            this.mid.DELTA_X = 0.64;
        }
    }
    update() {
        this.far.tilePosition.x -= 0.128;
        this.mid.tilePosition.x -= 0.64;
    }
}