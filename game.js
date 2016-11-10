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
    x: 0, y: canvas.height/2,
    angle: 0,
    autoPilot: '', iterations: 0,
    status: 'flying',
    update : function () {  // here we describe the airplane behavior.
        // manual fly
        if (pressed[KEY.UP] && this.y > 0){
            this.y -= 7;
            return
        }
        if (pressed[KEY.DOWN] && this.y + this.image.height < canvas.height) {
            this.y += 7;
            return
        }
        // autopilot
        if (this.iterations > 0){
            switch (this.autoPilot){
                case 'down': this.y += 7;
                    break;
                case 'up': this.y -= 7;
                    break;
                }
            this.iterations -= 1;
            return
        }
        // give autopilot task to avoid clouds
        if ( this.checkIfTheWayIsBlocked() ) {
            if (this.y > canvas.height/4){
                this.autoPilot = 'up'
            } else {
                this.autoPilot = 'down'
            }
            this.iterations = 40;
        }
    },
    checkIfTheWayIsBlocked : function() {
        for (var j in objects){
            var obj = objects[j];
            if (obj != this &&  // can't hit myself
                obj.x > 0 + this.image.width &&  // cloud is ahead
                obj.x < canvas.width/2 &&  // cloud is not too far
                this.y < obj.y + obj.image.height &&
                this.y + this.image.height > obj.y ){ return true }
        }
        return false
    }
};

function Cloud( type, x, y ){  // constructor of clouds
    this.image = images[type];
    this.x = x; this.y = y;
    this.update = function(){
        this.x -= 6;
    }
}

// game preload
var objects = [];
objects.push(airplane);
for (var i = 1; i<15; i++){
    objects.push(new Cloud('heavy_cloud', i*800, Math.round(Math.random()*300)));
}
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

function particlesRender(){
    if (airplane.status == 'burning'){
        scene.drawImage(images.fire, airplane.x, airplane.y)
    }
}

function distance(obj1, obj2){
    var x1 = (obj1.x + obj1.image.width)/2;
    var y1 = (obj1.y + obj1.image.height)/2;
    var x2 = (obj2.x + obj2.image.width)/2;
    var y2 = (obj2.y + obj2.image.height)/2;
    var dx = x1 - x2;
    var dy = y1 - y2;
    return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2))
}

function collisionDetector(){
    for (var i in objects){
        var obj = objects[i];
        if (obj == airplane){ continue }
        if (distance(airplane, obj) < 50){
            // Our plane hits something
            console.log('COLLISION!');
            airplane.status = 'burning';
            airplane.update = function(){};
        }
    }
}

function main(){
    updateGame();
    collisionDetector();
    renderGame();
    particlesRender();
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