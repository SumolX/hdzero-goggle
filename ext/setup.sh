#!/bin/bash
set -e

# dropbear
rm -rf dropbear/build && mkdir dropbear/build && cd dropbear
cmake . -DCMAKE_BUILD_TYPE=Release -DCMAKE_TOOLCHAIN_FILE=../../toolchain/share/buildroot/toolchainfile.cmake -Bbuild
cd build && make && cd ../../
