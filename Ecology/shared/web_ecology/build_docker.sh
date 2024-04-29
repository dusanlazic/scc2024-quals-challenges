#!/bin/bash
docker build -t ecology .
docker run --rm -d -p 5000:5000 --name ecology ecology