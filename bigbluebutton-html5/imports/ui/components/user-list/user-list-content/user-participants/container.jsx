import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import UserListService from '/imports/ui/components/user-list/service';
import UserParticipants from './component';
import { meetingIsBreakout } from '/imports/ui/components/app/service';
import MediaContainer from '/imports/ui/components/media/container';
import Settings from '/imports/ui/services/settings';

const UserParticipantsContainer = props => <UserParticipants {...props} />;

export default withTracker(() => ({
  users: UserListService.getUsers(),
  meetingIsBreakout: meetingIsBreakout(),
  disableVideo: MediaContainer.disableVideo,
  swapLayout: MediaContainer.swapLayout,
  audioModalIsOpen: MediaContainer.audioModalIsOpen,
  usersVideo: MediaContainer.usersVideo,
  viewParticipantsWebcams: Settings.dataSaving,
}))(UserParticipantsContainer);
