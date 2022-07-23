'use strict'

let canvas = document.getElementById("canvas"); // канвас - то, на чем рисуем
let ctx = canvas.getContext('2d'); //стх - чем мы рисуем


const SizeMultiplier = 0.25;
const GAME_OBJECT_PLAYER = 0;
const GAME_OBJECT_ENEMY = 1;
const GAME_OBJECT_BULLET = 2;

let gameObjects = [];

const AI_STATE_IDLE = 0;
const AI_STATE_MOVE_FORWARD = 1;
const AI_STATE_MOVE_BACKWARD = 2;
const AI_STATE_SHOOT = 3;
const AI_STATE_ROTATE_LEFT = 4;
const AI_STATE_ROTATE_RIGHT = 5;
const AI_STATE_TURRET_ROTATE_LEFT = 6;
const AI_STATE_TURRET_ROTATE_RIGHT = 7;

function drawRect(x, y, width, height, angle, color) {
    
    ctx.save();
    ctx.translate(x,y);
    ctx.rotate(-angle);

    ctx.fillStyle = color;
    ctx.fillRect(-width / 2, -height / 2, width, height);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 5;
    ctx.strokeRect(-width / 2, -height / 2, width, height);
    ctx.restore();

}

function addGameObject(type) {
    let gameObject = {
        type: type,
        x: 400,
        y: 100,
        speedX: 0,
        speedY: 0,
        angle: 0,
        turretAngle: 0,
        rotateSpeed: 0.2,
        accel: 13,
        height: 10,
        width: 10,
        color: "black",
        collisionRadius: 7.5*SizeMultiplier,
        friction: 0.96,
        exists: true,

        //bullet
        lifetime: 0,
        shooter : 0,

        //enemy
        aiState: AI_STATE_IDLE,
        aiTimer: 0,

    }



    let freeIndex = gameObjects.length;

    for (let gameObjectIndex = 0; gameObjectIndex < gameObjects.length; gameObjectIndex++) {
        const gameObject = gameObjects[gameObjectIndex]
        if (!gameObject.exists) {
            freeIndex = gameObjectIndex;
            break
        }
    }



    gameObjects[freeIndex] = gameObject;
    return gameObject;
}

function removeGameObject(gameObject) {
    gameObject.exists = false
}

let player = addGameObject(GAME_OBJECT_PLAYER)
    player.x = 100*SizeMultiplier;
    player.y = 100*SizeMultiplier;
    player.speedX = 0;
    player.speedY = 0;
    player.angle = 0;

    player.turretAngle = 0;
    player.turretWidth = 200*SizeMultiplier;
    player.turretHeight = 20*SizeMultiplier;
    player.turretRadius = 80*SizeMultiplier;
    player.turretRotateSpeed = 0.01747;

    player.rotateSpeed = 0.01747;
    player.accel = 2*SizeMultiplier;
    player.height = 173*SizeMultiplier;
    player.width = 330*SizeMultiplier;
    player.color = "green";
    player.friction = 0.92;
    player.cooldown = 0;
    player.cooldownConst = 35;
    player.collisionRadius = 160*SizeMultiplier
    

let enemy1 = addGameObject(GAME_OBJECT_ENEMY) 
    enemy1.x = 500*SizeMultiplier;
    enemy1.y = 400*SizeMultiplier;
    enemy1.speedX = 0;
    enemy1.speedY = 0;
    enemy1.angle = 0;

    enemy1.turretAngle = 0;
    enemy1.turretWidth = 200*SizeMultiplier;
    enemy1.turretHeight = 20*SizeMultiplier;
    enemy1.turretRadius = 75*SizeMultiplier;
    enemy1.turretRotateSpeed = 0.01747;

    enemy1.rotateSpeed = 0.00747;
    enemy1.accel = 2*SizeMultiplier;
    enemy1.height = 173*SizeMultiplier;
    enemy1.width = 330*SizeMultiplier;
    enemy1.color = "white";
    enemy1.friction = 0.92
    enemy1.collisionRadius = 160*SizeMultiplier

    enemy1.cooldown = 0;
    enemy1.cooldownConst = 35;

