#!/bin/bash

pm2 stop 2
pm2 stop 0

pm2 delete 2
pm2 delete 0

pm2 uninstall pm2-logrotate
npm uninstall -g pm2

