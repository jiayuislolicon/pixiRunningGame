import * as PIXI from 'pixi.js'
import Assets from './assets'
import Models from './models'
import Controller from './controller'
import Background from './background'
import Trigger from './trigger'

export class Application {
    constructor() {
        const options = {
            width: 1024,
            height: 576,
            backgroundColor: 0xffffff
        };

        this.renderer = new PIXI.Renderer(options);
        this.stage = new PIXI.Container();
        this.ticker = new PIXI.Ticker();

        this.ticker.add(() => {
            this.render();
        }, PIXI.UPDATE_PRIORITY.LOW);

        this.ticker.start();

        this.runners = {
            // A Runner is a highly performant and simple alternative to signals.
            // Best used in situations where events are dispatched to many objects at high frequency (say every frame!)
            init: new PIXI.Runner("init", 0),
            load: new PIXI.Runner("load", 0),
            beforeAdd: new PIXI.Runner("beforeAdd", 1)
        }

        this.loader = new PIXI.Loader();
        this.addComponent((this.assets = new Assets(this)));
        this.addComponent((this.models = new Models(this)));
        this.addComponent((this.background = new Background(this)));
        this.addComponent((this.trigger = new Trigger(this)));
        this.addComponent((this.controller = new Controller(this)));
    }
    addComponent(comp) {
        // Or for handling calling the same function on many items
        for (let key in this.runners) {
          let runner = this.runners[key];
          runner.add(comp);
        }
    }

    get view() {
        return this.renderer.view;
    }

    get screen() {
        return this.renderer.screen;
    }

    render() {
        this.renderer.render(this.stage);
    }

    destroy() {
        this.renderer.destroy();
        this.ticker.destroy();
    }
}