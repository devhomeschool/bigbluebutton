import React from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { Session } from 'meteor/session';
import Meetings from '/imports/api/meetings';
import Users from '/imports/api/users';
import Auth from '/imports/ui/services/auth';
import getFromUserSettings from '/imports/ui/services/users-settings';
import UserListService from '../user-list/service';
import Service from './service';
import NavBar from './component';
import { meetingIsBreakout } from '/imports/ui/components/app/service';

const PUBLIC_CONFIG = Meteor.settings.public;
const ROLE_MODERATOR = PUBLIC_CONFIG.user.role_moderator;
const NavBarContainer = ({ children, ...props }) => (
  <NavBar {...props}>
    {children}
  </NavBar>
);

export default withTracker(() => {
  const CLIENT_TITLE = getFromUserSettings('bbb_client_title', PUBLIC_CONFIG.app.clientTitle);

  let meetingTitle;
  const meetingId = Auth.meetingID;
  const meetingObject = Meetings.findOne({
    meetingId,
  }, { fields: { 'meetingProp.name': 1, 'breakoutProps.sequence': 1 } });

  if (meetingObject != null) {
    meetingTitle = meetingObject.meetingProp.name;
    let titleString = `${CLIENT_TITLE} - ${meetingTitle}`;
    if (meetingObject.breakoutProps) {
      const breakoutNum = meetingObject.breakoutProps.sequence;
      if (breakoutNum > 0) {
        titleString = `${breakoutNum} - ${titleString}`;
      }
    }
    document.title = titleString;
  }

  const checkUnreadMessages = () => {
    const activeChats = UserListService.getActiveChats();
    const hasUnreadMessages = activeChats
      .filter(chat => chat.userId !== Session.get('idChatOpen'))
      .some(chat => chat.unreadCounter > 0);
    return hasUnreadMessages;
  };

  const { connectRecordingObserver, processOutsideToggleRecording } = Service;

  const currentUser = Users.findOne(
    { userId: Auth.userID },
    { fields: { _id: 1, role: 1, presenter: 1 } },
  );
  const openPanel = Session.get('openPanel');
  const isExpanded = openPanel !== '';
  const amIModerator = currentUser.role === ROLE_MODERATOR;
  const amIPresenter = currentUser.presenter;
  const hasUnreadMessages = checkUnreadMessages();

  const checkInitialTime = () => {
    let presentersAndModerators = Users
      .find(
        { meetingId: Auth.meetingID, connectionStatus: 'online' },
        {
          presenter: 1, role: 1, name: 1, userId: 1, loginTime: 1, initialTime: 1,
        },
      ).fetch();

    const initialTime = presentersAndModerators.find(u => u.initialTime);

    // If theres initialTime, currentUser creates initialTime key for itself and updates mongo
    if (initialTime) {
      Users.update({ _id: currentUser._id }, { $set: { initialTime } }).fetch();
      return initialTime;
    }

    // If theres no initialTime, filter moderators and sort by users loginTime
    presentersAndModerators = presentersAndModerators
      .filter(u => u.role === ROLE_MODERATOR || u.presenter);

    const firstModerator = presentersAndModerators
      .sort((a, b) => {
        if (a.loginTime < b.loginTime) return -1;
        if (a.loginTime > b.loginTime) return 1;
        return 0;
      })[0].loginTime;

    // The first loginTime is updated to the user as initialTime
    Users.update({ _id: currentUser._id }, { $set: { initialTime: firstModerator } }).fetch();

    return firstModerator;
  };

  return {
    checkInitialTime,
    amIModerator,
    amIPresenter,
    isExpanded,
    currentUserId: Auth.userID,
    processOutsideToggleRecording,
    connectRecordingObserver,
    meetingId,
    presentationTitle: meetingTitle,
    hasUnreadMessages,
    users: UserListService.getUsers(),
    meetingIsBreakout: meetingIsBreakout(),
    setEmojiStatus: UserListService.setEmojiStatus,
  };
})(NavBarContainer);
