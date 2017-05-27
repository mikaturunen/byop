FROM    node:7.10.0-alpine

ENV     home /usr/node-app

RUN     mkdir -p ${home}
WORKDIR ${home}

COPY    source ${home}/source

COPY    package.json ${home}
RUN     npm install --production
# End / base for dockerfile used by payments api
# This has to be used in conjuctions with the Dockerfile-node-shared dockerfile from dockerfile-templates

EXPOSE  3000
CMD     [ "npm", "start" ]
