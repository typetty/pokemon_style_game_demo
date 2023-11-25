/* SET UP THE VARIABLES */
// Set up the canvas and context variables to use in the script
const canvas = document.querySelector("canvas");
const context = canvas.getContext('2d');
// Set the canvas to a screen size
canvas.width = 1024;
canvas.height = 576;
// Create the variable to start the music once you start moving
let mapMusicOn = false;
// Create a dictionary to hold that value of whether the key is being pressed or not
const keys = {
    a: {
        pressed: false
    },
    w: {
        pressed: false
    },
    s: {
        pressed: false
    },
    d: {
        pressed: false
    }
}
// Set up the battle variable
var battle = {initiated: false}
// Constant that holds the offset values for the boundaries
const offset = {
    x: -300,
    y: -1530
}



/* SET UP THE MAPS VARIABLES */
// Set up the collisions map
const collisionsMap = [];
for (let i = 0; i < collisions.length; i += 70) {
    collisionsMap.push(collisions.slice(i, i + 70));
}
// Set up the battle zones map
const battleZonesMap = [];
for (let i = 0; i < battleZonesData.length; i += 70) {
    battleZonesMap.push(battleZonesData.slice(i, i + 70));
}
// Boundaries array 
const boundaries = [];
// Inserting the coordinates into the boundaries array
collisionsMap.forEach((row, i) => {
    row.forEach((symbol, j) => {
        if (symbol === 1) {
            boundaries.push(
                new Boundary({
                    position: {
                        x: j * Boundary.width + offset.x,
                        y: i * Boundary.height + offset.y
                    }
                })
            )
        }
    })
})
// Battle Zones array
const battleZones = [];
// Inserting the coordinates into the boundaries array
battleZonesMap.forEach((row, i) => {
    row.forEach((symbol, j) => {
        if (symbol === 1) {
            battleZones.push(
                new Boundary({
                    position: {
                        x: j * Boundary.width + offset.x,
                        y: i * Boundary.height + offset.y
                    }
                })
            )
        }
    })
})


// Get the player images for the sprites
const playerDownImage = new Image();
playerDownImage.src = './images/playerDown.png';

const playerUpImage = new Image();
playerUpImage.src = './images/playerUp.png';

const playerRightImage = new Image();
playerRightImage.src = './images/playerRight.png';

const playerLeftImage = new Image();
playerLeftImage.src = './images/playerLeft.png';

// Get the battle background image
const battleBackgroundImage = new Image();
battleBackgroundImage.src = './images/battleBackground.png';


/* Create the main Sprites for the game */
// First is the player sprite
const player = new Sprite({
    position: {
        x: canvas.width / 2 - 192 / 4 / 2, // Use the value of the width of the player sprite sheets (192) and adjust it to work on the canvas
        y: canvas.height / 2
    },
    image: playerDownImage,
    frames: {max: 4, hold: 10},
    sprites: {
        up: playerUpImage,
        down: playerDownImage,
        right: playerRightImage,
        left: playerLeftImage
    }
});

// Create an instance of Sprite for the map
const background = new Sprite({
    position: {
        x: offset.x,
        y: offset.y
    },
    image: {
        src: './images/pokemon_style_map.png'}
});

// Create the foreground image object
const foreground = new Sprite({
    position: {
        x: offset.x,
        y: offset.y
    },
    image: {
        src: './images/foreground_map.png'
    }
});

// Create the movables constant for the maps and things that need to move as you move the character
const movables = [background, ...boundaries, foreground, ...battleZones];




/* SET UP THE FUNCTIONS */
// Collision boolean function to determine if the player sprite is overlapping with the battle zones 
function objectCollision({object1, object2}){
    return (
        object1.position.x + object1.width >= object2.position.x &&
        object1.position.x <= object2.position.x + object2.width &&
        object1.position.y + object1.height >= object2.position.y &&
        object1.position.y <= object2.position.y + object2.height
        );
}

