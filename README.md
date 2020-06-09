# AirCon-Control-RaspberryPiZeroW
A/C control for Raspberry Pi Zero W w/ temp sensor

This express/node.js web server runs on the local network and controls a relay/Air Conditioner based on temperature readings from a sensor connected to a Raspberry Pi Zero W. It has a web-based dashboard for easy control.

This code has just been finished and still needs some TLC and cleanup. Basic functionality is there.

Code sources and tutorials I used can be found at the following links:

Huge credit to sidwarkd on GitHub/Kevin on YouTube

  https://github.com/sidwarkd/microcast_episode_17
  https://www.youtube.com/watch?v=z3O26CC9nAc&t=321s

Used DS18B20 Temperature Sensor and 1 wire with the following RPi packages:

  https://www.npmjs.com/package/rpi-gpio
  https://www.npmjs.com/package/ds18b20-raspi

Used express server for web server configuration
  https://www.npmjs.com/package/express

Used socket.io for websocket functionality
  https://socket.io/

Other node modules used in this project can be found in the "node_modules" directory and package-lock.json file
