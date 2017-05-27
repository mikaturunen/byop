#!/bin/bash

TEMPLATES="./docker-templates"
PSP="./psp"

# Create the Dockerfile from node dockerfile base template for payments
cat $TEMPLATES/Dockerfile-node-shared $PSP/Dockerfile-payments > $PSP/Dockerfile
echo "Generated Dockerfile for payments API."
# Copies the node shared configuration for the API
cat node-api.yml > $PSP/source/config/app.yml
echo "Copied node-api.yml to psp API config/app.yml"

# Create production ready docker-compose.yml
cat $TEMPLATES/docker-compose-shared.yml $PSP/docker-compose-payments.yml > docker-compose.yml
echo "Generated docker-compose.yml for all APIs."
