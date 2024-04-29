#!/bin/bash
docker build -t slaga1337za .
docker run --rm -d -p 3735:3735 --name slaga1337za slaga1337za
