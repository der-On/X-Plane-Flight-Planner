#!/bin/bash
datestamp=$(date +%d-%m-%Y-%H.%M.%S)
NODE_ENV=production forever -l /projects/xplane/X-Plane-Flight-Planner/log/forever_${datestamp}.log start app.js
