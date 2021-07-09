import React from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { defineMessages, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import Auth from '/imports/ui/services/auth';
import Users from '/imports/api/users';
import Meetings from '/imports/api/meetings';
import { notify } from '/imports/ui/services/notification';
import CaptionsContainer from '/imports/ui/components/captions/container';
import CaptionsService from '/imports/ui/components/captions/service';
import getFromUserSettings from '/imports/ui/services/users-settings';
import deviceInfo from '/imports/utils/deviceInfo';
import UserInfos from '/imports/api/users-infos';
import { startBandwidthMonitoring, updateNavigatorConnection } from '/imports/ui/services/network-information/index';
import logger from '/imports/startup/client/logger';
import ChatService from '/imports/ui/components/chat/service';

import {
  getFontSize,
  getBreakoutRooms,
  validIOSVersion,
} from './service';

import { withModalMounter } from '../modal/service';

import App from './component';
import NavBarContainer from '../nav-bar/container';
import ActionsBarContainer from '../actions-bar/container';
import MediaContainer from '../media/container';

const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;

const propTypes = {
  navbar: PropTypes.node,
  actionsbar: PropTypes.node,
  media: PropTypes.node,
};

const defaultProps = {
  navbar: <NavBarContainer />,
  actionsbar: <ActionsBarContainer />,
  media: <MediaContainer />,
};

const intlMessages = defineMessages({
  waitingApprovalMessage: {
    id: 'app.guest.waiting',
    description: 'Message while a guest is waiting to be approved',
  },
});

const endMeeting = (code) => {
  Session.set('codeError', code);
  Session.set('isMeetingEnded', true);
};

const AppContainer = (props) => {
  const {
    navbar,
    actionsbar,
    media,
    ...otherProps
  } = props;

  return (
    <App
      navbar={navbar}
      actionsbar={actionsbar}
      media={media}
      {...otherProps}
    />
  );
};

const currentUserEmoji = currentUser => (currentUser ? {
  status: currentUser.emoji,
  changedAt: currentUser.emojiTime,
} : {
  status: 'none',
  changedAt: null,
});

export default injectIntl(withModalMounter(withTracker(({ intl, baseControls }) => {
  const currentUser = Users.findOne({ userId: Auth.userID }, { fields: { approved: 1, emoji: 1 } });
  const currentMeeting = Meetings.findOne({ meetingId: Auth.meetingID },
    { fields: { publishedPoll: 1, voiceProp: 1 } });
  const { publishedPoll, voiceProp } = currentMeeting;

  if (!currentUser.approved) {
    baseControls.updateLoadingState(intl.formatMessage(intlMessages.waitingApprovalMessage));
  }

  // Check if user is removed out of the session
  Users.find({ userId: Auth.userID }, { fields: { connectionId: 1, ejected: 1 } }).observeChanges({
    changed(id, fields) {
      const hasNewConnection = 'connectionId' in fields && (fields.connectionId !== Meteor.connection._lastSessionId);

      if (hasNewConnection) {
        logger.info({
          logCode: 'user_connection_id_changed',
          extraInfo: {
            currentConnectionId: fields.connectionId,
            previousConnectionId: Meteor.connection._lastSessionId,
          },
        }, 'User connectionId changed ');
        endMeeting('401');
      }

      if (fields.ejected) {
        endMeeting('403');
      }
    },
  });

  const UserInfo = UserInfos.find({
    meetingId: Auth.meetingID,
    requesterUserId: Auth.userID,
  }).fetch();

  const userFilter = {
    emoji: 1,
    emojiTime: 1,
    role: 1,
    name: 1,
    userId: 1,
    presenter: 1,
  };

  const users = Users
    .find({
      meetingId: Auth.meetingID,
      connectionStatus: 'online',
    }, userFilter)
    .fetch();

  const amIModerator = users.find(u => u.userId === Auth.userID && u.role === ROLE_MODERATOR);

  const amIPresenter = users.find(u => u.userId === Auth.userID && u.presenter);

  let initialTime = null;

  // get all messages
  let firstMessage = ChatService.getPublicGroupMessages();
  // if there's no message
  if (!firstMessage[0]) {
    // send new message
    ChatService.sendGroupMessage('class start');
    // get first message
    firstMessage = ChatService.getPublicGroupMessages();
    // first message is initialTime
    initialTime = firstMessage[0].timestamp;
  } else {
    // first message is initialTime
    initialTime = firstMessage[0].timestamp;
  }

  return {
    captions: CaptionsService.isCaptionsActive() ? <CaptionsContainer /> : null,
    fontSize: getFontSize(),
    hasBreakoutRooms: getBreakoutRooms().length > 0,
    customStyle: getFromUserSettings('bbb_custom_style', false),
    customStyleUrl: getFromUserSettings('bbb_custom_style_url', false),
    openPanel: Session.get('openPanel'),
    users,
    UserInfo,
    amIModerator,
    amIPresenter,
    notify,
    validIOSVersion,
    isPhone: deviceInfo.type().isPhone,
    isRTL: document.documentElement.getAttribute('dir') === 'rtl',
    meetingMuted: voiceProp.muteOnStart,
    currentUserEmoji: currentUserEmoji(currentUser),
    hasPublishedPoll: publishedPoll,
    startBandwidthMonitoring,
    handleNetworkConnection: () => updateNavigatorConnection(navigator.connection),
    initialTime,
  };
})(AppContainer)));

AppContainer.defaultProps = defaultProps;
AppContainer.propTypes = propTypes;
