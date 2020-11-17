import { interval, scheduled } from 'rxjs';
import bgEntity from './bgEntity';

export default class Background {
    constructor(app) {
        this.app = app;
    }
    load() {
        const models = this.app.models.all;
        this.builds = new bgEntity(models.background);

        this.add(this.builds);
        this.addTicker();
    }
    add(entity) {
        this.app.runners.beforeAdd.run(entity);
        if (entity.far) this.app.stage.addChild(entity.far);
        if (entity.mid) this.app.stage.addChild(entity.mid);
    }
    addTicker() {
        const ticker = interval(0, scheduled.requestAnimationFrame);
        ticker.subscribe(() => this.builds.update());
    }
}