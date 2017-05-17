FROM    node:7.10.0-alpine

ENV     home /usr/node-app

RUN     mkdir -p ${home}
WORKDIR ${home}

COPY    source ${home}/source

COPY    package.json ${home}
RUN     npm install --production

EXPOSE  3000
CMD     [ "npm", "start" ]