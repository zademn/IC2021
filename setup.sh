#!/bin/bash

# This script generates the required variables
secret_key=$(openssl rand -hex 32)

echo "SECRET_KEY=\"$secret_key\"" > .env