#!/bin/bash
docker build -t neglegentia .
docker run --rm -d -p 1337:1337 --name neglegentia neglegentia
