var admin = require('firebase-admin');
var Matter = require('matter-js');
var io = require('socket.io').listen(5010);



//FIREBASE
console.log('Setting up firebase service account...');
var serviceAccount = require('./univer2e-68942-firebase-adminsdk-1b7uc-89a3fe2860.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://univer2e-68942.firebaseio.com"
});
var fbFS = admin.firestore();



//MATTER.JS 
console.log('Setting up Matter.js');
// module aliases
var Engine = Matter.Engine,
    World = Matter.World,
    Bodies = Matter.Bodies;

// create an engine
var engine = Engine.create();

//Disable gravity
engine.world.gravity.x = 0;
engine.world.gravity.y = 0.1;

// create two boxes and a ground
var boxA = Bodies.rectangle(400, 200, 80, 80);
var boxB = Bodies.rectangle(450, 50, 80, 80);
var ground = Bodies.rectangle(400, 610, 810, 60, { isStatic: true });

// add all of the bodies to the world
World.add(engine.world, [boxA, boxB, ground]);



//SOCKET.IO
io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});
//TODO validate socket.io connection authorization https://stackoverflow.com/questions/12122783/socket-io-session-without-express-js



//START
setInterval(() => {
  Engine.update(engine, 1000 / 20);

  var update = {
    objects: {}
  }

  engine.world.bodies.forEach(body => {
    update.objects[body.id] = {
      position: body.position,
      angle: body.angle,
      velocity: body.velocity,
      angularVelocity: body.angularVelocity,
    }
  });

  io.emit('spatial update', update);
}, 1000 / 20);//TODO if only transmitting 20 times per second, increase clacs per update of the engine?

console.log("Server started! Socket.io listening on port 5010");