// The main animation function
function animate() {
    // make sure the battle interface is gone when loaded
    document.querySelector('#battleInterface').style.display = 'none';
    // Set the main animation ID for later use
    var animationID = window.requestAnimationFrame(animate);
    // Draw the background, boundaries, and battle zones on the map
    background.draw();
    boundaries.forEach(boundary => {
        boundary.draw();
    });
    battleZones.forEach(battleZone => {
        battleZone.draw();
    });
    // Draw the player in the center and the foreground objects so that the player can walk behind it
    player.draw();
    foreground.draw();
    // variable to keep track of colliding with boundaries
    var moving = true;
    player.animate = false;
    // If the battle is started then just return and stop the animation
    if (battle.initiated) {
        return;
    }
    // Check if player in the battle zone and then activate the battle
    if (keys.w.pressed || keys.a.pressed || keys.s.pressed || keys.d.pressed) {
        for (let i = 0; i < battleZones.length; i++){
            const battleZone = battleZones[i];
            // If the overlappingArea is more that 50% of the character area then start detection to start a battle
            const overlappingArea = 
                (Math.min(
                    player.position.x + player.width,
                    battleZone.position.x + battleZone.width
                ) - Math.max(player.position.x, battleZone.position.x)) 
                * (Math.min(
                    player.position.y + player.height,
                    battleZone.position.y + battleZone.height
                ) - Math.max(player.position.y, battleZone.position.y)) 
            // Now if the character collides with the battle zone, the overlapping area is greater than 50%, and a random number is less than .015 then initiate the battle sequence
            if (objectCollision({
                object1: player, 
                object2: battleZone
            }) && overlappingArea > player.width * player.height / 2
            && Math.random() < 0.015) {
                // Stop this animation all together
                window.cancelAnimationFrame(animationID);
                // Stop the background music and play the starting battle music and the main battle music
                audio.Map.stop();
                audio.initBattle.play();
                audio.battle.play();
                battle.initiated = true;
                // animation code referencing the gsap script linked to the html code to create the transition effect to the battle
                gsap.to("#overlappingDiv", {
                    opacity: 1,
                    repeat: 4,
                    yoyo: true,
                    duration: 0.2,
                    onComplete() {
                        // Activate the battle animation once the transition animation is completed
                        initBattle();
                        animateBattle();
                        gsap.to("#overlappingDiv", {
                            opacity: 0,
                            duration: 0.2
                        })
                    }
                });
                break;
            }
        }
    }

    // Change the position of the background according to the keys the user presses
    // Go up
    if (keys.w.pressed && lastKey === 'w') {
        for (let i = 0; i < boundaries.length; i++){
            player.image = player.sprites.up
            player.animate = true;
            var boundary = boundaries[i];
            if (objectCollision({
                object1: player, 
                object2: {
                    ...boundary,
                    position: {
                        x: boundary.position.x,
                        y: boundary.position.y + 3
                    }
                }
            })) {
                moving = false;
                break;
            }
        }
        if (moving){
            movables.forEach(movable => {
                movable.position.y += 3;
            })
        }
    }
    // To the Left
    if (keys.a.pressed && lastKey === 'a') {
        for (let i = 0; i < boundaries.length; i++){
            player.image = player.sprites.left
            player.animate = true;
            var boundary = boundaries[i];
            if (objectCollision({
                object1: player, 
                object2: {
                    ...boundary,
                    position: {
                        x: boundary.position.x + 3,
                        y: boundary.position.y
                    }
                }
            })) {
                moving = false;
                break;
            }
        }
        if (moving){
            movables.forEach(movable => {
                movable.position.x += 3;
            })
        }
    }
    // Go down
    if (keys.s.pressed && lastKey === 's') {
        for (let i = 0; i < boundaries.length; i++){
            player.image = player.sprites.down
            player.animate = true;
            var boundary = boundaries[i];
            if (objectCollision({
                object1: player, 
                object2: {
                    ...boundary,
                    position: {
                        x: boundary.position.x,
                        y: boundary.position.y - 3
                    }
                }
            })) {
                moving = false;
                break;
            }
        }
        if (moving){
            movables.forEach(movable => {
                movable.position.y -= 3;
            })
        }
    }
    // go to the Right
    if (keys.d.pressed && lastKey === 'd') {
        for (let i = 0; i < boundaries.length; i++){
            player.image = player.sprites.right
            player.animate = true;
            var boundary = boundaries[i];
            if (objectCollision({
                object1: player, 
                object2: {
                    ...boundary,
                    position: {
                        x: boundary.position.x - 3,
                        y: boundary.position.y
                    }
                }
            })) {
                moving = false;
                break;
            }
        }
        if (moving){
            movables.forEach(movable => {
                movable.position.x -= 3;
            })
        }
    }
}



/* EVENT LISTENERS */
// Create a lastKey variable so that you can not go in 2 directions at the same time
lastKey = '';
// Listen for when the keys are pressed down and make a trigger to start the music as soon as the player moves
window.addEventListener("keydown", (e) => {
    switch (e.key) {
        case 'w':
            keys.w.pressed = true;
            lastKey = 'w';
            if (!mapMusicOn) {
                audio.Map.play();
                mapMusicOn = true;
            }
            break;
        case 'a':
            keys.a.pressed = true;
            lastKey = 'a';
            if (!mapMusicOn) {
                audio.Map.play();
                mapMusicOn = true;
            }
            break;
        case 's':
            keys.s.pressed = true;
            lastKey = 's';
            if (!mapMusicOn) {
                audio.Map.play();
                mapMusicOn = true;
            }
            break;
        case 'd':
            keys.d.pressed = true;
            lastKey = 'd';
            if (!mapMusicOn) {
                audio.Map.play();
                mapMusicOn = true;
            }
            break; 
}
})

//Listen for when the keys are pressed up
window.addEventListener("keyup", (e) => {
    switch (e.key) {
        case 'w':
            keys.w.pressed = false;
            player.frames.val = 0
            break;
        case 'a':
            keys.a.pressed = false;
            player.frames.val = 0
            break;
        case 's':
            keys.s.pressed = false;
            player.frames.val = 0
            break;
        case 'd':
            keys.d.pressed = false;
            player.frames.val = 1
            break; 
}
})

// Call the animation function to start the game
animate()