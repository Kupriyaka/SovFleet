'use strict'

let canvas = document.getElementById("canvas"); // канвас - то, на чем рисуем
let ctx = canvas.getContext('2d'); //стх - чем мы рисуем


let SizeMultiplier = 0.25;

let drawTestMode = false;

const GAME_OBJECT_PLAYER = 0;
const GAME_OBJECT_ENEMY = 1;
const GAME_OBJECT_BULLET = 2;
const GAME_OBJECT_OBSTACLE = 3;
const GAME_OBJECT_PRESSABLE = 4;

let gameObjects = [];


const AI_STATE_IDLE = 0;
const AI_STATE_MOVE_FORWARD = 1;
const AI_STATE_MOVE_BACKWARD = 2;
const AI_STATE_SHOOT = 3;
const AI_STATE_ROTATE_LEFT = 4;
const AI_STATE_ROTATE_RIGHT = 5;
const AI_STATE_TURRET_ROTATE_LEFT = 6;
const AI_STATE_TURRET_ROTATE_RIGHT = 7;

let timers = [];
function addtimer() {
    let timerIndex = timers.length;
    timers.push(0);
    return timerIndex
}

function addPoint(Points, x, y){
    let point = new V2(x,y);
    Points.push(point);
}

function updateTimers() {
    for (let timersIndex = 0; timersIndex < timers.length; timersIndex++) {
        timers[timersIndex] -=1;
    }
}



function IsPolygonsIntersecting(pointsInput1, pointsInput2, pos1, pos2, angle1, angle2, tempcolor) {
    let criticalPoints = []
    let collisionArea = []
    
    if (angle1-angle2!=0) 
    {
        let foo=0
    }

    let points1 = rotatePoints(pointsInput1, angle1);
    let points2 = rotatePoints(pointsInput2, angle2);
    for (let pointIndex = 0; pointIndex < points1.length; pointIndex++) {
        let point1 = points1[pointIndex];
        let point2 = points1[(pointIndex + 1) % points1.length];

        let guideVec = new V2(point2.x - point1.x, point2.y - point1.y);
        let normal = unit(rotateVector(guideVec, -Math.PI / 2))
        let min = Infinity
        let minNum
        for (let index = 0; index < points2.length; index++) {
            let point = points2[index]
            let dotProd = dot(normal, point)
            if (dotProd < min) {
                min = dotProd
                minNum = index
            }
        }

        criticalPoints.push(minNum)
        criticalPoints.push(minNum)
    }

    collisionArea = []
    //startDrawing(criticalPoints[0].x, criticalPoints[0].y)
    //connectPoints(criticalPoints)
    for (let pointIndex = 1; pointIndex <points1.length+1; pointIndex++) {
        let realIndex = pointIndex % points1.length
        let point1 = criticalPoints[pointIndex * 2 - 1]
        let point2 = criticalPoints[pointIndex * 2 % criticalPoints.length]

        let betweenIndex = point2;
        while (betweenIndex !== (point1 - 1) % points2.length) {
            collisionArea.push(new V2(points1[realIndex].x - points2[betweenIndex].x, points1[realIndex].y - points2[betweenIndex].y))
            betweenIndex--
            betweenIndex = betweenIndex % points2.length
        }

    }
    //ctx.closePath()

    collisionArea = dislocatePoints(collisionArea, pos1)
    startDrawing(collisionArea[0].x, collisionArea[0].y)
    connectPoints(collisionArea)
    ctx.fillStyle = 'purple'
    ctx.fill()
    if (ctx.isPointInPath(pos2.x, pos2.y)) {
        tempcolor = 'white'
    } else {
        tempcolor = 'red'
    }
    ctx.closePath()
}


