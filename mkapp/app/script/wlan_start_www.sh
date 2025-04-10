#!/bin/sh

rm -rf /tmp/www
cp -a /mnt/app/services/www /tmp/ && \
cd /tmp/www && \
ln -sfn /mnt/extsd/DCIM/100HDZRO movies && \
httpd -v -p 80 2>&1 > /tmp/httpd.log &
