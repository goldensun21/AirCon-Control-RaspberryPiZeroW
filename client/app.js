//Framework of app credited to Kevin Sidwar - https://github.com/sidwarkd
//client app to be run on Raspberry Pi with DS18B20 temperature sensor on 1Wire

var config = require("./config.js");
var socket = require("socket.io-client")("http://localhost:3000");
var gpio = require("rpi-gpio");
const sensor = require('ds18b20-raspi');
var tempglobal;
var globalvalue;
var handler;

//exit function
process.on("SIGINT", function(){
  gpio.write(config.led, 0, function(){
    gpio.destroy(function(){
      process.exit();
    });
  });
});

//initialize LED
gpio.setup(config.led, gpio.DIR_OUT, function(){
  gpio.write(config.led, 0); // turns led off
});

//poll temperature sensor every 1 second
setInterval(polltemp, 1000);
function polltemp() {
const tempF = sensor.readSimpleF(1);  //reads temp in F and rounds to 1 decimal
console.log("Current temperature is " + tempF + " F");
tempglobal = tempF;    //pass tempF to global variable for use in other functions
socket.emit("tempUpdate", tempglobal); //emits temperature data to server
}

//on and off functions
socket.on("onButton", function() {
  console.log("Turned on");
  handler = 1;
  logicTime = setInterval(logic, 300000);  //sets logic function to run for 5 minute intervals
  if (globalvalue < tempglobal) {
    gpio.write(config.led, 1);    //preliminary "on" signal to relay
  }
  console.log("Handler state: " + handler);
});
socket.on("offButton", function() {
  console.log("Turned off");
  handler = 0;
  clearInterval(logicTime);    //clear logic function interval
  gpio.write(config.led, 0);
  console.log("Handler state: " + handler);
});


//logical operators for continual operation after temp is set
function logic() {
  if (globalvalue < tempglobal && handler == 1) {
      console.log("A/C on");
        gpio.write(config.led, 1);
    } else {
      console.log("A/C off");
        gpio.write(config.led, 0);
    }
}

//initial server connection and temp preferences settings
socket.on("connect", function(){
  console.log("Connected to server");
  socket.on("updateState", function(value){
    console.log("New preferred temperature is: " + value);
    globalvalue = value;
  });
})
