#!/bin/sh

# Non-Blocking
{
    # Invoke Services
    sleep 1
    rm -rf /tmp/www
    cp -a /mnt/app/services/www /tmp/ && \
    cd /tmp/www

    if [ $? -eq 0 ]; then
        /mnt/app/app/record/hlsProxy -T 8000 rtsp://127.0.0.1:8554/hdzero hdz_live > /tmp/hlsProxy.log 2>&1 &
        httpd -p 80 > /tmp/httpd.log 2>&1 &
    fi

    # Monitor Services
    sleep 5
    while [ ! -z "$(ps | grep hlsProxy)" -a ! -z "$(ls /tmp/www/hdz_live.m3u8 2>/dev/null)" ]; do
        sleep 10
    done
    killall httpd
    killall hlsProxy
    /mnt/app/script/wlan_start_www.sh
} &
