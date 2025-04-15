set(FFMPEG_INCLUDE_DIRECTORIES
    ${CMAKE_CURRENT_SOURCE_DIR}/include
)

set(PREBUILT_LIBRARIES
    ${CMAKE_SOURCE_DIR}/mkapp/app/services/ffmpeg/lib/libavcodec.so
    ${CMAKE_SOURCE_DIR}/mkapp/app/services/ffmpeg/lib/libavcodec.so.59
    ${CMAKE_SOURCE_DIR}/mkapp/app/services/ffmpeg/lib/libavcodec.so.59.18.100
    ${CMAKE_SOURCE_DIR}/mkapp/app/services/ffmpeg/lib/libavdevice.so
    ${CMAKE_SOURCE_DIR}/mkapp/app/services/ffmpeg/lib/libavdevice.so.59
    ${CMAKE_SOURCE_DIR}/mkapp/app/services/ffmpeg/lib/libavdevice.so.59.4.100
    ${CMAKE_SOURCE_DIR}/mkapp/app/services/ffmpeg/lib/libavfilter.so
    ${CMAKE_SOURCE_DIR}/mkapp/app/services/ffmpeg/lib/libavfilter.so.8
    ${CMAKE_SOURCE_DIR}/mkapp/app/services/ffmpeg/lib/libavfilter.so.8.24.100
    ${CMAKE_SOURCE_DIR}/mkapp/app/services/ffmpeg/lib/libavformat.so
    ${CMAKE_SOURCE_DIR}/mkapp/app/services/ffmpeg/lib/libavformat.so.59
    ${CMAKE_SOURCE_DIR}/mkapp/app/services/ffmpeg/lib/libavformat.so.59.16.100
    ${CMAKE_SOURCE_DIR}/mkapp/app/services/ffmpeg/lib/libavutil.so
    ${CMAKE_SOURCE_DIR}/mkapp/app/services/ffmpeg/lib/libavutil.so.57
    ${CMAKE_SOURCE_DIR}/mkapp/app/services/ffmpeg/lib/libavutil.so.57.17.100
)

add_library(ffmpeg SHARED IMPORTED GLOBAL)
set_target_properties(ffmpeg PROPERTIES
    IMPORTED_LOCATION ${CMAKE_SOURCE_DIR}/mkapp/app/services/ffmpeg/lib/libavcodec.so # dummy
    INTERFACE_INCLUDE_DIRECTORIES "${FFMPEG_INCLUDE_DIRECTORIES}"
)
target_link_libraries(ffmpeg INTERFACE
    ${PREBUILT_LIBRARIES}
)
install(FILES ${PREBUILT_LIBRARIES} TYPE LIB)