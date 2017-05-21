#!/bin/bash

TEMPLATES="./docker-templates"
PAYMENTS="./payments"

# Create the Dockerfile from node dockerfile base template for payments
cat $TEMPLATES/Dockerfile-node-shared $PAYMENTS/Dockerfile-payments > $PAYMENTS/Dockerfile
echo "Generated Dockerfile for payments API."

# Create production ready docker-compose.yml
cat $TEMPLATES/docker-compose-shared.yml $PAYMENTS/docker-compose-payments.yml > docker-compose.yml
echo "Generated docker-compose.yml for all APIs."
