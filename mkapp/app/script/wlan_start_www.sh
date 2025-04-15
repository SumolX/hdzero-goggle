#!/bin/sh

export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:/lib:/lib/eyesee-mpp

rm -rf /tmp/www
cp -a /mnt/app/services/www /tmp/
ln -sfn /mnt/extsd/DCIM/100HDZRO /tmp/www/movies

httpd -h /tmp/www
curl -X POST "http://127.0.0.1/cgi-bin/live?play"