let enemy2 = addGameObject(GAME_OBJECT_ENEMY) 
    enemy2.x = 1500*SizeMultiplier;
    enemy2.y = 1400*SizeMultiplier;
    enemy2.speedX = 0;
    enemy2.speedY = 0;
    enemy2.angle = 4;

    enemy2.turretAngle = 0;
    enemy2.turretWidth = 200*SizeMultiplier;
    enemy2.turretHeight = 20*SizeMultiplier;
    enemy2.turretRadius = 75*SizeMultiplier;
    enemy2.turretRotateSpeed = 0.01747;

    enemy2.rotateSpeed = 0.00747;
    enemy2.accel = 2*SizeMultiplier;
    enemy2.height = 173*SizeMultiplier;
    enemy2.width = 330*SizeMultiplier;
    enemy2.color = "magenta";
    enemy2.friction = 0.92
    enemy2.collisionRadius = 160*SizeMultiplier

    enemy2.cooldown = 0;
    enemy2.cooldownConst = 35;

const friction = 0.92; //ТРЕНИЕ

let camera = {
    x: 0,
    y: 0,
    width: canvas.width,
    height: canvas.height
}


canvas.width = 3000;
canvas.height = 2400;
canvas.style.width = innerWidth;
canvas.style.height = innerHeight;

function angBetwPoints(x1,y1,x2,y2) {

    let length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    let result = (Math.acos((x2 - x1) / length));
    if (y2 > y1) {
        result = -result;
    }
    return result;


}

function getRandomInt(start, end) {
    let result = Math.floor(start+Math.random()*(end-start)+0.5);
    return result;

}

function rotateVector(x, y, angle) {

    let sin = Math.sin(angle);
    let cos = Math.cos(angle);
    let resultX = x * cos - y * sin;
    let resultY = -y * cos - x * sin;
    return {
        x: resultX,
        y: resultY,
    };

    /*
    let resultX = x*Math.cos(angle);
    let resultY = -y*Math.sin(angle);
    return {
        x: resultX,
        y: resultY
    }*/
}

function drawCircle(x, y, radius, color, width, filling, filColor) {

    ctx.save();
    ctx.translate(x,y);
    ctx.strokeStyle = color
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI*2);
    if (filling) {
        ctx.fillStyle = filColor;
        ctx.fill()
    }
    ctx.stroke();
    ctx.restore();
}

/*function drawTurret(x, y, turretWidth, turretHeight, turretRadius, turretAngle, color) {
    let turretVector=rotateVector(turretWidth, 0, turretAngle);
    drawCircle(x, y, turretRadius, 'black', 5, true, 'green');
    drawRect(turretVector.x, turretVector.y, turretWidth, turretHeight, turretAngle, color);
}*/

function rotateTurret(startX, startY, startAngle, targetPointX, targetPointY, rotateSpeed) {

    

    /*let rotateAngle = angBetwPoints(startX, startY, targetPointX, targetPointY);
    rotateAngle -= startAngle;
    if (Math.abs(rotateAngle)>rotateSpeed) {
        if (rotateAngle<0) {
            rotateAngle -=rotateSpeed
        }
        else {
            rotateAngle +=rotateSpeed
        }
    }
    return rotateAngle;*/
}

function bulletSpawn(gameObject) {
    let bullet = addGameObject(GAME_OBJECT_BULLET)
            bullet.width = 255*SizeMultiplier;
            bullet.height = 55*SizeMultiplier;
            let turretAddition = rotateVector(gameObject.turretWidth, 0, gameObject.turretAngle);
            bullet.x = gameObject.x+turretAddition.x*2;
            bullet.y = gameObject.y+turretAddition.y*2;
            bullet.angle = gameObject.turretAngle;
            bullet.friction = 0.996;
            bullet.accel = 0.5*SizeMultiplier;
            let speed = rotateVector(150*SizeMultiplier, 0, gameObject.turretAngle);
            bullet.speedX = speed.x;
            bullet.speedY = speed.y;
            bullet.lifetime = 150;
    return bullet
}

