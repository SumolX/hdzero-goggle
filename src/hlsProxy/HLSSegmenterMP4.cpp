/**********
This library is free software; you can redistribute it and/or modify it under
the terms of the GNU Lesser General Public License as published by the
Free Software Foundation; either version 3 of the License, or (at your
option) any later version. (See <http://www.gnu.org/copyleft/lesser.html>.)

This library is distributed in the hope that it will be useful, but WITHOUT
ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
FOR A PARTICULAR PURPOSE.  See the GNU Lesser General Public License for
more details.

You should have received a copy of the GNU Lesser General Public License
along with this library; if not, write to the Free Software Foundation, Inc.,
51 Franklin Street, Fifth Floor, Boston, MA 02110-1301  USA
**********/
// "liveMedia"
// Copyright (c) 1996-2023 Live Networks, Inc.  All rights reserved.
// A media sink that takes - as input - a MPEG Transport Stream, and outputs a series
// of MPEG Transport Stream files, each representing a segment of the input stream,
// suitable for HLS (Apple's "HTTP Live Streaming").
// Implementation

#include "HLSSegmenterMP4.hh"
#include "MPEG2TransportStreamMultiplexor.hh"
#include "OutputFile.hh"

#define TRANSPORT_PACKET_SIZE   188
#define OUTPUT_FILE_BUFFER_SIZE (TRANSPORT_PACKET_SIZE * 100)

HLSSegmenterMP4 *HLSSegmenterMP4 ::createNew(UsageEnvironment &env,
                                             unsigned segmentationDuration, char const *fileNamePrefix,
                                             onEndOfSegmentFunc *onEndOfSegmentFunc, void *onEndOfSegmentClientData) {
    return new HLSSegmenterMP4(env, segmentationDuration, fileNamePrefix,
                               onEndOfSegmentFunc, onEndOfSegmentClientData);
}

HLSSegmenterMP4::HLSSegmenterMP4(UsageEnvironment &env,
                                 unsigned segmentationDuration, char const *fileNamePrefix,
                                 onEndOfSegmentFunc *onEndOfSegmentFunc, void *onEndOfSegmentClientData)
    : MediaSink(env)
    , fSegmentationDuration(segmentationDuration)
    , fFileNamePrefix(fileNamePrefix)
    , fOnEndOfSegmentFunc(onEndOfSegmentFunc)
    , fOnEndOfSegmentClientData(onEndOfSegmentClientData)
    , fHaveConfiguredUpstreamSource(False)
    , fCurrentSegmentCounter(1)
    , fOutFid(NULL) {
    // Allocate enough space for the segment file name:
    fOutputSegmentFileName = new char[strlen(fileNamePrefix) + 20 /*more than enough*/];

    // Allocate the output file buffer size:
    fOutputFileBuffer = new unsigned char[OUTPUT_FILE_BUFFER_SIZE];
}
HLSSegmenterMP4::~HLSSegmenterMP4() {
    delete[] fOutputFileBuffer;
    delete[] fOutputSegmentFileName;
}

void HLSSegmenterMP4::ourEndOfSegmentHandler(void *clientData, double segmentDuration) {
    ((HLSSegmenterMP4 *)clientData)->ourEndOfSegmentHandler(segmentDuration);
}

void HLSSegmenterMP4::ourEndOfSegmentHandler(double segmentDuration) {
    // Note the end of the current segment:
    if (fOnEndOfSegmentFunc != NULL) {
        (*fOnEndOfSegmentFunc)(fOnEndOfSegmentClientData, fOutputSegmentFileName, segmentDuration);
    }

    // Begin the next segment:
    ++fCurrentSegmentCounter;
    openNextOutputSegment();
}

Boolean HLSSegmenterMP4::openNextOutputSegment() {
    CloseOutputFile(fOutFid);

    sprintf(fOutputSegmentFileName, "%s%03u.mp4", fFileNamePrefix, fCurrentSegmentCounter);
    fOutFid = OpenOutputFile(envir(), fOutputSegmentFileName);

    return fOutFid != NULL;
}

void HLSSegmenterMP4::afterGettingFrame(void *clientData, unsigned frameSize,
                                        unsigned numTruncatedBytes,
                                        struct timeval /*presentationTime*/,
                                        unsigned /*durationInMicroseconds*/) {
    ((HLSSegmenterMP4 *)clientData)->afterGettingFrame(frameSize, numTruncatedBytes);
}

void HLSSegmenterMP4::afterGettingFrame(unsigned frameSize, unsigned numTruncatedBytes) {
    if (numTruncatedBytes > 0) { // Shouldn't happen
        fprintf(stderr, "HLSSegmenterMP4::afterGettingFrame(frameSize %d, numTruncatedBytes %d)\n", frameSize, numTruncatedBytes);
    }

    // Write the data to our output segment file:
    fwrite(fOutputFileBuffer, 1, frameSize, fOutFid);

    // Then try getting the next frame:
    continuePlaying();
}

void HLSSegmenterMP4::ourOnSourceClosure(void *clientData) {
    ((HLSSegmenterMP4 *)clientData)->ourOnSourceClosure();
}

void HLSSegmenterMP4::ourOnSourceClosure() {
    // Note the end of the final segment (currently being written):
    if (fOnEndOfSegmentFunc != NULL) {
        // We know that the source is a "MPEG2TransportStreamMultiplexor":
        MPEG2TransportStreamMultiplexor *multiplexorSource = (MPEG2TransportStreamMultiplexor *)fSource;
        double segmentDuration = multiplexorSource->currentSegmentDuration();

        (*fOnEndOfSegmentFunc)(fOnEndOfSegmentClientData, fOutputSegmentFileName, segmentDuration);
    }

    // Handle the closure for real:
    onSourceClosure();
}

Boolean HLSSegmenterMP4::sourceIsCompatibleWithUs(MediaSource &source) {
    // Our source must be a Transport Stream Multiplexor:
    return source.isMPEG2TransportStreamMultiplexor();
}

Boolean HLSSegmenterMP4::continuePlaying() {
    if (fSource == NULL)
        return False;
    if (!fHaveConfiguredUpstreamSource) {
        // We know that the source is a "MPEG2TransportStreamMultiplexor":
        MPEG2TransportStreamMultiplexor *multiplexorSource = (MPEG2TransportStreamMultiplexor *)fSource;

        // Tell our upstream multiplexor to call our 'end of segment handler' at the end of
        // each timed segment:
        multiplexorSource->setTimedSegmentation(fSegmentationDuration, ourEndOfSegmentHandler, this);

        fHaveConfiguredUpstreamSource = True; // from now on
    }
    if (fOutFid == NULL && !openNextOutputSegment())
        return False;

    fSource->getNextFrame(fOutputFileBuffer, OUTPUT_FILE_BUFFER_SIZE,
                          afterGettingFrame, this,
                          ourOnSourceClosure, this);

    return True;
}
