#!/bin/bash

pm2 stop 1
pm2 stop 0

pm2 delete 1
pm2 delete 0

pm2 uninstall pm2-logrotate
npm uninstall -g pm2

