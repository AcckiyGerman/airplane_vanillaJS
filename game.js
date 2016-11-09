var gameover = false;
var frame = 0;
var mouseY = 0;

// control
var KEY = {
    UP: 38,
    DOWN: 40
};
var pressed = {};

// loading canvas
var canvas = document.getElementById('Canvas');
var scene = canvas.getContext('2d');
scene.font = "14pt Arial";

// loading sprites
var images = {};
images.airplane = new Image();
images.airplane.src = 'assets/airplane.png';
images.cloud = new Image();
images.cloud.src = 'assets/cloud.png';
images.heavy_cloud = new Image();
images.heavy_cloud.src = 'assets/heavy_cloud.png';
images.fire = new Image();
images.fire.src = 'assets/fire.png';
images.road = new Image();
images.road.src = 'assets/road.jpg';

document.addEventListener('keydown', onKeyDown, false);
document.addEventListener('keyup', onKeyUp, false);

function onKeyDown(event){
    pressed[event.keyCode] = true;
    event.preventDefault();
}

function onKeyUp(event){
    pressed[event.keyCode] = false;
    event.preventDefault();
}

