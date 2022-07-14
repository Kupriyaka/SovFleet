
function addKey() {
    let key = {
        wentDown: false,
        wentUp: false,
        isDown: false,
    }
    return key;
}

const RIGHT_CODE = 68;
const DOWN_CODE = 83;
const LEFT_CODE = 65;
const UP_CODE = 87;
const SPACE_CODE = 32;

let downKey = addKey();
let leftKey = addKey();
let rightKey = addKey();
let upKey = addKey();
let spaceKey = addKey();


function clearKey(k) {
    k.wentUp = false;
    if (k.wentDown) {
        k.wentDown = false;
        k.isDown = true;
    }
}

function clearKeys() {
    clearKey(downKey);
    clearKey(upKey);
    clearKey(leftKey);
    clearKey(rightKey);
    clearKey(spaceKey);
}

function handleKeyDown(key, eventKeyCode, keyCode) {
    if (keyCode === eventKeyCode) {
        if (!key.isDown) {
            key.isDown = true;
            key.wentDown = true;
        }
    }
}

function handleKeyUp(key, eventKeyCode, keyCode) {
    if (keyCode === eventKeyCode) {
        if (key.isDown) {
            key.isDown = false;
            key.wentUp = true;
        }
    }
}


window.onkeydown = function keydown(event) {
    handleKeyDown(rightKey, event.keyCode, RIGHT_CODE);
    handleKeyDown(leftKey, event.keyCode, LEFT_CODE);
    handleKeyDown(upKey, event.keyCode, UP_CODE);
    handleKeyDown(downKey, event.keyCode, DOWN_CODE);
    handleKeyDown(spaceKey, event.keyCode, SPACE_CODE);
}

window.onkeyup = function keyup(event) {
    handleKeyUp(rightKey, event.keyCode, RIGHT_CODE);
    handleKeyUp(leftKey, event.keyCode, LEFT_CODE);
    handleKeyUp(upKey, event.keyCode, UP_CODE);
    handleKeyUp(downKey, event.keyCode, DOWN_CODE);
    handleKeyUp(spaceKey, event.keyCode, SPACE_CODE);
}

