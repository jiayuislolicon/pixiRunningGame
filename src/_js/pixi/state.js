const state = {
    mainRole: {
        x: 100,
        y: 400,
        vx: 0,
        vy: 1,
        ani: 'Run',
        side: 'bottom',
        maxY: 400,
        minY: 200,
        hp: 3,
        fixed: false
    },
    hitPoint: 'normal',
    appraise: {
        perfect: 0,
        great: 0,
        good: 0,
        bad: 0,
        miss: 0
    },
    score: 0,
    tempoCount: {
        top: 0,
        bottom: 0
    }
}

export default state;