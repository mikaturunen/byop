#!/bin/bash

# start payments volume mounted container
docker stop payments 2> /dev/null | true
docker rm payments 2> /dev/null | true
docker run -d --name payments -p 3000:3000 -v /Users/nalle/repos/byop/api/payments:/urs/node-app node:7.10.0
docker exec -ti payments npm install
docker exec -ti payments npm start

#docker-compose up
