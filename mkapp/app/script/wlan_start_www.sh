#!/bin/sh

# Non-Blocking
{
    # Setup Environment
    sleep 1
    rm -rf /tmp/www
    mkdir -p /tmp/www/live
    mkdir -p /tmp/www/dvr    
    cp -a /mnt/app/services/www/* /tmp/ && \
    cd /tmp/www && \
    ln -s /mnt/extsd/movies movies

    # Invoke Services
    if [ $? -eq 0 ]; then
        httpd -v -p 80 > /tmp/httpd.log 2>&1 &
        cd live
        /mnt/app/app/record/hlsProxy -T 8000 rtsp://127.0.0.1:8554/hdzero hdz > /tmp/hlsProxy.log 2>&1 &
    fi

    # Monitor Services
    sleep 5
    while [ ! -z "$(ps | grep hlsProxy)" -a ! -z "$(ls /tmp/www/live/hdz.m3u8 2>/dev/null)" ]; do
        sleep 10
    done
    killall httpd
    killall hlsProxy
    /mnt/app/script/wlan_start_www.sh
} &
