import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import VideoProvider from './component';
import VideoService from './service';

const VideoProviderContainer = ({ children, ...props }) => {
  const { streams, findStream } = props;

  const allCameras = !streams.length ? null
    : <VideoProvider {...props}>{children}</VideoProvider>;

  return (findStream ? <VideoProvider {...props}>{children}</VideoProvider>
    : allCameras);
};

export default withTracker((props) => {
  // getVideoStreams returns a dictionary consisting of:
  // {
  //  streams: array of mapped streams
  //  totalNumberOfStreams: total number of shared streams in the server
  // }
  const {
    streams,
    totalNumberOfStreams,
  } = VideoService.getVideoStreams();

  return {
    swapLayout: props.swapLayout,
    streams,
    totalNumberOfStreams,
    isUserLocked: VideoService.isUserLocked(),
    findStream: props.findStream,
    userId: props.userId,
  };
})(VideoProviderContainer);
