#!/bin/bash
if ! command -v node &> /dev/null
then
	echo "Node could not be found"
	exit
fi
if ! command -v npm &> /dev/null
then
	echo "npm could not be found"
	exit
fi
ENV=./.env
if test -f "$ENV"; then
	echo "$ENV exists."
fi

npm install

npm install -g pm2

pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 100M
pm2 set pm2-logrotate:compress true

pm2 start index.js
