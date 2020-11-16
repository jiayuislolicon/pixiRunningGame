import * as PIXI from 'pixi.js'

export default class Entity {
    constructor(model, state) {
        this.model = model || {};
        this.size = 0.4;

        let width = 0,
            height = 0;
        
        if (model.Run) {
            this.mainRole = new PIXI.AnimatedSprite(model.Run);
            this.mainRole.anis = [];
            this.mainRole.currentAni = 'Run';
            this.mainRole.scale.set(this.size);
            this.mainRole.anchor.set(0.5);
            this.mainRole.x = state.mainRole.x;
            this.mainRole.y = state.mainRole.y;
            this.mainRole.play();

            width = model.Run.width;
            height = model.Run.height;
        }

    }
    get position() {
        return this.pixi.position;
    }

    update(state) {

        this.mainRole.y += state.mainRole.vy;
        // state.mainRole.y = this.mainRole.y;
        
        if (state.mainRole.vy > 0) {
            for (let i = 0; i < state.mainRole.vy; i++) {
                let posY = this.mainRole.y;
                if (posY > state.mainRole.maxY) {
                  state.mainRole.vy = 0;
                  this.mainRole.y = state.mainRole.maxY;
                }
            }
        }

        if (state.mainRole.vy < 0) {
            for (let i = state.mainRole.vy; i < 0; i++) {
                let posY = this.mainRole.y;
                if (posY < state.mainRole.minY) {
                    this.mainRole.y = state.mainRole.minY;
                }
            }
        }

        if (state.mainRole.ani !== this.mainRole.currentAni) {
            this.mainRole.currentAni = state.mainRole.ani;
            this.mainRole.textures = this.mainRole.anis[this.mainRole.currentAni];
            this.mainRole.play();
        }
    }
}