var config = require("./config.js");
var socket = require("socket.io-client")("http://localhost:3000");
var gpio = require("rpi-gpio");
const sensor = require('ds18b20-raspi');
var tempglobal;
var globalvalue;
var handler;  //values: 0=undefined, 1=on for 5 min, 2=off for 5 min
//gpio.setup(config.led, gpio.DIR_OUT, write);

//exit function
process.on("SIGINT", function(){
  gpio.write(config.led, 0, function(){
    gpio.destroy(function(){
      process.exit();
    });
  });
});

//sleep function - use "sleep(500).then(() => {})"
const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

//initialize LED
gpio.setup(config.led, gpio.DIR_OUT, function(){
  gpio.write(config.led, 0); // turns led off
});

//poll temperature sensor
setInterval(polltemp, 1000);
function polltemp() {
const tempF = sensor.readSimpleF(1);
console.log(`${tempF} F`);
console.log("globalvalue= " + globalvalue);
tempglobal = tempF;
socket.emit("tempUpdate", tempglobal); //emits to server
}

//logical operation
setInterval(logicSwitch, 500);
function logicSwitch() {
var localhandler;
function empty(){}
//  case 0:  //undefined
  if(globalvalue === undefined){
    console.log("switch undefined, localhandler: " + localhandler);
      gpio.write(config.led, 0);
  }
//  case 1:  //switch on a/c, switch handler to 1
  if(globalvalue < tempglobal){
    console.log("switch a/c on, localhandler: " + localhandler);
//    handleron(keep);
    localhandler = 1;
    handler = localhandler;
    console.log("global handler:" + handler);
  }
//  case 2:  //switch off a/c, switch handler to 2
  if(globalvalue >= tempglobal) {
    console.log("switch a/c off, localhandler: " + localhandler);
//    handleroff(keep);
    localhandler = 2;
    handler = localhandler;
    console.log("global handler:" + handler);
  }
}

setInterval(handler, 5000);
function handler() {
if (handler == 1) {
  console.log("WHILE: handler currently at " + handler);
  gpio.write(config.led, 1);
  }
if (handler == 2){
  console.log("WHILE: handler currently at " + handler);
  gpio.write(config.led, 0);
  }
}

/*
//gpio handler and timer
setTimeout(handleron, 5000);
function handleron(callback) {
  gpio.write(config.led, 1);
}

setTimeout(handleroff, 5000);
function handleroff(callback) {
  gpio.write(config.led, 0);
}
*/

/*
function logicSwitch() {
var handler = 0;
function empty(){}
switch (empty) {
  case 0:  //undefined
    globalvalue === undefined;
    gpio.write(config.led, 0);
    break;
  case 1:  //switch on a/c, then move to next case to prolong the on state
    globalvalue < tempglobal;
    gpio.write(config.led, 1);
    handler = 1;
    break;
  case 2:  //keep a/c on
    handler == 1;
    setTimeout(empty, 15000);
    handler = 0;
    break;
  case 3:  //switch off a/c, the move to next case to prolong the off state
    globalvalue >= tempglobal;
    gpio.write(config.led, 0);
    handler = 2;
    break;
  case 4:  //keep a/c off
    handler == 2;
    setTimeout(empty, 15000);
    handler = 0;
    break;
  }
}
*/

/*
//logical comparison
if (globalvalue === undefined) {
//  setInterval(preInput, 1000);
    console.log("in the preInput loop");
  function preInput() {
    gpio.write(config.led, 0);
  }
} else {
    console.log("in the logic loop");
  setInterval(logic, 15000);
  function logic() {
    if (globalvalue < tempglobal) {
      gpio.write(config.led, 1);
      console.log("A/C on");
    } else {
      gpio.write(config.led, 0);
      console.log("A/C off");
    }
  }
}
*/

//commands between server
socket.on("connect", function(){
  console.log("Connected to server");
  socket.on("updateState", function(value){
    console.log("New preferred temperature is: " + value);
    globalvalue = value;
  });
})
