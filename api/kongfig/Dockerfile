FROM    node:7.10.0-alpine

ENV     home /usr/node-app

RUN     mkdir -p ${home}
WORKDIR ${home}

COPY    package.json ${home}
RUN     npm install --production

# TODO run npm command to actually put the kongfig in place