function drawRect(x, y, width, height, angle, color) {

    ctx.save();
    ctx.translate(x, y);
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
        collidable: false,
        speedX: 0,
        speedY: 0,
        angle: 0,
        turretAngle: 0,
        rotateSpeed: 0.2,
        accel: 13,
        height: 10,
        width: 10,
        color: "black",
        tempcolor: "white",
        collisionRadius: 7.5,
        friction: 0.96,
        exists: true,
        main_sprite: null,
        turret_sprite: null,

        //entity
        cooldown: addtimer(),

        //bullet
        lifetime: addtimer(),
        shooter: 0,

        //enemy
        aiState: AI_STATE_IDLE,
        aiTimer: addtimer(),

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

function makePlayer() {
let player = addGameObject(GAME_OBJECT_PLAYER)
player.x = 100;
player.y = 100;
player.speedX = 0;
player.speedY = 0;
player.angle = 0;
player.collidable = true;

player.turretAngle = 0;
player.turretWidth = 200;
player.turretHeight = 20;
player.turretRadius = 80;
player.turretRotateSpeed = 0.07747;

player.rotateSpeed = 0.01747;
player.accel = 2;
player.height = 173;
player.width = 330;
player.color = "green";
player.friction = 0.92;
player.collisionRadius = 160

player.main_sprite = imgT72body;
player.turret_sprite = imgT72turret;
}

let button = addGameObject(GAME_OBJECT_PRESSABLE)
button.x = 100;
button.y = 100;
button.angle = 0;
button.height = 173;
button.width = 330;
button.color = "green";
button.cooldown = 0;
button.cooldownConst = 35;
button.collisionRadius = 0;

function makeEnemy1() {
let enemy1 = addGameObject(GAME_OBJECT_ENEMY)
enemy1.x = 500;
enemy1.y = 400;
enemy1.speedX = 0;
enemy1.speedY = 0;
enemy1.angle = 0;
enemy1.collidable = true;

enemy1.turretAngle = 0;
enemy1.turretWidth = 200;
enemy1.turretHeight = 20;
enemy1.turretRadius = 75;
enemy1.turretRotateSpeed = 0.01747;

enemy1.main_sprite = imgT72body;
enemy1.turret_sprite = imgT72turret;

enemy1.rotateSpeed = 0.00747;
enemy1.accel = 2;
enemy1.height = 173;
enemy1.width = 330;
enemy1.color = "white";
enemy1.friction = 0.92
enemy1.collisionRadius = 160

enemy1.cooldown = 0;
enemy1.cooldownConst = 35;
}

function makeEnemy2() {
let enemy2 = addGameObject(GAME_OBJECT_ENEMY)
enemy2.x = 1500;
enemy2.y = 1400;
enemy2.speedX = 0;
enemy2.speedY = 0;
enemy2.angle = 4;
enemy2.collidable = true;

enemy2.main_sprite = imgT72body;
enemy2.turret_sprite = imgT72turret;

enemy2.turretAngle = 0;
enemy2.turretWidth = 200;
enemy2.turretHeight = 20;
enemy2.turretRadius = 75;
enemy2.turretRotateSpeed = 0.01747;

enemy2.rotateSpeed = 0.00747;
enemy2.accel = 2;
enemy2.height = 173;
enemy2.width = 330;
enemy2.color = "magenta";
enemy2.friction = 0.92
enemy2.collisionRadius = 160

enemy2.cooldown = 0;
enemy2.cooldownConst = 35;
}

makeEnemy1();
//makeEnemy2();
makePlayer();

const friction = 0.92; //ТРЕНИЕ

let camera = {
    x: 0,
    y: 0,
    width: canvas.width,
    height: canvas.height
}

function drawSprite(x, y, angle, sprite, width, height) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-angle);
        
    /*ctx.fillStyle = color;
    ctx.fillRect(-width / 2, -height / 2, width, height);*/

    ctx.drawImage(sprite, -width / 2, -height / 2, width, height);
    //ctx.strokeStyle = 'black';

    //ctx.strokeRect(-width / 2, -height / 2, width, height);
    ctx.restore();
    
    
}

canvas.width = 3000;
canvas.height = 2400;
canvas.style.width = innerWidth;
canvas.style.height = innerHeight;

function angBetwPoints(x1, y1, x2, y2) {

    let length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    let result = (Math.acos((x2 - x1) / length));
    if (y2 > y1) {
        result = -result;
    }
    return result;


}

