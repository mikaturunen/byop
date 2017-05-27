#!/bin/bash

TEMPLATES="./docker-templates"
PSP="./psp"

# Create the Dockerfile from node dockerfile base template for payments
cat $TEMPLATES/Dockerfile-node-shared $PSP/Dockerfile-psp > $PSP/Dockerfile
echo "Generated Dockerfile for payments API."

# Create production ready docker-compose.yml
cat $TEMPLATES/docker-compose-shared.yml $PSP/docker-compose-psp.yml > docker-compose.yml
echo "Generated docker-compose.yml for all APIs."
