#!/bin/bash


./network.sh down
./network.sh up -ca
./network.sh createChannel -c mychannel
./network.sh deployCC -ccn teste -ccp /home/lucas/WebServer/chaincode/ -ccl javascript
