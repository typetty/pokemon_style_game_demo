// Class for the boundaries
class Boundary {
    static width = 54
    static height = 54
    constructor({position}) {
        this.position = position
        this.width = 54
        this.height = 54
    }

    draw() {
        context.fillStyle = 'rgba(255, 0, 0, 0)'; // last parameter is opacity
        context.fillRect(this.position.x, this.position.y, this.width, this.height);
    }
}

// Sprite class for images and players
class Sprite {
    constructor({position, image, frames = {max: 1, hold: 10}, sprites, animate = false, rotation = 0}){
        this.position = position;
        this.image = new Image();
        this.frames = {...frames, val: 0, elapsed: 0};
        this.image.onload = () => {
            this.width = this.image.width / this.frames.max;
            this.height = this.image.height;
        }
        this.image.src = image.src;
        this.animate = animate;
        this.sprites = sprites;
        this.opacity = 1;
        this.rotation = rotation;
    }

    draw() {
        context.save();
        context.translate(this.position.x + this.width / 2, this.position.y + this.height / 2);
        context.rotate(this.rotation);
        // reset the coordinates of the rotation to (0, 0)
        context.translate(-this.position.x - this.width / 2, -this.position.y - this.height / 2);

        context.globalAlpha = this.opacity;
        context.drawImage(
            this.image,
            // Crop parameters for the image
            this.frames.val * this.width,
            0,
            this.image.width / this.frames.max,
            this.image.height,
            // Now it is just the position parameters where the image will be placed on the canvas
            this.position.x,
            this.position.y,
            // Actual width and height
            this.image.width / this.frames.max,
            this.image.height
        )
        context.restore();
        // animation code block, only start if the this.animate is true
        if (!this.animate) return;

        if (this.frames.max > 1) {
            this.frames.elapsed++
        }
        if (this.frames.elapsed % this.frames.hold === 0) {
            if (this.frames.val < this.frames.max - 1) this.frames.val++;
            else this.frames.val = 0;
        }
    }
}

// Monster class for monster sprites
class Monster extends Sprite {
    constructor({position, image, frames = {max: 1, hold: 10}, sprites, animate = false, isEnemy = false, rotation = 0, name, attacks}) {
        super({
            position,
            image,
            frames,
            sprites,
            animate,
            rotation
        });
        this.name = name;
        this.health = 100;
        this.isEnemy = isEnemy;
        this.attacks = attacks;
    }

    // Faint method and animations
    faint() {
        // create the timeline for the animations
        const tl = gsap.timeline();
        // create the variable on the direction to move whether it is the user of the enemy
        let faintMovement = 30;
        if (this.isEnemy) faintMovement = -30;
        // Tell when the monster fainted
        document.querySelector('#dialogueBox').innerHTML = this.name + ' fainted!';
        gsap.to(this.position, {
            x: this.position.x - faintMovement
        });
        tl.to(this, {
            opacity: 0,
        }).to(this.position, {
            x: this.position.x
        });
        // Play the victory music to end the battle and stop the battle music
        audio.battle.stop();
        audio.victory.play();
    }


    // Attack method and animations
    attack({attack, recipient, renderedSprites}) {
        // Show the dialogue block
        document.querySelector('#dialogueBox').style.display = 'block';
        document.querySelector('#dialogueBox').innerHTML = this.name + ' used ' + attack.name + '.';
        // Set up the distance the player moves depending on if enemy or player
        var movementDistance = 30
        if (this.isEnemy) movementDistance = -30
        // Set up which health bar is affected by the attack
        var healthBar = '#enemyHealthStatus';
        if (this.isEnemy) healthBar = '#playerHealthStatus';
        // Subtract the damage from the health variable for the sprite
        recipient.health -= attack.damage;
        // if the health < 0 then just make it exactly 0 so that the health bar shows an accurate representation
        if (recipient.health <= 0) {
            recipient.health = 0;
        }
        // set up the variable rotation depending on the direction of the fireball
        var rotation = 1;
        if (this.isEnemy) rotation = -3;
        //
        switch (attack.name) {
            // Fireball animation
            case 'Fireball':
                // Play the fireball initiation sound
                audio.initFireball.play();
                
                // Get the fireball image
                const fireballImage = new Image();
                fireballImage.src = './images/fireball.png';

                const fireball = new Sprite({
                    position: {
                        x: this.position.x,
                        y: this.position.y
                    },
                    image: fireballImage,
                    frames: {
                        max: 4,
                        hold: 10
                    },
                    animate: true,
                    rotation: rotation
                });
                renderedSprites.splice(1,0,fireball);
                

                gsap.to(fireball.position, {
                    x: recipient.position.x,
                    y: recipient.position.y,
                    duration: 0.75,
                    onComplete: () => {
                        // Play the fireball hit sound
                        audio.fireballHit.play();
                        // Enemy health bar goes down
                        gsap.to(healthBar, {
                            width: recipient.health + '%'
                        });
                        gsap.to(recipient.position, {
                            x: recipient.position.x + 10,
                            duration: 0.08,
                            yoyo: true,
                            repeat: 5
                        });
                        gsap.to(recipient, {
                            opacity: 0,
                            repeat: 5,
                            yoyo: true,
                            duration: 0.08
                        })
                        renderedSprites.splice(1,1);
                    }
                });

                break;

            // Tackle animation
            case 'Tackle':
                const tl = gsap.timeline()
                
                // Tackle movement
                tl.to(this.position, {
                    x: this.position.x - movementDistance,
                    duration: 0.35
                }).to(this.position, {
                    x: this.position.x + movementDistance * 2,
                    duration: 0.2,
                    onComplete: () => {
                        // Play the tackle hit sound
                        audio.tackleHit.play();
                        // Enemy health bar goes down
                        gsap.to(healthBar, {
                            width: recipient.health + '%'
                        });
                        gsap.to(recipient.position, {
                            x: recipient.position.x + 10,
                            duration: 0.08,
                            yoyo: true,
                            repeat: 5
                        });
                        gsap.to(recipient, {
                            opacity: 0,
                            repeat: 5,
                            yoyo: true,
                            duration: 0.08
                        })
                    }
                }).to(this.position, {
                    x: this.position.x,
                    duration: 0.5
                })

                break;
        }
    }
}