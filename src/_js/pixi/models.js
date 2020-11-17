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
            },
            background: {
                far: resources['far'].texture,
                mid: resources['mid'].texture,
                front: resources['far'].texture
            },
            topMonsters: {
                texture: resources['zombie'].spritesheet.animations['zombie'],
            },
            bottomMonsters: {
                texture: resources['zombie'].spritesheet.animations['zombie'],
            },
            topStripe: {
                texture: resources['stripe'].texture,
            },
            bottomStripe: {
                texture: resources['stripe'].texture,
            },
            items: {
                texture: resources['oli'].texture,
            }
        }
    }

}