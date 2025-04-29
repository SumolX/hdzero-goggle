#!/bin/sh

export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:/lib:/lib/eyesee-mpp

# Prepare web resources
rm -rf /tmp/www
cp -a /mnt/app/services/www /tmp/

# Prepare dvr cache
rm -rf /mnt/extsd/cache/www/dvr
mkdir -p /mnt/extsd/cache/www
cp -a /tmp/www/dvr /mnt/extsd/cache/www/
rm -rf /tmp/www/dvr

# Link sd card resources to web resources
ln -sfn /mnt/extsd/cache/www/dvr /tmp/www/dvr
ln -sfn /mnt/extsd/DCIM/100HDZRO /tmp/www/movies

# Start server
httpd -h /tmp/www
