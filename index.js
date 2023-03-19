'use strict'

let canvas = document.getElementById("canvas"); // канвас - то, на чем рисуем
let ctx = canvas.getContext('2d'); //стх - чем мы рисуем


let SizeMultiplier = 1;
let mainGame={
    gameState: 0,
    allStop: false,
    started: false,
}

let drawTestMode = false;

const GAME_STATE_MAIN_MENU = 0;
const GAME_STATE_PLAY = 1;

const GAME_OBJECT_PLAYER = 0;
const GAME_OBJECT_ENEMY = 1;
const GAME_OBJECT_BULLET = 2;
const GAME_OBJECT_HEAVY_OBSTACLE = 3;
const GAME_OBJECT_PRESSABLE = 4;
const bulletMainLifetime = 300;

const BUTTON_PRESSED = 1;
const BUTTON_RELEASED = 2;

let gameObjects = [];


const AI_STATE_IDLE = 0;
const AI_STATE_MOVE_FORWARD = 1;
const AI_STATE_MOVE_BACKWARD = 2;
const AI_STATE_SHOOT = 3;
const AI_STATE_ROTATE_LEFT = 4;
const AI_STATE_ROTATE_RIGHT = 5;
const AI_STATE_TURRET_ROTATE_LEFT = 6;
const AI_STATE_TURRET_ROTATE_RIGHT = 7;

let globalLoadedSounds = {}
function loadSound(src) {
    let sound = new Audio();
    sound.src = src;
    globalLoadedSounds[src] = sound
    return sound
}

function playSound(sound, overlap) {
    if (overlap) {
        const newSound = loadSound(sound.src);
        newSound.play();
    } else {
        sound.play();
    }
    
}

const sndTankEngine = loadSound('./soundLib/sounds/tankEngine.mp3');
const sndTankMoving = loadSound('./soundLib/sounds/tankMoving.mp3');
const sndTankShot = loadSound('./soundLib/sounds/oneTankShot.mp3');
const sndShellHitInside = loadSound('./soundLib/sounds/shellHitArmorInside.mp3');
const sndShellHitOutside = loadSound('./soundLib/sounds/shellHit.mp3');



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

function drawMenuButton(label, x, y, menuButtonSize, condition, alternativeChose, labelUnactive) {
    let button_pressed = 0
    let drawColor=menuButtonSize.color
    let drawFontColor=menuButtonSize.fontcolor
    if (-canvas.width/2+mouse.x>x-menuButtonSize.width*SizeMultiplier/2 && -canvas.width/2+mouse.x<x+menuButtonSize.width*SizeMultiplier/2 
    && -canvas.height/2+mouse.y>y*SizeMultiplier-menuButtonSize.height*SizeMultiplier/2 && -canvas.height/2+mouse.y<y*SizeMultiplier+menuButtonSize.height*SizeMultiplier/2 && (condition || alternativeChose)) 
    {
        drawColor = menuButtonSize.color2;
        drawFontColor = menuButtonSize.fontcolor2;
        if (mouse.isDown) {
            button_pressed = BUTTON_PRESSED;
        }
        else if (mouse.wentUp) {
            return true;
        }
      
    if (button_pressed===BUTTON_PRESSED) {
        drawColor = menuButtonSize.color3;
        drawFontColor = menuButtonSize.fontcolor3;
        if (mouse.wentUp) {
            return true
        }
    }
    }
    if (!condition)
    {
        label=alternativeChose
    }
    if (condition || alternativeChose) 
    {
        drawRect(camera.x+x, camera.y+y, menuButtonSize.width, menuButtonSize.height, 0, drawColor);
        drawText(camera.x+x, camera.y+y, label, 0, menuButtonSize.font, 'center', drawFontColor);
    }
    else 
    {
        drawRect(camera.x+x, camera.y+y, menuButtonSize.width, menuButtonSize.height, 0, menuButtonSize.colorUnactive);
        drawText(camera.x+x, camera.y+y, labelUnactive, 0, menuButtonSize.fontUnactive, 'center', menuButtonSize.fontUnactive);
    }
}

