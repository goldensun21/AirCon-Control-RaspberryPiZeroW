var config = require("./config.js");
var socket = require("socket.io-client")("http://localhost:3000");
var gpio = require("rpi-gpio");
const sensor = require('ds18b20-raspi');
var tempglobal;
var globalvalue = 78;
var handler = 0;

//exit function
process.on("SIGINT", function(){
  gpio.write(config.relay, 0, function(){
    gpio.destroy(function(){
      process.exit();
    });
  });
});

//sleep function - use "sleep(500).then(() => {})"
const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

//initialize relay
gpio.setup(config.relay, gpio.DIR_OUT, function(){
  gpio.write(config.relay, 0); // turns relay off
});

//poll temperature sensor
setInterval(polltemp, 1000);
function polltemp() {
const tempF = sensor.readSimpleF(1);
console.log("Current temperature is " + tempF + " F");
//console.log("globalvalue = " + globalvalue);
tempglobal = tempF;
socket.emit("tempUpdate", tempglobal); //emits to server
}

//on and off functions
socket.on("onButton", function() {
  console.log("Turned on");
  handler = 1;
  logicTime = setInterval(logic, 300000);
  if (globalvalue < tempglobal) {
    gpio.write(config.relay, 1);
  }
  console.log("Handler state: " + handler);
  socket.emit("updateState", handler);
});
socket.on("offButton", function() {
  console.log("Turned off");
  if (handler==1) {
    clearInterval(logicTime);
  }
  handler = 0;
  gpio.write(config.relay, 0);
  console.log("Handler state: " + handler);
  socket.emit("updateState", handler);
});

//temperature adjustment functions
socket.on("plusButton", function() {
  globalvalue++;
  console.log("Desired temperature increased to " + globalvalue);
    socket.emit("newDesired", globalvalue);
});
socket.on("minusButton", function() {
  globalvalue--;
  console.log("Desired temperature decreased to " + globalvalue);
    socket.emit("newDesired", globalvalue);
});
socket.on("newWebClient", function() {
  console.log("Desired temperature is " + globalvalue);
    socket.emit("newDesired", globalvalue);
    socket.emit("updateState", handler);
});

//logical operators
function logic() {
  if (globalvalue < tempglobal && handler == 1) {
      console.log("A/C on");
        gpio.write(config.relay, 1);
    } else {
      console.log("A/C off");
        gpio.write(config.relay, 0);
    }
}

//commands between server
socket.on("connect", function(){
  console.log("Connected to server");
  socket.on("updateState", function(value){
    console.log("New preferred temperature is: " + value);
    globalvalue = value;
  });
})

