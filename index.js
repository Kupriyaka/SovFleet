'use strict'

let canvas = document.getElementById("canvas"); // канвас - то, на чем рисуем
let ctx = canvas.getContext('2d'); //стх - чем мы рисуем

const GAME_OBJECT_PLAYER = 0
const GAME_OBJECT_ENEMY = 1
const GAME_OBJECT_BULLET = 2

let gameObjects = [];

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
        collisionRadius: 7.5,
        friction: 0.96,
        exists: true
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
    player.x = 100;
    player.y = 100;
    player.speedX = 0;
    player.speedY = 0;
    player.angle = 0;
    player.turretAngle = 0;
    player.rotateSpeed = 0.01747;
    player.accel = 2;
    player.height = 173;
    player.width = 330;
    player.color = "green";
    player.friction = 0.92;
    player.cooldown = 0;
    player.cooldownConst = 35;

let enemy1 = addGameObject(GAME_OBJECT_ENEMY) 
    enemy1.x = 500;
    enemy1.y = 400;
    enemy1.speedX = 0;
    enemy1.speedY = 0;
    enemy1.angle = 0;
    enemy1.turretAngle = 0;
    enemy1.rotateSpeed = 0.00747;
    enemy1.accel = 2;
    enemy1.height = 330;
    enemy1.width = 173;
    enemy1.color = "black";
    enemy1.friction = 0.92
    enemy1.collisionRadius = 160

let enemy2 = addGameObject(GAME_OBJECT_ENEMY) 
    enemy2.x = 1500;
    enemy2.y = 1400;
    enemy2.speedX = 0;
    enemy2.speedY = 0;
    enemy2.angle = 4;
    enemy2.turretAngle = 0;
    enemy2.rotateSpeed = 0.00747;
    enemy2.accel = 2;
    enemy2.height = 330;
    enemy2.width = 173;
    enemy2.color = "black";
    enemy2.friction = 0.92
    enemy2.collisionRadius = 160

const friction = 0.92; //ТРЕНИЕ

let camera = {
    x: 0,
    y: 0
}


canvas.width = 3000;
canvas.height = 3000;

function angBetwPoints(x1,y1,x2,y2) {

    return Math.atan((y2-y1)/(x2-x1)); 

}

function updateScope(scoping,scoped) {

    angBetwPoints(scoping.x,scoping.y,scoped.x,scoped.y)
    angBetwPoints(scoping.x,scoping.y,scoped.x,scoped.y)

}

function updateGameObject(gameObject) {

    if (gameObject.type === GAME_OBJECT_PLAYER) {

        if (gameObject.cooldown>0) {
            gameObject.cooldown-=1;
        }

        if (rightKey.isDown) {
            if (!downKey.isDown) {
                gameObject.angle -= gameObject.rotateSpeed;
            }
            else {
                gameObject.angle += gameObject.rotateSpeed
            }
        };
        if (leftKey.isDown) {
            if (!downKey.isDown) {
                gameObject.angle += gameObject.rotateSpeed;
            }
            else {
                gameObject.angle -= gameObject.rotateSpeed
            }
        };
    
        if (upKey.isDown) {
            gameObject.speedX += gameObject.accel*Math.cos(gameObject.angle);
            gameObject.speedY -= gameObject.accel*Math.sin(gameObject.angle);
        };
    
        if (downKey.isDown) {
            gameObject.speedX -= gameObject.accel*Math.cos(gameObject.angle);
            gameObject.speedY += gameObject.accel*Math.sin(gameObject.angle);
        };

        if (spaceKey.wentDown && (gameObject.cooldown===0)) {
            gameObject.cooldown=gameObject.cooldownConst
            let bullet = addGameObject(GAME_OBJECT_BULLET)
            bullet.width = 255;
            bullet.height = 55;
            bullet.x = gameObject.x+gameObject.width/2*Math.cos(gameObject.angle);
            bullet.y = gameObject.y-gameObject.height/2*Math.sin(gameObject.angle);
            bullet.angle = gameObject.angle;
            bullet.friction = 0.996;
            bullet.accel = 0.5;
            bullet.speedX = 150*Math.cos(gameObject.angle);
            bullet.speedY = 150*-Math.sin(gameObject.angle);
            bullet.lifetime = 150;
            
        };

    }

    if (gameObject.type === GAME_OBJECT_ENEMY) {
        
    }

    if (gameObject.type === GAME_OBJECT_BULLET) {

        gameObject.speedX *= gameObject.friction;
        gameObject.speedY *= gameObject.friction;
        gameObject.lifetime -= 1;

        for (let gameObjectIndex = 0; gameObjectIndex < gameObjects.length; gameObjectIndex++) {
            let other = gameObjects[gameObjectIndex]
            if (other.exists) {
                if (other.type === GAME_OBJECT_ENEMY) {
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
    
    console.log(spaceKey.wentDown);
    ctx.save();
    ctx.translate(gameObject.x,gameObject.y);
    ctx.rotate(-gameObject.angle);
    ctx.fillStyle = gameObject.color;
    ctx.fillRect(-gameObject.width / 2, -gameObject.height / 2, gameObject.width, gameObject.height);
    ctx.restore();

    gameObject.speedX *= gameObject.friction;
    gameObject.speedY *= gameObject.friction;

    gameObject.x+=gameObject.speedX;
    gameObject.y+=gameObject.speedY;



}

function loop() {

    ctx.fillStyle = 'grey';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
        
    
    
    
    
    
    
    for (let gameObjectsIndex = 0 ; gameObjectsIndex < gameObjects.length; gameObjectsIndex++) {
        let gameObject = gameObjects[gameObjectsIndex];
        if (gameObject.exists) {
            updateGameObject(gameObject);
        }
    }

    clearKeys();
    
    requestAnimationFrame(loop);
    
}

//запрос обновления кадров
requestAnimationFrame(loop);
