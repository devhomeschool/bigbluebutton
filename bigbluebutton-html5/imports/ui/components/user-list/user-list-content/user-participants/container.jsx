import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import UserListService from '/imports/ui/components/user-list/service';
import UserParticipants from './component';
import { meetingIsBreakout } from '/imports/ui/components/app/service';
import { data } from '/imports/ui/components/media/container';

const UserParticipantsContainer = props => <UserParticipants {...props} />;

export default withTracker(() => ({
  users: UserListService.getUsers(),
  meetingIsBreakout: meetingIsBreakout(),
  disableVideo: data.disableVideo,
  swapLayout: data.swapLayout,
  audioModalIsOpen: data.audioModalIsOpen,
}))(UserParticipantsContainer);
