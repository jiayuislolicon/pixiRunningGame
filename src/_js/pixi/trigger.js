import TriggerItmes from './triggerEntity';
import ItemArray from './itemArray';
import initialState from './state';
import { KEYCODE } from './constants'
import { fromEvent, interval, scheduled } from 'rxjs';
import { distinctUntilChanged, filter, map, startWith, withLatestFrom } from 'rxjs/operators';

export default class Trigger {
    constructor(app) {
        this.app = app;
        this.tempoItems = [];
    }
    load() {
        const models = this.app.models.all;
        // 把所有要做的東西叫出來
        this.addEvent();
    }
    add(entity) {
        this.app.runners.beforeAdd.run(entity);
        // 叫出來後加入到場景
    }
    addEvent() {
        // 判定要使用的規則

        // 對每個物件都給予leave()

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
                        default:
                            return 0
                    }
                }),
            )

            // .subscribe(t => console.log(t))

        // const ticker = interval(0, scheduled.requestAnimationFrame);
        // const itemState = ticker
        //     .pipe(
        //         withLatestFrom(keyDownPress),
        //         scan(({mainRole}, [ticker, keyDownPress]) => {
        //             switch (keyDownPress) {
        //                 case -1:
        //                     break;
        //                 case 1:
        //                     break;
        //                 default:
        //             }
        //         })
        //     )
        // 按下按鍵的時候，看是按哪一個按件，來對上還是下的目前第{tempoCount}個項目
        // 對這個項目判斷是哪種type，對照type給予function
        // 長條比較特別
        // keydown執行hitStripe()
        // repeat執行midStripe()
        // keyup執行lastStripe()
    }
}