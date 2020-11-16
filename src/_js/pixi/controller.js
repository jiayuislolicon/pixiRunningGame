import { fromEvent, interval, merge, scheduled } from 'rxjs';
import { distinctUntilChanged, map, filter, withLatestFrom, startWith, scan } from 'rxjs/operators';
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
        const keyDowns = fromEvent(document, 'keydown');
        const keyUps = fromEvent(document, 'keyup');

        const keyDownPress = keyDowns
            .pipe (
                filter(e => !e.repeat),
                map(e => {
                    switch (e.keyCode) {
                        case KEYCODE.up:
                            return -1
                        case KEYCODE.down:
                            return 1
                    }
                })
            )
        

        const keyUpPress = keyUps
            .pipe (
                filter(e => !e.repeat),
                map(() => 1)
            )
        
        const directionValue = merge(keyDownPress, keyUpPress)
        .pipe(
            startWith(1),
            distinctUntilChanged()
        )

        const ticker = interval(0, scheduled.requestAnimationFrame)

        const roleState = ticker
            .pipe(
                withLatestFrom(directionValue),
                scan(({mainRole}, [ticker, directionValue]) => {
                    switch (directionValue) {
                        case -1:
                            mainRole.vy = -20;
                            mainRole.side = 'bottom';
                            mainRole.ani = 'Run';
                            break;
                        case 1:
                            mainRole.vy = 20;
                            mainRole.side = 'top';
                            mainRole.ani = 'Run';
                            break;
                        default:
                    }
                    return {mainRole}
                }, initialState)
            )

        ticker
            .pipe (
                withLatestFrom(roleState)
            )
            .subscribe(([ticker, state]) => {
              this.mainRole.update(state)
            })
    }
}
