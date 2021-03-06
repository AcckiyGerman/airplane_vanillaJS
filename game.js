// loading canvas
var canvas = document.getElementById('Canvas');
var scene = canvas.getContext('2d');
scene.font = "20pt Arial";

// control
var KEY = {UP: 38, DOWN: 40, ESC: 27};
var pressed = {};
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

// loading sprites
var images = {};
images.BG = new Image();
images.BG.src = 'assets/background.png';
images.airplane = new Image();
images.airplane.src = 'assets/airplane2.png';
images.cloud1 = new Image();
images.cloud1.src = 'assets/heavy_cloud.png';
images.cloud2 = new Image();
images.cloud2.src = 'assets/cloud.png';
images.fire = new Image();
images.fire.src = 'assets/fire.png';
images.road = new Image();
images.road.src = 'assets/road.jpg';

// sound
var audio = {};
audio.engine = new Audio();
audio.engine.src = 'assets/engine.mp3';
audio.burning = new Audio();
audio.burning.preload = 'auto';
audio.burning.src = 'assets/burning.mp3';

// game objects
var airplane = {
    image : images.airplane,
    x: 0, y: canvas.height/2,
    speed: 1,
    autoPilot: '', iterations: 0,
    status: 'flying',
    update : function () {  // here we describe the airplane behavior.
        // manual fly
        if (pressed[KEY.UP] && this.y > 0){
            this.y -= 7;
            return
        } else if (pressed[KEY.DOWN] &&
                    this.y + this.image.height < canvas.height-100) {
            this.y += 7;
            return
        }
        // autopilot
        if (this.iterations > 0){
            switch (this.autoPilot){
                case 'down':
                    if(this.y < canvas.height-80){ this.y += 7 };
                    break;
                case 'up':
                    if(this.y > 7){this.y -= 7};
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
// this function will replace airplane.update() after hitting the cloud
function landing(){
    if (airplane.y + airplane.image.height < canvas.height){
        airplane.y += 0.8;
        airplane.x += airplane.speed;
    } else if (airplane.speed > 0){
        audio.burning.pause();
        airplane.status = 'landed';
        Road.prototype.update = function(){
            this.x -= 3;
        };

        airplane.speed -= 0.01;
        airplane.x += airplane.speed;
    } else {
        gameover = true;

    }
}
// cloud constructor
function Cloud( type, x, y ){
    this.image = images[type];
    this.x = x; this.y = y;
}
Cloud.prototype.update = function(){
    this.x -= 6;
};
// road constructor
function Road(x, y){
    this.image = images.road;
    this.x = x; this.y = y;
}
Road.prototype.update = function () {
    this.x -= 6;
};

// preloading game objects
var gameover = false;
var objects = [];
objects.push(airplane);
for (var i = 1; i<15; i++){
    objects.push(new Cloud('cloud1', i*500, Math.round(Math.random()*400)));
}
audio.engine.play();

// main game functions
function updateGame(){
    for (var i in objects){
        objects[i].update();
    }
    // also we need to check if is it time to finish the game?
    // after 14 clouds we need to hit the 15th and land the airplane
    var lastCloud = objects[objects.length-1];
    if (lastCloud.x + lastCloud.image.width < 0 &&
        airplane.status == 'flying' ){ // in that case game is finishing anyway
            objects.push(new Cloud('cloud2', canvas.width, airplane.y-50));
            // and let's switch off airplane ability to avoid cloud
            airplane.update = function(){};
    }
}

function renderGame(){
    scene.drawImage(images.BG, 0, 0);

    for (var i in objects){
        scene.drawImage(objects[i].image, objects[i].x, objects[i].y);
    }
}

function renderParticles(){
    if (airplane.status == 'burning'){
        scene.drawImage(images.fire, airplane.x, airplane.y)
    }
}

function distance(obj1, obj2){
    var x1 = (obj1.x + obj1.image.width/2);
    var y1 = (obj1.y + obj1.image.height/2);
    var x2 = (obj2.x + obj2.image.width/2);
    var y2 = (obj2.y + obj2.image.height/2);
    var dx = x1 - x2;
    var dy = y1 - y2;
    return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2))
}

function collisionDetector(){
    if (airplane.status == 'flying')  // no sense to check collision - plane already landing
    for (var j in objects){
        var obj = objects[j];
        if (obj == airplane){ continue }
        if (distance(airplane, obj) < 70){
            // Our plane hits something - now we need to land the airplane
            airplane.status = 'burning';
            audio.burning.play();
            audio.engine.pause();
            airplane.update = landing;
            Cloud.prototype.update = function(){
                this.x -= 6;
                // plane goes down - clouds going up!
                this.y -= 0.6;
            };
            for (var i = 1; i<25; i++){
                // add landing road:
                // do it with unshift, otherwise road will cover the airplane while landing
                objects.unshift(
                    new Road(800 + i*images.road.width, canvas.height - images.road.height)
                );
            }
        }
    }
}

function main(){
    updateGame();
    collisionDetector();
    renderGame();
    renderParticles();
    if (pressed[KEY.ESC]) {
        //alert('BYE BYE');
        scene.fillText('BYE BYE', canvas.width/2, canvas.height/2);
        audio.engine.pause();
        audio.burning.pause();
        return;  // stops the game - we don't call 'requestAnimationFrame'
    }
    if (gameover){
        alert('BE CAREFUL WHILE FLYING');
        document.location.reload();
        return
    }
    requestAnimationFrame(main);  // continues the game
}

document.onload = requestAnimationFrame(main);  //Let's Rock!