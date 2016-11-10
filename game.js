// loading canvas
var canvas = document.getElementById('Canvas');
var scene = canvas.getContext('2d');
scene.font = "14pt Arial";

// game variables
var gameover = false;
var frame = 0;

// control
var KEY = {
    UP: 38,
    DOWN: 40,
    ESC: 27
};
var pressed = {};
var mouseY = 0;

document.addEventListener('keydown', onKeyDown, false);
document.addEventListener('keyup', onKeyUp, false);
canvas.addEventListener('mousemove', onMouseMove, false);

function onKeyDown(event){
    pressed[event.keyCode] = true;
    event.preventDefault();
}

function onKeyUp(event){
    pressed[event.keyCode] = false;
    event.preventDefault();
}

function onMouseMove(event){
	mouseY = event.clientY;
}

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

// game objects
var airplane = {
    image : images.airplane,
    x: 0, y: 0,
    angle: 0,
    update : function () {  // here we describe the airplane behavior.
        if (pressed[KEY.UP] && this.y > 0){
            this.rotate(-1); this.y -= 7;
            return
        }
        if (pressed[KEY.DOWN] && this.y + this.image.height < canvas.height) {
            this.rotate(+1); this.y += 7;
            return
        }
        if ( this.checkIsTheWayIsFree() == false ) { // autopilot
            if (this.y > canvas.height){
                this.rotate(+1); this.y -= 7;
            } else {
                this.rotate(-1);
                this.y += 7;
            }
        }
    },
    rotate : function (angle) {
        this.angle = angle;
    },
    checkIsTheWayIsFree : function() {
        return true
    }
};

// game preload
var objects = [];
objects.push(airplane);

// main game functions
function updateGame(){
    for (var i in objects){
        objects[i].update();
    }
}

function renderGame(){
    scene.clearRect(0, 0, canvas.width, canvas.height);
    for (var i in objects){
        scene.drawImage(objects[i].image, objects[i].x, objects[i].y);
    }
}

function main(){
    updateGame();
    renderGame();
    if (pressed[KEY.ESC]) {
        scene.fillText('BYE BYE', canvas.width/2, canvas.height/2);
        return;  // stops the game - we don't call 'requestAnimationFrame'
    }
    if (gameover){
        alert('BE CAREFUL ON THE FLY');
        document.location.reload();
    }
    requestAnimationFrame(main);  // continues the game
}

document.onload = requestAnimationFrame(main);  //Let's Rock!