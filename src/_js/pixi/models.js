import * as PIXI from 'pixi.js';

export default class Models {
    constructor(app) {
        this.app = app;
    }
    load() {
        let { resources } = this.app.loader;
        this.all = {
            mainRole: {
                Run: resources['Run'].spritesheet.animations['Run'],
                Jump: resources['Jump'].spritesheet.animations['Jump'],
                Dead: resources['Dead'].spritesheet.animations["Dead"],
            }
        }
    }

}