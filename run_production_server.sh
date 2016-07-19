#!/bin/bash
datestamp=$(date +%d-%m-%Y-%H.%M.%S)
NODE_ENV=production node app.js > log/output_${datestamp}.log &