function updateGameObject(gameObject) {

    if (gameObject.type === GAME_OBJECT_PLAYER) {

        camera.x = gameObject.x;
        camera.y = gameObject.y;
        if (gameObject.cooldown>0) {
            gameObject.cooldown-=1;
        }

        if (rightKey.isDown) {
            if (!downKey.isDown) {
                gameObject.angle -= gameObject.rotateSpeed;
            }
            else {
                gameObject.angle += gameObject.rotateSpeed;
            }
        };
        if (leftKey.isDown) {
            if (!downKey.isDown) {
                gameObject.angle += gameObject.rotateSpeed;
            }
            else {
                gameObject.angle -= gameObject.rotateSpeed;
            }
        };
    
        if (upKey.isDown) {
            
            let speedVector = rotateVector(gameObject.accel, 0, gameObject.angle)
            gameObject.speedX += speedVector.x;
            gameObject.speedY += speedVector.y;
        };
    
        if (downKey.isDown) {
            let speedVector = rotateVector(gameObject.accel, 0, gameObject.angle)
            gameObject.speedX += -speedVector.x;
            gameObject.speedY += -speedVector.y;
        };

        //gameObject.turretAngle=-gameObject.angle+rotateTurret(gameObject.x, gameObject.y, gameObject.angle+gameObject.turretAngle, mouse.x, mouse.y, 100/* gameObject.turretRotateSpeed*/);

        let gmObjAngle = angBetwPoints(gameObject.x, gameObject.y, mouse.worldX, mouse.worldY);
        gameObject.turretAngle = gmObjAngle;
        

        if (spaceKey.wentDown && (gameObject.cooldown<=0)) {
            let bullet = bulletSpawn(gameObject);
            bullet.shooter = GAME_OBJECT_PLAYER;
            gameObject.cooldown = gameObject.cooldownConst;
        };

        

    }

    

    if (gameObject.type === GAME_OBJECT_ENEMY) {
        switch (gameObject.aiState) {
            case AI_STATE_IDLE: {

            } break;

            case AI_STATE_ROTATE_LEFT: {
                gameObject.angle += gameObject.rotateSpeed;
            } break;
            
            case AI_STATE_ROTATE_RIGHT: {
                gameObject.angle -= gameObject.rotateSpeed;
            } break;
            
            case AI_STATE_TURRET_ROTATE_LEFT: {
                gameObject.turretAngle += gameObject.turretRotateSpeed;
            } break;
            
            case AI_STATE_TURRET_ROTATE_RIGHT: {
                gameObject.turretAngle -= gameObject.turretRotateSpeed;
            } break;
            
            case AI_STATE_SHOOT: {
                console.log(gameObject.cooldown)
                if (gameObject.cooldown<=0) {
                    
                    gameObject.cooldown=gameObject.cooldownConst
                    let bullet = bulletSpawn(gameObject);
                    bullet.shooter = GAME_OBJECT_ENEMY;
                };
            } break;
            
            case AI_STATE_MOVE_FORWARD: {
                let speedVector = rotateVector(gameObject.accel, 0, gameObject.angle)
                gameObject.speedX += speedVector.x;
                gameObject.speedY += speedVector.y;
            } break;
            
            case AI_STATE_MOVE_BACKWARD: {
                let speedVector = rotateVector(gameObject.accel, 0, gameObject.angle)
                gameObject.speedX -= speedVector.x;
                gameObject.speedY -= speedVector.y;

            } break;
            
            
        }
        if (gameObject.aiTimer <=0) {
            gameObject.aiState = getRandomInt(AI_STATE_IDLE, AI_STATE_TURRET_ROTATE_RIGHT);
            gameObject.aiTimer = 60;
            console.log(gameObject.aiState)
        };
        //COLLISION CHECK
        for (let gameObjectIndex = 0; gameObjectIndex < gameObjects.length; gameObjectIndex++) {
            let other = gameObjects[gameObjectIndex]
            if (other.exists) {
                if (other.type!==gameObject.type && other.type!==GAME_OBJECT_BULLET) {
                    // COLLISION CHECK
                    let radiusSum = gameObject.collisionRadius + other.collisionRadius;
                    let a = other.x - gameObject.x;
                    let b = other.y - gameObject.y;
                    let dist = Math.sqrt(a*a+b*b);
                    if (dist < radiusSum) {
                        gameObject.x+=gameObject.speedX/Math.abs(gameObject.speedX)*(radiusSum-Math.abs(a));
                        gameObject.y+=gameObject.speedY/Math.abs(gameObject.speedY)*(radiusSum-Math.abs(b));
                    }
                }
            }
            }
        gameObject.aiTimer -=1;
        gameObject.cooldown -=1;
    }

    if (gameObject.type === GAME_OBJECT_BULLET) {

        gameObject.speedX *= gameObject.friction;
        gameObject.speedY *= gameObject.friction;
        gameObject.lifetime -= 1;

        for (let gameObjectIndex = 0; gameObjectIndex < gameObjects.length; gameObjectIndex++) {
            let other = gameObjects[gameObjectIndex]
            if (other.exists) {
                if (other.type === GAME_OBJECT_ENEMY && gameObject.shooter === GAME_OBJECT_PLAYER) {
                    // COLLISION CHECK
                    const radiusSum = gameObject.collisionRadius + other.collisionRadius;
                    const a = other.x - gameObject.x;
                    const b = other.y - gameObject.y;
                    const dist = Math.sqrt(a*a+b*b);
                    if (dist < radiusSum) {
                        other.exists = false;
                        removeGameObject(gameObject);
                    }
                }
                if (other.type === GAME_OBJECT_PLAYER && gameObject.shooter === GAME_OBJECT_ENEMY) {
                    // COLLISION CHECK
                    const radiusSum = gameObject.collisionRadius + other.collisionRadius;
                    const a = other.x - gameObject.x;
                    const b = other.y - gameObject.y;
                    const dist = Math.sqrt(a*a+b*b);
                    if (dist < radiusSum) {
                        other.exists = false;
                        removeGameObject(gameObject);
                    }
                }
                if (gameObject.lifetime<=0) {
                    removeGameObject(gameObject)
                }
            }
        }

    }

    
    //

    drawRect(gameObject.x, gameObject.y, gameObject.width, gameObject.height, gameObject.angle, gameObject.color)
    
    

    let turretVector = rotateVector(gameObject.turretWidth / 2, 0, gameObject.turretAngle);
    drawRect(gameObject.x + turretVector.x, gameObject.y + turretVector.y, gameObject.turretWidth, gameObject.turretHeight, gameObject.turretAngle, gameObject.color);
    drawCircle(gameObject.x, gameObject.y, gameObject.turretRadius, 'black', 5, true, gameObject.color)
    drawCircle(gameObject.x, gameObject.y, gameObject.collisionRadius, 'red', 5, false, 'red')

    //drawTurret(gameObject.x, gameObject.y, gameObject.turretWidth, gameObject.turretHeight, gameObject.turretRadius, gameObject.turretAngle, gameObject.color);
    
    

    gameObject.speedX *= gameObject.friction;
    gameObject.speedY *= gameObject.friction;

    gameObject.x+=gameObject.speedX;
    gameObject.y+=gameObject.speedY;



}

function loop() {

    mouse.worldX=mouse.x+camera.x-canvas.width/2;
    mouse.worldY=mouse.y+camera.y-canvas.height/2;
    ctx.save();
    ctx.translate(-camera.x + canvas.width / 2, -camera.y + canvas.height / 2);

    drawRect(camera.x,camera.y,canvas.width,canvas.height,0,'grey');


    
    for (let gameObjectsIndex = 0 ; gameObjectsIndex < gameObjects.length; gameObjectsIndex++) {
        let gameObject = gameObjects[gameObjectsIndex];
        if (gameObject.exists) {
            updateGameObject(gameObject);
        }
    }

    clearKeys();
    ctx.restore();
    requestAnimationFrame(loop);
    
}

//запрос обновления кадров
requestAnimationFrame(loop);
