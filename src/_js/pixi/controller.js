import { Observable, Subscriber } from 'rxjs';
import * as PIXI from 'pixi.js'
import initialState from './state';
import Entity from './entity';
import { KEYCODE } from './constants'

export default class Controller {
    constructor(app) {
        this.app = app;
        // this.entities = [];
    }
    load() {
        const models = this.app.models.all;
        this.mainRole = new Entity(models.mainRole, initialState);
        this.add(this.mainRole);
        this.addEvent();
    }
    add(entity) {
        this.app.runners.beforeAdd.run(entity);
        if (entity.mainRole) {
            this.app.stage.addChild(entity.mainRole);
        }
    }
    addEvent() {

        // const keydown = Rx.Observable
        // .fromEvent(document, 'keydown', e => {
        //     switch (e.keyCode) {
        //         case KEYCODE.up:
        //             return 1
        //         case KEYCODE.down:
        //             return -1
        //         default:
        //     }
        // })
        // const keyup = Rx.Observable
        // .fromEvent(document, 'keyup', e => {
        //     switch (e.keyCode) {
        //         case KEYCODE.up:
        //             return 1
        //         case KEYCODE.down:
        //             return -1
        //         default:
        //     }
        // })
        // .withLatestFrom(keydown)
        // .filter(([keyup, keydown]) => keyup == keydown)
        // .map(() => 0);

        // const inputKeyValue = Rx.Observable
        // .merge(keydown, keyup)
        // .startWith(0)
        // .distinctUntilChanged();

        // const ticker = Rx.Observable
        // .interval(0, Rx.Scheduler.requestAnimaionFrame);

        // const state = ticker
        // .withLatestFrom(inputKeyValue)
        // .scan(({role}, inputKeyValue) => {
        //     switch (inputKeyValue) {
        //         case -1:
        //             role.vx = -1;
        //             role.ani = 'run';
        //             break;
        //         case 1:
        //             role.vx = 1;
        //             role.ani = 'run';
        //             break;
        //         case 0:
        //             role.vx = 0;
        //             role.ani = 'run';
        //             break;
        //     }
        // });

        // ticker
        // .withLatestFrom(state)
        // .subscribe((state) => {
        //     pixiRender.render(state, renderer)
        // })
    }
}