function getRandomInt(start, end) {
    let result = Math.floor(start + Math.random() * (end - start) + 0.5);
    return result;

}

function drawCircle(x, y, radius, color, width, filling, filColor) {

    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = color
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
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

function bulletSpawn(gameObject, lifetime = 300, mainspeed = 150) {
    let bullet = addGameObject(GAME_OBJECT_BULLET)
    bullet.width = 255;
    bullet.height = 55;
    let turretAddition = rotateVector(new V2(gameObject.turretWidth, 0), gameObject.turretAngle);
    bullet.x = gameObject.x + turretAddition.x * 1.5;
    bullet.y = gameObject.y + turretAddition.y * 1.5;
    bullet.angle = gameObject.turretAngle;
    bullet.friction = 0.9975;
    bullet.accel = 0.5;
    let speed = rotateVector(new V2(mainspeed, 0), gameObject.turretAngle);
    bullet.speedX = speed.x;
    bullet.speedY = speed.y;
    timers[bullet.lifetime] = lifetime;
    return bullet
}

function drawText(x,y,text,angle,font,align,color) {
    ctx.save();

    ctx.translate(x,y);
    ctx.rotate(-angle);

    ctx.font = font;

    ctx.textAlign = align;
    ctx.fillStyle = color;

    ctx.fillText(text,0,0);
    
    ctx.restore();
}

//нафигачил векторов
function sumv(V1, V2,/**/) {
    let result = {
        x: 0,
        y: 0,
    }
    let args = arguments; // arguments - зарезервированное слово для аргументов
    for (let argIndex = 0; argIndex < args.length; argIndex++) {
        result.x += args[argIndex].x;
        result.y += args[argIndex].y;
    }
    return result;
}

function multv(a, V) {
    return {
        x: a * V.x,
        y: a * V.y
    }
}

function dotProd(V1, V2) {
    return (V1.x * V2.x + V1.y * V2.y);
}

function lengthv(V) {
    return Math.sqrt(Math.pow(V.x, 2) + Math.pow(V.y, 2));
}

function unitv(V) {
    return multv(1 / lengthv(V), V);
}

function priblijeniy_otdaleniy(){
    if (minusKey.isDown) {
        SizeMultiplier-=0.02*SizeMultiplier;
        if (SizeMultiplier<=0.05) {
            SizeMultiplier = 0.05
        }
    }
    if (plusKey.isDown) {
        SizeMultiplier+=0.02*SizeMultiplier;
        if (SizeMultiplier>=5) {
            SizeMultiplier = 5
        }
    }
}



function updateGameObject(gameObject, gameObjectsIndex) {

    if (gameObject.type === GAME_OBJECT_PLAYER) {

        let canShoot = timers[gameObject.cooldown] <= 0;
        camera.x = gameObject.x;
        camera.y = gameObject.y;


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

            let speedVector = rotateVector(new V2(gameObject.accel, 0), gameObject.angle)
            gameObject.speedX += speedVector.x;
            gameObject.speedY += speedVector.y;
        };

        if (downKey.isDown) {
            let speedVector = rotateVector(new V2(gameObject.accel, 0), gameObject.angle)
            gameObject.speedX += -speedVector.x;
            gameObject.speedY += -speedVector.y;
        };

        //gameObject.turretAngle=-gameObject.angle+rotateTurret(gameObject.x, gameObject.y, gameObject.angle+gameObject.turretAngle, mouse.x, mouse.y, 100/* gameObject.turretRotateSpeed*/);

        let gmObjAngle = angBetwPoints(gameObject.x, gameObject.y, mouse.worldX, mouse.worldY);
        if (gameObject.turretAngle!=gmObjAngle)
        {
            let NewDotProd = 0;
            let dotProd = (Math.cos(gameObject.turretAngle+Math.PI/2)*Math.cos(gmObjAngle)+Math.sin(gameObject.turretAngle+Math.PI/2)*Math.sin(gmObjAngle));
            let smallAngle = Math.abs(gameObject.turretAngle)-Math.abs(gmObjAngle);
            if (dotProd<0)
            {
                gameObject.turretAngle-= gameObject.turretRotateSpeed;
                NewDotProd = (Math.cos(gameObject.turretAngle+Math.PI/2)*Math.cos(gmObjAngle)+Math.sin(gameObject.turretAngle+Math.PI/2)*Math.sin(gmObjAngle));
            }
            else
            {
                gameObject.turretAngle+= gameObject.turretRotateSpeed;
                NewDotProd = (Math.cos(gameObject.turretAngle+Math.PI/2)*Math.cos(gmObjAngle)+Math.sin(gameObject.turretAngle+Math.PI/2)*Math.sin(gmObjAngle));
            };
            
            if (NewDotProd*dotProd<0)
            {
                gameObject.turretAngle=gmObjAngle;
            };
        }
        


        if (spaceKey.isDown && canShoot) {
            let bullet = bulletSpawn(gameObject);
            bullet.shooter = GAME_OBJECT_PLAYER;
            timers[gameObject.cooldown] = 30;
        };



    }

    if (gameObject.type === GAME_OBJECT_PRESSABLE) {
        gameObject.color='green';
        if (mouse.worldX>gameObject.x-gameObject.width/2 && mouse.worldX<gameObject.x+gameObject.width/2 && 
            mouse.worldY>gameObject.y-gameObject.height/2 && mouse.worldY<gameObject.y+gameObject.height/2
            ) {
                gameObject.color='white'
            
        }
    }

    if (gameObject.type === GAME_OBJECT_ENEMY) {
        let canShoot = timers[gameObject.cooldown] <= 0;
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
                if (canShoot) {

                    
                    let bullet = bulletSpawn(gameObject);
                    bullet.shooter = GAME_OBJECT_ENEMY;
                    timers[gameObject.cooldown]=gameObject.cooldownConst;
                    
                };
            } break;

            case AI_STATE_MOVE_FORWARD: {
                let speedVector = rotateVector(new V2(gameObject.accel, 0), gameObject.angle)
                gameObject.speedX += speedVector.x;
                gameObject.speedY += speedVector.y;
            } break;

            case AI_STATE_MOVE_BACKWARD: {
                let speedVector = rotateVector(new V2(gameObject.accel, 0), gameObject.angle)
                gameObject.speedX -= speedVector.x;
                gameObject.speedY -= speedVector.y;

            } break;


        }
        if (timers[gameObject.aiTimer] <= 0) {
            gameObject.aiState = getRandomInt(AI_STATE_IDLE, AI_STATE_TURRET_ROTATE_RIGHT);
            timers[gameObject.aiTimer] = 60;
            console.log(gameObject.aiState)
        };
    }

    if (gameObject.type === GAME_OBJECT_BULLET) {

        gameObject.speedX *= gameObject.friction;
        gameObject.speedY *= gameObject.friction;
        

        for (let gameObjectIndex = 0; gameObjectIndex < gameObjects.length; gameObjectIndex++) {
            let other = gameObjects[gameObjectIndex]
            if (other.exists) {
                if (other.type === GAME_OBJECT_ENEMY && gameObject.shooter === GAME_OBJECT_PLAYER || 
                    other.type === GAME_OBJECT_PLAYER && gameObject.shooter=== GAME_OBJECT_ENEMY)  {
                    // COLLISION CHECK
                    const radiusSum = gameObject.collisionRadius + other.collisionRadius;
                    const a = other.x - gameObject.x;
                    const b = other.y - gameObject.y;
                    const dist = Math.sqrt(a * a + b * b);
                    if (dist < radiusSum) {
                        other.exists = false;
                        removeGameObject(gameObject);
                    }
                }
                if (timers[gameObject.lifetime] <= 0) {
                    removeGameObject(gameObject)
                }
            }
        }

    }


    //
    if (gameObject.main_sprite && !drawTestMode) {
        drawSprite(gameObject.x, gameObject.y, gameObject.angle, gameObject.main_sprite, gameObject.width, gameObject.height)
    }
    else {
    drawRect(gameObject.x, gameObject.y, gameObject.width, gameObject.height, gameObject.angle, gameObject.tempcolor)
    }
    //ctx.drawImage(imgT72body, gameObject.x, gameObject.y, gameObject.width, gameObject.height)


    let turretVector = rotateVector(new V2(gameObject.turretWidth / 2, 0), gameObject.turretAngle);
    if (gameObject.turret_sprite) {
        drawSprite(gameObject.x + turretVector.x, gameObject.y + turretVector.y, gameObject.turretAngle, gameObject.turret_sprite, gameObject.width*1.2, gameObject.height)
    }   
    else {
    drawRect(gameObject.x + turretVector.x, gameObject.y + turretVector.y, gameObject.turretWidth, gameObject.turretHeight, gameObject.turretAngle, gameObject.color);
    drawCircle(gameObject.x, gameObject.y, gameObject.turretRadius, 'black', 5, true, gameObject.color)
    }
    drawCircle(gameObject.x, gameObject.y, gameObject.collisionRadius, 'red', 5, false, 'red')

    //drawTurret(gameObject.x, gameObject.y, gameObject.turretWidth, gameObject.turretHeight, gameObject.turretRadius, gameObject.turretAngle, gameObject.color);



    gameObject.speedX *= gameObject.friction;
    gameObject.speedY *= gameObject.friction;

    //COLLISION CHECK
    for (let gameObjectIndex = 0; gameObjectIndex < gameObjects.length; gameObjectIndex++) {
        let other = gameObjects[gameObjectIndex];
        if (other.exists) {
            if (other.collidable && gameObject.collidable && gameObjectsIndex!==gameObjectIndex) {
                let pos = {
                    x: gameObject.x,
                    y: gameObject.y
                }
                let otherPos = {
                    x: other.x,
                    y: other.y
                }
                let speed = {
                    x: gameObject.speedX,
                    y: gameObject.speedY
                }

                let points1 = [];
                {
                    //заполняем точками точки толкача
                    let xo=gameObject.width/2;
                    let yo=gameObject.height/2;
                    addPoint(points1, xo, yo);
                    xo=-gameObject.width/2;
                    yo=gameObject.height/2;
                    addPoint(points1, xo, yo);
                    xo=-gameObject.width/2;
                    yo=-gameObject.height/2;
                    addPoint(points1, xo, yo);
                    xo=gameObject.width/2;
                    yo=-gameObject.height/2;
                    addPoint(points1, xo, yo);
                }

                let points2 = [];
                {
                    //заполняем точками точки толкуемого
                    let xo=other.width/2;
                    let yo=other.height/2;
                    addPoint(points2, xo, yo);
                    xo=-other.width/2;
                    yo=other.height/2;
                    addPoint(points2, xo, yo);
                    xo=-other.width/2;
                    yo=-other.height/2;
                    addPoint(points2, xo, yo);
                    xo=other.width/2;
                    yo=-other.height/2;
                    addPoint(points2, xo, yo);
                }
                
                
                if (IsPolygonsIntersecting(points1, points2, pos, otherPos, gameObject.angle, other.angle, gameObject.tempcolor))
                {
                    //gameObject.x=gameObject.x+other.width;
                }

                    /*
                let R = gameObject.collisionRadius + other.collisionRadius;
                let k = speed.y / speed.x;
                let b = pos.y - pos.x * k;
                let c1 = 1 + k * k;
                let c2 = -2 * otherPos.x + 2 * k * b - 2 * otherPos.y * k;
                let c3 = otherPos.x * otherPos.x + b * b - 2 * otherPos.y * b + otherPos.y * otherPos.y - R * R;
                c2 /= c1;
                c3 /= c1;
                let D = c2 * c2 - 4 * c3;
                if (D >= 0) {
                    let point1 = {
                        x: (-c2 + Math.sqrt(D)) / 2,
                        y: ((-c2 + Math.sqrt(D)) / 2) * k + b
                    }
                    let point2 = {
                        x: (-c2 - Math.sqrt(D)) / 2,
                        y: ((-c2 - Math.sqrt(D)) / 2) * k + b
                    }
                    let vector1 = sumv(point1, multv(-1, pos));
                    let vector2 = sumv(point2, multv(-1, pos));
                    let vectorToCircle = vector1;
                    if (lengthv(vector2) < lengthv(vector1)) {
                        vectorToCircle = vector2;
                    }
                    let newSpeed = vectorToCircle;
                    speed = sumv(speed, multv(-1, newSpeed));
                    let vector = sumv(otherPos, multv(-1, sumv(pos, newSpeed)));
                    let speedProjection = dotProd(speed, unitv(vector));
                    let speedToOther = multv(speedProjection, unitv(vector));
                    let maxSpeedToOtherLeng = lengthv(vector) - R;
                    if (dotProd(speedToOther, unitv(vector)) > maxSpeedToOtherLeng) {
                        speed = sumv(speed, multv(-(1 - maxSpeedToOtherLeng / lengthv(speedToOther)), speedToOther))
                    }
                    speed = sumv(newSpeed, speed);
                    gameObject.speedX = speed.x;
                    gameObject.speedY = speed.y;
                }
                 */

            }
        }
    }

    gameObject.x += gameObject.speedX;
    gameObject.y += gameObject.speedY;
}

