#!/bin/bash

TEMPLATES="./docker-templates"
PAYMENTS="./psp"
MERCHANT="./merchant"

# Create the Dockerfile from node dockerfile base template for payments
cat $TEMPLATES/Dockerfile-node-shared $PAYMENTS/Dockerfile-payments > $PAYMENTS/Dockerfile
echo "Generated Dockerfile for payments API."
# Copies the node shared configuration for the API
cat node-api.yml > $PAYMENTS/source/config/app.yml
echo "Copied node-api.yml to psp API config/app.yml"

# Create production ready docker-compose.yml
cat $TEMPLATES/docker-compose-shared.yml $PAYMENTS/docker-compose-payments.yml > docker-compose.yml
echo "Generated docker-compose.yml for all APIs."
