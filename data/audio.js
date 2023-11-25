const audio = {
    Map: new Howl({
        src: './audio/map.wav',
        html5: true,
        volume: 0.5
    }),
    battle: new Howl({
        src: './audio/battle.mp3',
        html5: true,
        volume: 0.1
    }),
    initBattle: new Howl({
        src: './audio/initBattle.wav',
        html5: true,
        volume: 0.03
    }),
    tackleHit: new Howl({
        src: './audio/tackleHit.wav',
        html5: true,
        volume: 0.2
    }),
    fireballHit: new Howl({
        src: './audio/fireballHit.wav',
        html5: true,
        volume: 0.2
    }),
    initFireball: new Howl({
        src: './audio/initFireball.wav',
        html5: true,
        volume: 0.2
    }),
    victory: new Howl({
        src: './audio/victory.wav',
        html5: true,
        volume: 0.65
    })
}