function ArePolygonsIntersecting(pointsInput1, pointsInput2, pos1, pos2, angle1, angle2) {

    //получение области столкновения

    let criticalPoints = []
    let collisionArea = []
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
    for (let pointIndex = 1; pointIndex < points1.length + 1; pointIndex++) {
        let realIndex = pointIndex % points1.length
        let point1 = criticalPoints[pointIndex * 2 - 1]
        let point2 = criticalPoints[pointIndex * 2 % criticalPoints.length]

        let betweenIndex = point1;
        while (betweenIndex !== (point2 + 1) % points2.length) {
            collisionArea.push(new V2(points1[realIndex].x - points2[betweenIndex].x, points1[realIndex].y - points2[betweenIndex].y))
            betweenIndex++
            betweenIndex = betweenIndex % points2.length
        }

    }

    

    //прорисовка области столкновения
    
    if (drawTestMode) {
    ctx.save();
    
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(SizeMultiplier, SizeMultiplier);
    ctx.translate(-camera.x, -camera.y);
    ctx.translate(pos1.x, pos1.y);

    startDrawing(collisionArea[0].x, collisionArea[0].y)
    connectPoints(collisionArea)
    fillDrawing('purple')
    ctx.closePath()
    ctx.restore()
    }

    //проверка на попадание в область столкновения
    startDrawing(collisionArea[0].x, collisionArea[0].y)
    connectPoints(collisionArea)
    if (ctx.isPointInPath(pos2.x-pos1.x, pos2.y-pos1.y)) {
        ctx.closePath()
        return true;
    }
    else {
        ctx.closePath()
        return false;
    }
    
}


function drawRect(x, y, width, height, angle, color) {

    ctx.save();
    
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(SizeMultiplier, SizeMultiplier);
    ctx.translate(-camera.x, -camera.y);
    ctx.translate(x, y);
    ctx.rotate(angle);
    
    ctx.fillStyle = color;
    ctx.fillRect(-width / 2, -height / 2, width, height);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 5;
    ctx.strokeRect(-width / 2, -height / 2, width, height);
    ctx.restore();

}


class GameObject {

    x = 400;
    y = 100;
    angle = 0;
    height = 10;
    width = 10;
    color = "black";

    main_sprite = null;

    collidable = false;
    moving = true;

    exists = true;
    
    constructor(type, x, y) {
        this.type = type;
        this.x = x;
        this.y = y;
        switch (type)  {
            case GAME_OBJECT_PLAYER: 
            {
                //не по умолчанию
                this.hp = 3;
                this.turretAngle = 0;
                this.rotateSpeed = 0;
                this.rotateAccel = 0.01;
                this.friction = 0.96;
                this.speedX = 0;
                this.speedY = 0;
                this.accel = 13;
                this.turret_sprite = null;
                this.tempcolor = "white";
                //entity
                this.cooldown = addtimer();

                //по умолчанию
                this.speedX = 0;
                this.speedY = 0;
                this.angle = 0;
                this.moving = true;
                this.collidable = true;

                this.turretAngle = 0;
                this.turretWidth = 200;
                this.turretHeight = 20;
                this.turretRadius = 80;
                this.turretRotateSpeed = 0.07747;

                this.rotateSpeed = 0.01747;
                this.accel = 2;
                this.height = 173;
                this.width = 330;
                this.color = "green";
                this.friction = 0.92;
                this.collisionRadius = 160

                this.main_sprite = imgT72body;
                this.turret_sprite = imgT72turret;

            } 
            break;
            case GAME_OBJECT_ENEMY: 
            {
                this.hp = 3;
                this.turretAngle = 0;
                this.rotateSpeed = 0;
                this.rotateAccel = 0.01;
                this.friction = 0.96;
                this.accel = 13;
                this.speedX = 0;
                this.speedY = 0;
                this.turret_sprite = null;
                this.tempcolor = "white";
                this.cooldown = addtimer();
                //enemy
                this.aiState = AI_STATE_IDLE;
                this.aiTimer = addtimer();

                this.speedX = 0;
                this.speedY = 0;
                this.angle = 0;
                this.moving = true;
                this.collidable = true;

                this.turretAngle = 0;
                this.turretWidth = 200;
                this.turretHeight = 20;
                this.turretRadius = 75;
                this.turretRotateSpeed = 0.01747;

                this.main_sprite = imgT72body;
                this.turret_sprite = imgT72turret;

                this.rotateSpeed = 0.00747;
                this.accel = 2;
                this.height = 173;
                this.width = 330;
                this.color = "white";
                this.friction = 0.92
                this.collisionRadius = 160

                this.cooldown = 0;
                this.cooldownConst = 35;
            }
            break;
            case GAME_OBJECT_BULLET: 
            {
                this.damage = 2;
                this.moving = true;
                this.collidable = false;

                this.rotateSpeed = 0;
                this.rotateAccel = 0.01;
                this.accel = 13;
                this.speedX = 0;
                this.speedY = 0;
                this.friction = 0.96;
                this.tempcolor = "white";
                this.lifetime = addtimer();
                this.shooter = 0;
            }
            break;
            case GAME_OBJECT_HEAVY_OBSTACLE: 
            {
                this.angle = 0;
                this.moving = false;
                this.collidable = true;
                this.main_sprite = imgSmallHouse;
                this.tempcolor = "white";
            }
            break;
            case GAME_OBJECT_PRESSABLE: 
            {
                
            }
        }
    }

