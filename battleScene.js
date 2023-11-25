/* SET UP VARIABLES AND SPRITES */
// Create an instance of sprite for the battle background
const battleBackground = new Sprite({
    position: {
        x: 0,
        y: 0
    },
    image: battleBackgroundImage
});

// Set up the variable that you will use inside of the initBattle function
let draggle;
let emby;
let renderedSprites;
let queue;

// Create the variable to hold the battle animation frames
let animateBattleID



/* SET UP THE FUNCTIONS */
// create the battle initiation function
function initBattle() {
    // Make the battle interface visible and set it up to start the battle
    document.querySelector('#battleInterface').style.display = 'block';
    document.querySelector('#dialogueBox').style.display = 'none';
    document.querySelector('#playerHealthStatus').style.width = '100%';
    document.querySelector('#enemyHealthStatus').style.width = '100%';
    document.querySelector('#battleButtons').replaceChildren();
    // assign the sprite object for draggle
    draggle = new Monster(monsters.Draggle);
    // assign the sprite object for emby
    emby = new Monster(monsters.Emby);
    // Assign the rendered sprites variables
    renderedSprites = [draggle, emby];
    // Make a queue for the attacks that will take place
    queue = [];
    // Add in the code to populate the battle buttons
    emby.attacks.forEach(attack => {
        var button = document.createElement('button');
        button.innerHTML = attack.name;
        document.querySelector('#battleButtons').append(button);
    });
    
    // Event Listeners
    document.querySelectorAll('button').forEach((button) => {
        button.addEventListener('click', (e) => {
            // Store the selected attack
            var selectedAttack = attacks[e.currentTarget.innerHTML];
            // Trigger the users attack
            emby.attack({
                attack: selectedAttack,
                recipient: draggle,
                renderedSprites
            });
    
            // If draggle health = 0 then faint
            if (draggle.health === 0) {
                queue.push(() => {
                    draggle.faint();
                });
                queue.push(() => {
                    // Now make the it fade to black to go back to the main map
                    gsap.to('#overlappingDiv', {
                        opacity: 1,
                        onComplete: () => {
                            cancelAnimationFrame(animateBattleID);
                            document.querySelector('#battleInterface').style.display = 'none';
                            animate();
                            audio.battle.stop();
                            audio.Map.play();
                            gsap.to('#overlappingDiv', {
                                opacity: 0
                            })
    
                        }
                    })
                });
                // Make sure to reset the battle.initiated variable to go back
                battle.initiated = false;
                return;
            }
    
            // Randomize the attack of the enemy
            var randomAttack = draggle.attacks[Math.floor(Math.random() * draggle.attacks.length)];
            // Add the enemy attack to the queue
            queue.push(() => {
                draggle.attack({
                    attack: randomAttack,
                    recipient: emby,
                    renderedSprites
                });
            });
    
            // If emby health will be = 0 then faint
            if (emby.health - randomAttack.damage <= 0) {
                queue.push(() => {
                    emby.faint();
                });
                queue.push(() => {
                    // Now make the it fade to black to go back to the main map
                    gsap.to('#overlappingDiv', {
                        opacity: 1,
                        onComplete: () => {
                            cancelAnimationFrame(animateBattleID);
                            document.querySelector('#battleInterface').style.display = 'none';
                            animate();
                            audio.Map.play();
                            gsap.to('#overlappingDiv', {
                                opacity: 0
                            })
    
                        }
                    })
                });
                // Make sure to reset the battle.initiated variable to go back
                battle.initiated = false;
                return;
            }
        });
    
        // Change the text to show the type of the current attack that player is hovering over
        button.addEventListener('mouseenter', (e) => {
            var selectedAttack = attacks[e.currentTarget.innerHTML];
            document.querySelector('#battleTypesText').innerHTML = selectedAttack.type;
            document.querySelector('#battleTypesText').style.color = selectedAttack.color;
        });
        // Change the attack type text back to show 'attack type'
        button.addEventListener('mouseleave', () => {
            document.querySelector('#battleTypesText').innerHTML = 'Attack Type';
            document.querySelector('#battleTypesText').style.color = 'black';
        })
    }); 
}

// animate battle function, draw the sprites and background
function animateBattle() {
    animateBattleID = window.requestAnimationFrame(animateBattle);
    battleBackground.draw();
    renderedSprites.forEach((sprite) => {
        sprite.draw();
    });
}

// Make an event listener so that when you click the dialogue box in battle, it continues to the next action in the queue
document.querySelector('#dialogueBox').addEventListener('click', (e) => {
    if (queue.length > 0) {
        queue[0]();
        queue.shift();
    } else {
        // If there is nothing left in the queue make the dialogue box disappear
        e.currentTarget.style.display = 'none';
    }
});





