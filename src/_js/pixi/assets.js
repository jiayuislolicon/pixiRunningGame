export default class Assets {
    constructor(app) {
        this.app = app;
    }
    init() {
        const loadOptions = { crossOrigin: true };
        const loader = this.app.loader;
        loader
            .add('far', '/assets/images/bg-far.png')
            .add('mid', '/assets/images/bg-mid.png')
            .add('builds', '/assets/images/build.json', loadOptions)
            .add('Dead', '/assets/images/dead.json', loadOptions)
            .add('Jump', '/assets/images/jump.json', loadOptions)
            .add('Run', '/assets/images/run.json', loadOptions)
            .add('zombie', '/assets/images/zombieWalk.json', loadOptions)
            .add('deadFire', '/assets/images/dead_fire.png')
            .add('fire', '/assets/images/fire.png')
            .add('stripe', '/assets/images/stripe.png')
            .add('oli', '/assets/images/oli.png')
            .load(() => {
                this.app.runners.load.run();
            });
    }
}