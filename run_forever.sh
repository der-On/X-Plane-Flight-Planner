#!/bin/bash
datestamp=$(date +%d-%m-%Y-%H.%M.%S)
NODE_ENV=production forever --uid="x-plane_fligh-planner" -a -l /home/nodejs/projects/X-Plane-Flight-Planner/log/forever_${datestamp}.log start app.js
