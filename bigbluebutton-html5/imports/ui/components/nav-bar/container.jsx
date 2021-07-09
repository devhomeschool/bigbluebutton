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
import ChatService from '/imports/ui/components/chat/service';

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

  const currentUser = Users.findOne({ userId: Auth.userID }, { fields: { role: 1, presenter: 1 } });
  const openPanel = Session.get('openPanel');
  const isExpanded = openPanel !== '';
  const amIModerator = currentUser.role === ROLE_MODERATOR;
  const amIPresenter = currentUser.presenter;
  const hasUnreadMessages = checkUnreadMessages();

  const checkInitialTime = () => {
    let initialTime = null;

    // get all messages
    let firstMessage = ChatService.getPublicGroupMessages();
    console.log(firstMessage);
    // if there's no message
    if (!firstMessage[0]) {
      // send new message
      ChatService.sendGroupMessage('class start');
      // get first message
      firstMessage = ChatService.getPublicGroupMessages();
      console.log(firstMessage);
      // first message is initialTime
      initialTime = firstMessage[0].timestamp;
    } else {
      // first message is initialTime
      initialTime = firstMessage[0].timestamp;
    }
    return initialTime;
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
