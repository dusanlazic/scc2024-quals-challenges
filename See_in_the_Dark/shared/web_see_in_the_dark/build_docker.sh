#!/bin/bash
docker build -t see_in_the_dark .
docker run --rm -d -p 2000:2000 --name see_in_the_dark see_in_the_dark
