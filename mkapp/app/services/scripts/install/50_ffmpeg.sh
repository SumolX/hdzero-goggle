#!/bin/sh

ln -sfn /mnt/app/services/ffmpeg/lib/libavcodec.so.59 /lib/libavcodec.so.59
ln -sfn /mnt/app/services/ffmpeg/lib/libavdevice.so.59 /lib/libavdevice.so.59
ln -sfn /mnt/app/services/ffmpeg/lib/libavfilter.so.8 /lib/libavfilter.so.8
ln -sfn /mnt/app/services/ffmpeg/lib/libavformat.so.59 /lib/libavformat.so.59
ln -sfn /mnt/app/services/ffmpeg/lib/libavutil.so.57 /lib/libavutil.so.57

ln -sfn /mnt/app/services/ffmpeg/bin/ffmpeg /bin/ffmpeg
ln -sfn /mnt/app/services/ffmpeg/bin/ffprobe /bin/ffprobe

