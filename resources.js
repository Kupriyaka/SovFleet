function loadImage(src) {
    let img = new Image();
    img.src = src;
    return img;
}

let imgGrass = loadImage('./sprites/grass.jpg');
let imgT72body = loadImage('./sprites/body_t72.png');
let imgT72turret = loadImage('./sprites/turret_t72.png');

let sound_mission1 = new Audio('./tracks/Siege_of_Kharkov.mp3');
sound_mission1.volume = 0.5;