function loop() {

    //sound_mission1.play();
    priblijeniy_otdaleniy();

    mouse.worldX = (mouse.x - canvas.width /2  )/SizeMultiplier  + camera.x;
    mouse.worldY = (mouse.y - canvas.height / 2)/SizeMultiplier  + camera.y;

     //КАМЕРАААА!

    
    ctx.save();
    
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(SizeMultiplier, SizeMultiplier);
    ctx.translate(-camera.x, -camera.y);
    
    drawRect(camera.x, camera.y, canvas.width/SizeMultiplier, canvas.height/SizeMultiplier, 0, 'grey');

    let grassWidth = canvas.width;
    let grassHeight = canvas.height;

    let minX = Math.floor((camera.x-canvas.width/2/SizeMultiplier)/ grassWidth);
    let minY = Math.floor((camera.y-canvas.height/2/SizeMultiplier)/ grassHeight);
    let maxX = Math.ceil((camera.x+canvas.width/2/SizeMultiplier) / grassWidth);
    let maxY = Math.ceil((camera.y+canvas.height/2/SizeMultiplier) / grassHeight);
    /*
    for (let bgTileX = minX; bgTileX <= maxX; bgTileX++) {
        for (let bgTileY = minY; bgTileY <= maxY; bgTileY++) {
            ctx.drawImage(
                imgGrass, 
                - grassWidth / 2 + bgTileX * grassWidth, 
                - grassHeight / 2 + bgTileY * grassHeight, 
                grassWidth, grassHeight);

        }
    }
    */

    //ctx.drawImage(imgGrass, - imgGrass.width / 2 + camera.width / 2, - imgGrass.height / 2 + camera.height / 2)

    //счётчик приближения
    let textsize = 'bold ' + canvas.width/SizeMultiplier/50 + 'px Arial';
    drawText(camera.x-(canvas.width+50000)/SizeMultiplier/50, camera.y-(canvas.width+50000)/SizeMultiplier/50, "Zoom = ", 0, textsize);
    drawText(camera.x-(canvas.width+40000)/SizeMultiplier/50, camera.y-(canvas.width+50000)/SizeMultiplier/50, SizeMultiplier, 0, textsize);


    for (let gameObjectsIndex = 0; gameObjectsIndex < gameObjects.length; gameObjectsIndex++) {
        let gameObject = gameObjects[gameObjectsIndex];
        if (gameObject.exists) {
            updateGameObject(gameObject, gameObjectsIndex);
        }
    }

    updateTimers();
    clearKeys();
    ctx.restore();
    requestAnimationFrame(loop);

}

//запрос обновления кадров
requestAnimationFrame(loop);