    setEntityParams(width, height, main_sprite, doesHaveTurret, turret_sprite, hp) {
        this.width=width;
        this.height=height;
        this.main_sprite = main_sprite;
        if (doesHaveTurret) 
        {
            this.turret_sprite = turret_sprite;
        }
        this.hp=hp;
    }

    setBulletParams(damage) {
        this.damage=damage
        
    }

    setObstacleParams(width, height, main_sprite, angle) {
        this.width=width;
        this.height=height;
        this.main_sprite = main_sprite;
        this.angle = angle;
    }

}

function addGameObject(x, y, type) {
    let gameObject = new GameObject(type, x, y);

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

function makePlayer(x, y, width, height, main_sprite, doesHaveTurret, turret_sprite, hp) {
    let player = addGameObject(x, y, GAME_OBJECT_PLAYER)
    player.setEntityParams(width, height, main_sprite, doesHaveTurret, turret_sprite, hp)
}

function makeEnemy(x, y, width, height, main_sprite, doesHaveTurret, turret_sprite, hp) {
    let enemy = addGameObject(x, y, GAME_OBJECT_ENEMY)
    enemy.setEntityParams(width, height, main_sprite, doesHaveTurret, turret_sprite, hp)
}

function makeHeavyObstacle(x, y, width, height, main_sprite, angle) {
    let obstacle = addGameObject(x, y, GAME_OBJECT_HEAVY_OBSTACLE)
    obstacle.setObstacleParams(width, height, main_sprite, angle)
}


makeEnemy(100, 200, 330, 173, imgT72body, true, imgT72turret, 3);
makeEnemy(600, 800, 330, 173, imgT72body, true, imgT72turret, 3);

makePlayer(400, 100, 330, 173, imgT72body, true, imgT72turret, 3);

makeHeavyObstacle(500, 600, 600, 400, imgSmallHouse, 0);

const friction = 0.92; //ТРЕНИЕ

let camera = {
    x: 0,
    y: 0,
    width: canvas.width,
    height: canvas.height
}

function drawSprite(x, y, angle, sprite, width, height) {
    ctx.save();
    
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(SizeMultiplier, SizeMultiplier);
    ctx.translate(-camera.x, -camera.y);
    ctx.translate(x, y);
    ctx.rotate(angle);
        
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
    if (y1 > y2) {
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
    
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(SizeMultiplier, SizeMultiplier);
    ctx.translate(-camera.x, -camera.y);
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

function bulletSpawn(gameObject, lifetime = bulletMainLifetime, mainspeed = 150) {

    playSound(sndTankShot, true);

    let turretAddition = rotateVector(new V2(gameObject.turretWidth, 0), gameObject.turretAngle);
    let spawningBulletX = gameObject.x + turretAddition.x * 1.5;
    let spawningBulletY = gameObject.y + turretAddition.y * 1.5;
    let bullet = addGameObject(spawningBulletX, spawningBulletY, GAME_OBJECT_BULLET)
    bullet.width = 255;
    bullet.height = 55;
    
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
    
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(SizeMultiplier, SizeMultiplier);
    ctx.translate(-camera.x, -camera.y);
    ctx.translate(x, y);
    ctx.rotate(angle);

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
                gameObject.rotateSpeed += gameObject.rotateAccel;
            }
            else {
                gameObject.rotateSpeed -= gameObject.rotateAccel;
            }
        };

        

        if (leftKey.isDown) {
            if (!downKey.isDown) {
                gameObject.rotateSpeed -= gameObject.rotateAccel;
            }
            else {
                gameObject.rotateSpeed += gameObject.rotateAccel;
            }
        };

        if (upKey.isDown) {
            sndTankEngine.volume=0.5;
            playSound(sndTankEngine);
            let speedVector = rotateVector(new V2(gameObject.accel, 0), gameObject.angle);
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
                gameObject.rotateSpeed -= gameObject.rotateAccel;
            } break;

            case AI_STATE_ROTATE_RIGHT: {
                gameObject.rotateSpeed += gameObject.rotateAccel;
            } break;

            case AI_STATE_TURRET_ROTATE_LEFT: {
                gameObject.turretAngle -= gameObject.turretRotateSpeed;
            } break;

            case AI_STATE_TURRET_ROTATE_RIGHT: {
                gameObject.turretAngle += gameObject.turretRotateSpeed;
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
            if (mainGame.allStop) {
                gameObject.aiState=AI_STATE_IDLE
            }
            else {
                gameObject.aiState = getRandomInt(AI_STATE_IDLE, AI_STATE_TURRET_ROTATE_RIGHT);
            }
            timers[gameObject.aiTimer] = 60;
            console.log(gameObject.aiState)
        };
    }

    if (gameObject.type === GAME_OBJECT_BULLET) {

        gameObject.speedX *= gameObject.friction;
        gameObject.speedY *= gameObject.friction;
        

        for (let gameObjectIndex = 0; gameObjectIndex < gameObjects.length; gameObjectIndex++) {
            let other = gameObjects[gameObjectIndex]
                if (timers[gameObject.lifetime] <= 0) 
                {
                    removeGameObject(gameObject)
                }
        }

    }

    let turretVector = rotateVector(new V2(gameObject.turretWidth / 2, 0), gameObject.turretAngle);


    gameObject.rotateSpeed *= gameObject.friction*gameObject.friction;
    gameObject.speedX *= gameObject.friction;
    gameObject.speedY *= gameObject.friction;

    //COLLISION CHECK
    for (let gameObjectIndex = 0; gameObjectIndex < gameObjects.length; gameObjectIndex++) {
        let other = gameObjects[gameObjectIndex];
        if (gameObjectIndex===3) {
            let foo = 0;
        }
        if (other.exists) {
            if (other.collidable && gameObject.moving && gameObjectsIndex!==gameObjectIndex) {
                let pos = {
                    x: gameObject.x+gameObject.speedX,
                    y: gameObject.y+gameObject.speedY
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
                
                let foo =5;

                if (ArePolygonsIntersecting(points1, points2, pos, otherPos, gameObject.angle+gameObject.rotateSpeed, other.angle))
                {
                    if (gameObject.type === GAME_OBJECT_BULLET) {
                        if (other.type === GAME_OBJECT_ENEMY && gameObject.shooter === GAME_OBJECT_PLAYER || 
                        other.type === GAME_OBJECT_PLAYER && gameObject.shooter === GAME_OBJECT_ENEMY)
                        {
                            if (other.type === GAME_OBJECT_PLAYER) {
                                playSound(sndShellHitInside);
                            }
                            else {
                                sndShellHitOutside.volume=gameObject.lifetime/bulletMainLifetime;
                                playSound(sndShellHitOutside, true);
                            }
                            other.exists = false;
                            removeGameObject(gameObject);
                        }
                    }
                    gameObject.tempcolor='red';
                    gameObject.x-=gameObject.speedX;
                    gameObject.y-=gameObject.speedY;
                    gameObject.speedX=-gameObject.speedX;
                    gameObject.speedY=-gameObject.speedY;
                    gameObject.angle-=gameObject.rotateSpeed;
                    gameObject.rotateSpeed=-gameObject.rotateSpeed;
                    
                }
                else
                {
                    gameObject.tempcolor='white';
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

    
    if (gameObject.main_sprite && !drawTestMode) {
        drawSprite(gameObject.x, gameObject.y, gameObject.angle, gameObject.main_sprite, gameObject.width, gameObject.height)
    }
    else {
    drawRect(gameObject.x, gameObject.y, gameObject.width, gameObject.height, gameObject.angle, gameObject.tempcolor)
    }

    if (gameObject.turret_sprite) {
        drawSprite(gameObject.x + turretVector.x, gameObject.y + turretVector.y, gameObject.turretAngle, gameObject.turret_sprite, gameObject.width*1.2, gameObject.height)
    }   
    else {
    drawRect(gameObject.x + turretVector.x, gameObject.y + turretVector.y, gameObject.turretWidth, gameObject.turretHeight, gameObject.turretAngle, gameObject.color);
    drawCircle(gameObject.x, gameObject.y, gameObject.turretRadius, 'black', 5, true, gameObject.color)
    }

    if (drawTestMode) {
    drawCircle(gameObject.x, gameObject.y, gameObject.collisionRadius, 'red', 5, false, 'red')

    let textsize = 'bold ' + canvas.width/SizeMultiplier/50 + 'px Arial';
    drawText(gameObject.x+100, gameObject.y+100, "x="+Math.round(gameObject.x), 0, textsize, "left", "black")
    drawText(gameObject.x+100, gameObject.y-100, "y="+Math.round(gameObject.y), 0, textsize, "left", "black")
    }

    if (gameObject.moving) {
    gameObject.angle+=gameObject.rotateSpeed;
    gameObject.x += gameObject.speedX;
    gameObject.y += gameObject.speedY;
    }
}

function loop() {

    
    

    //

    //счётчик приближения

    
    
    switch (mainGame.gameState)  {
        case GAME_STATE_MAIN_MENU: {
            let menuButtonParams={
                width: 900/SizeMultiplier,
                height: 200/SizeMultiplier,
                color: "cyan",
                color2: "blue",
                color3: "navy",
                colorUnactive: "gray",
                font: 'bold ' + canvas.width/SizeMultiplier/50 + 'px Arial',
                fontUnactive: 'bold ' + canvas.width/SizeMultiplier/50 + 'px Arial',
                fontcolor: 'white',
                fontcolor2: 'white',
                fontcolor3: 'cyan',
                fontColorUnactive: "black"
            }
            if (mainGame.started && escapeKey.wentDown) 
            {
                mainGame.gameState=GAME_STATE_PLAY;
            }
            if (drawMenuButton("Войти в игру", 0, 0, menuButtonParams, !mainGame.started, "Продолжить игру", true)) 
            {
                mainGame.gameState=GAME_STATE_PLAY;
                mainGame.started=true;
            }
            if (drawMenuButton("Включить тестовый режим", 0, canvas.height/SizeMultiplier/8, menuButtonParams, !drawTestMode, "Выключить тестовый режим", true)) 
            {
                drawTestMode=!drawTestMode;
            }
        } 
        break;
        case GAME_STATE_PLAY: {
            if (escapeKey.wentDown) 
            {
                mainGame.gameState=GAME_STATE_MAIN_MENU
            }

            priblijeniy_otdaleniy();
            mouse.worldX = (mouse.x - canvas.width /2  )/SizeMultiplier  + camera.x;
            mouse.worldY = (mouse.y - canvas.height / 2)/SizeMultiplier  + camera.y;
            
            drawRect(camera.x, camera.y, canvas.width/SizeMultiplier, canvas.height/SizeMultiplier, 0, 'grey');
            
            if (drawTestMode) 
            {
                drawCornerText("Zoom = ",SizeMultiplier,0);
            }

            /*
            let grassWidth = canvas.width;
            let grassHeight = canvas.height;
            ctx.drawImage(imgGrass, - imgGrass.width / 2 + camera.width / 2, - imgGrass.height / 2 + camera.height / 2)
            */
            /*
            let minX = Math.floor((camera.x-canvas.width/2/SizeMultiplier)/ grassWidth);
            let minY = Math.floor((camera.y-canvas.height/2/SizeMultiplier)/ grassHeight);
            let maxX = Math.ceil((camera.x+canvas.width/2/SizeMultiplier) / grassWidth);
            let maxY = Math.ceil((camera.y+canvas.height/2/SizeMultiplier) / grassHeight);
            */
            for (let gameObjectsIndex = 0; gameObjectsIndex < gameObjects.length; gameObjectsIndex++) {
                let gameObject = gameObjects[gameObjectsIndex];
                if (gameObject.exists) {
                    updateGameObject(gameObject, gameObjectsIndex);
                }
                
            }

            updateTimers();
        }
    }
    clearMouse();
    clearKeys();
    requestAnimationFrame(loop);

    
}

//запрос обновления кадров
requestAnimationFrame(loop);
