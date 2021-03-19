import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { Session } from 'meteor/session';
import UserListService from '/imports/ui/components/user-list/service';
import UserParticipants from './component';
import { meetingIsBreakout } from '/imports/ui/components/app/service';
import Settings from '/imports/ui/services/settings';
import VideoService from '/imports/ui/components/video-provider/service';
import MediaService, { getSwapLayout, shouldEnableSwapLayout } from '/imports/ui/components/media/service';
import { withModalMounter } from '/imports/ui/components/modal/service';

const UserParticipantsContainer = props => <UserParticipants {...props} />;
const { current_presentation: hasPresentation } = MediaService.getPresentationInfo();

export default withModalMounter(withTracker(() => ({
  users: UserListService.getUsers(),
  meetingIsBreakout: meetingIsBreakout(),
  swapLayout: (getSwapLayout() || !hasPresentation) && shouldEnableSwapLayout(),
  audioModalIsOpen: Session.get('audioModalIsOpen'),
  usersVideo: VideoService.getVideoStreams(),
  viewParticipantsWebcams: Settings.dataSaving,
}))(UserParticipantsContainer));
