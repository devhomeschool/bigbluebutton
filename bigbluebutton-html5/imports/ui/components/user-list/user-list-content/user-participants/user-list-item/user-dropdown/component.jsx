import React, { PureComponent, Fragment } from 'react';
import { defineMessages } from 'react-intl';
import PropTypes from 'prop-types';
import { findDOMNode } from 'react-dom';
import UserAvatar from '/imports/ui/components/user-avatar/component';
import Icon from '/imports/ui/components/icon/component';
import Dropdown from '/imports/ui/components/dropdown/component';
import DropdownTrigger from '/imports/ui/components/dropdown/trigger/component';
import DropdownContent from '/imports/ui/components/dropdown/content/component';
import DropdownList from '/imports/ui/components/dropdown/list/component';
import DropdownListItem from '/imports/ui/components/dropdown/list/item/component';
import lockContextContainer from '/imports/ui/components/lock-viewers/context/container';
import { withModalMounter } from '/imports/ui/components/modal/service';
import RemoveUserModal from '/imports/ui/components/modal/remove-user/component';
import _ from 'lodash';
import { Session } from 'meteor/session';
import SocketContext from '/imports/ui/components/context/socket-context';
import {
  ExclamationIcon,
  UserRemoveIcon,
  PencilIcon,
  PencilAltIcon
} from '@heroicons/react/solid';
import { styles } from './styles';
import UserName from '../user-name/component';
import UserIcons from '../user-icons/component';
import VideoProviderContainer from '/imports/ui/components/video-provider/container';

const messages = defineMessages({
  presenter: {
    id: 'app.userList.presenter',
    description: 'Text for identifying presenter user',
  },
  you: {
    id: 'app.userList.you',
    description: 'Text for identifying your user',
  },
  locked: {
    id: 'app.userList.locked',
    description: 'Text for identifying locked user',
  },
  guest: {
    id: 'app.userList.guest',
    description: 'Text for identifying guest user',
  },
  menuTitleContext: {
    id: 'app.userList.menuTitleContext',
    description: 'adds context to userListItem menu title',
  },
  userAriaLabel: {
    id: 'app.userList.userAriaLabel',
    description: 'aria label for each user in the userlist',
  },
  statusTriggerLabel: {
    id: 'app.actionsBar.emojiMenu.statusTriggerLabel',
    description: 'label for option to show emoji menu',
  },
  backTriggerLabel: {
    id: 'app.audio.backLabel',
    description: 'label for option to hide emoji menu',
  },
  ChatLabel: {
    id: 'app.userList.menu.chat.label',
    description: 'Save the changes and close the settings menu',
  },
  ClearStatusLabel: {
    id: 'app.userList.menu.clearStatus.label',
    description: 'Clear the emoji status of this user',
  },
  takePresenterLabel: {
    id: 'app.actionsBar.actionsDropdown.takePresenter',
    description: 'Set this user to be the presenter in this meeting',
  },
  makePresenterLabel: {
    id: 'app.userList.menu.makePresenter.label',
    description: 'label to make another user presenter',
  },
  giveWhiteboardAccess: {
    id: 'app.userList.menu.giveWhiteboardAccess.label',
    description: 'label to give user whiteboard access',
  },
  removeWhiteboardAccess: {
    id: 'app.userList.menu.removeWhiteboardAccess.label',
    description: 'label to remove user whiteboard access',
  },
  RemoveUserLabel: {
    id: 'app.userList.menu.removeUser.label',
    description: 'Forcefully remove this user from the meeting',
  },
  MuteUserAudioLabel: {
    id: 'app.userList.menu.muteUserAudio.label',
    description: 'Forcefully mute this user',
  },
  UnmuteUserAudioLabel: {
    id: 'app.userList.menu.unmuteUserAudio.label',
    description: 'Forcefully unmute this user',
  },
  PromoteUserLabel: {
    id: 'app.userList.menu.promoteUser.label',
    description: 'Forcefully promote this viewer to a moderator',
  },
  DemoteUserLabel: {
    id: 'app.userList.menu.demoteUser.label',
    description: 'Forcefully demote this moderator to a viewer',
  },
  UnlockUserLabel: {
    id: 'app.userList.menu.unlockUser.label',
    description: 'Unlock individual user',
  },
  LockUserLabel: {
    id: 'app.userList.menu.lockUser.label',
    description: 'Lock a unlocked user',
  },
  DirectoryLookupLabel: {
    id: 'app.userList.menu.directoryLookup.label',
    description: 'Directory lookup',
  },
  yesLabel: {
    id: 'app.endMeeting.yesLabel',
    description: 'confirm button label',
  },
  noLabel: {
    id: 'app.endMeeting.noLabel',
    description: 'cancel confirm button label',
  },
  removeConfirmTitle: {
    id: 'app.userList.menu.removeConfirmation.label',
    description: 'title for remove user confirmation modal',
  },
  removeConfirmDesc: {
    id: 'app.userlist.menu.removeConfirmation.desc',
    description: 'description for remove user confirmation',
  },
});

const propTypes = {
  compact: PropTypes.bool.isRequired,
  user: PropTypes.shape({}).isRequired,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  normalizeEmojiName: PropTypes.func.isRequired,
  isThisMeetingLocked: PropTypes.bool.isRequired,
  getScrollContainerRef: PropTypes.func.isRequired,
  toggleUserLock: PropTypes.func.isRequired,
  disableVideo: PropTypes.bool,
  audioModalIsOpen: PropTypes.bool,
  streams: PropTypes.arrayOf(PropTypes.object),
  showVideo: PropTypes.bool,
};
const defaultProps = {
  disableVideo: false,
  audioModalIsOpen: false,
  showVideo: false,
  streams: [],
};
const CHAT_ENABLED = Meteor.settings.public.chat.enabled;
const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;

class UserDropdown extends PureComponent {
  /**
   * Return true if the content fit on the screen, false otherwise.
   *
   * @param {number} contentOffSetTop
   * @param {number} contentOffsetHeight
   * @return True if the content fit on the screen, false otherwise.
   */
  static checkIfDropdownIsVisible(contentOffSetTop, contentOffsetHeight) {
    return contentOffSetTop + contentOffsetHeight < window.innerHeight;
  }

  static contextType = SocketContext;

  constructor(props) {
    super(props);

    this.state = {
      isActionsOpen: false,
      dropdownOffset: 0,
      dropdownDirection: 'top',
      dropdownVisible: false,
      showNestedOptions: false,
      isWarning: false,
    };

    this.handleScroll = this.handleScroll.bind(this);
    this.onActionsShow = this.onActionsShow.bind(this);
    this.onActionsHide = this.onActionsHide.bind(this);
    this.getDropdownMenuParent = this.getDropdownMenuParent.bind(this);
    this.renderUserAvatar = this.renderUserAvatar.bind(this);
    this.resetMenuState = this.resetMenuState.bind(this);
    this.makeDropdownItem = this.makeDropdownItem.bind(this);
    this.avatar = null;
  }

  componentWillMount() {
    const { user } = this.props;
    const { socket } = this.context;

    socket.on('user', (data) => {
      if (data.action === 'warning' && user.userId === data.userId) {
        this.setState(prevState => ({ isWarning: !prevState.isWarning }));
      }
    });

    this.title = _.uniqueId('dropdown-title-');
    this.seperator = _.uniqueId('action-separator-');
  }

  componentDidMount() {
    fetch('https://gorest.co.in/public/v1/posts')
      .then((res) => {
        if (res.status !== 200) {
          throw new Error('Failed');
        }
        return res.json();
      })
      .then(data => console.log(data))
      .catch(err => console.error(err));

    setTimeout(() => {
      console.log(this.avatar.offsetWidth);
    }, 1000);
  }

  componentDidUpdate() {
    this.checkDropdownDirection();
  }

  createWarningSignal = async () => {
    const { user } = this.props;

    const response = await fetch(
      "https://bbb-socket-c62f833b8b3a.herokuapp.com/user/status/warning",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.userId,
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Algo deu errado na chamada da api!');
    }
  };

  onActionsShow() {
    Session.set('dropdownOpen', true);
    const { getScrollContainerRef } = this.props;
    const dropdown = this.getDropdownMenuParent();
    const scrollContainer = getScrollContainerRef();

    if (dropdown && scrollContainer) {
      const dropdownTrigger = dropdown.children[0];
      const list = findDOMNode(this.list);
      const children = [].slice.call(list.children);
      children
        .find(child => child.getAttribute('role') === 'menuitem')
        .focus();

      this.setState({
        isActionsOpen: true,
        dropdownVisible: false,
        dropdownOffset: dropdownTrigger.offsetTop - scrollContainer.scrollTop,
        dropdownDirection: 'top',
      });

      scrollContainer.addEventListener('scroll', this.handleScroll, false);
    }
  }

  onActionsHide(callback) {
    const { getScrollContainerRef } = this.props;

    this.setState({
      isActionsOpen: false,
      dropdownVisible: false,
      showNestedOptions: false,
    });

    const scrollContainer = getScrollContainerRef();
    scrollContainer.removeEventListener('scroll', this.handleScroll, false);

    if (callback) {
      return callback;
    }

    return Session.set('dropdownOpen', false);
  }

  getUsersActions() {
    const {
      intl,
      currentUser,
      user,
      voiceUser,
      getAvailableActions,
      getGroupChatPrivate,
      getEmojiList,
      setEmojiStatus,
      assignPresenter,
      removeUser,
      toggleVoice,
      changeRole,
      lockSettingsProps,
      hasPrivateChatBetweenUsers,
      toggleUserLock,
      requestUserInformation,
      isMeteorConnected,
      userLocks,
      isMe,
      meetingIsBreakout,
      mountModal,
      changeWhiteboardMode,
    } = this.props;

    const amIModerator = currentUser.role === ROLE_MODERATOR;
    const actionPermissions = getAvailableActions(
      amIModerator,
      meetingIsBreakout,
      user,
      voiceUser,
    );
    const actions = [];
    const statusActions = [];

    const {
      allowedToChatPrivately,
      allowedToMuteAudio,
      allowedToUnmuteAudio,
      allowedToResetStatus,
      allowedToRemove,
      allowedToSetPresenter,
      allowedToPromote,
      allowedToDemote,
      allowedToChangeStatus,
      allowedToChangeUserLockStatus,
      // allowedToChangeWhiteboardAccess,
    } = actionPermissions;

    const { disablePrivateChat } = lockSettingsProps;

    const enablePrivateChat = currentUser.role === ROLE_MODERATOR
      ? allowedToChatPrivately
      : allowedToChatPrivately
          && (!(currentUser.locked && disablePrivateChat)
            || hasPrivateChatBetweenUsers(currentUser.userId, user.userId)
            || user.role === ROLE_MODERATOR)
          && isMeteorConnected;

    const { allowUserLookup } = Meteor.settings.public.app;

    if (allowedToResetStatus && user.emoji !== 'none' && isMeteorConnected) {
      statusActions.push(
        <li
          id="clearStatus"
          onClick={() => this.onActionsHide(setEmojiStatus(user.userId, 'none'))}
          className={styles.statusItem}
          onKeyDown={() => 'this.handle'}
          role="menuitem"
        >
          <Icon iconName="clear_status" key="clear_status" className={styles.itemIcon} />
          <span key="label">{intl.formatMessage(messages.ClearStatusLabel)}</span>
        </li>,
      );
    }

    if (allowedToChangeStatus && isMeteorConnected) {
      const statuses = Object.keys(getEmojiList);
      statuses.map(status => statusActions.push(
        <li
          id={status}
          onClick={() => {
            setEmojiStatus(user.userId, status);
            this.resetMenuState();
          }}
          onKeyDown={() => 'a'}
          className={styles.statusItem}
          role="menuitem"
        >
          <Icon iconName={getEmojiList[status]} key="icon" className={styles.itemIcon} />
          <span key="label">{intl.formatMessage({ id: `app.actionsBar.emojiMenu.${status}Label` })}</span>
        </li>,
      ));
    }

    const showChatOption = CHAT_ENABLED
      && enablePrivateChat
      && user.clientType !== 'dial-in-user'
      && !meetingIsBreakout
      && isMeteorConnected;

    if (showChatOption) {
      actions.push(
        this.makeDropdownItem(
          'activeChat',
          intl.formatMessage(messages.ChatLabel),
          () => {
            getGroupChatPrivate(currentUser.userId, user);
            Session.set('openPanel', 'chat');
            Session.set('idChatOpen', user.userId);
          },
          'chat',
        ),
      );
    }

    if (allowedToMuteAudio && isMeteorConnected && !meetingIsBreakout) {
      actions.push(
        this.makeDropdownItem(
          'mute',
          intl.formatMessage(messages.MuteUserAudioLabel),
          () => this.onActionsHide(toggleVoice(user.userId)),
          'mute',
        ),
      );
    }

    if (
      allowedToUnmuteAudio
      && !userLocks.userMic
      && isMeteorConnected
      && !meetingIsBreakout
    ) {
      actions.push(
        this.makeDropdownItem(
          'unmute',
          intl.formatMessage(messages.UnmuteUserAudioLabel),
          () => this.onActionsHide(toggleVoice(user.userId)),
          'unmute',
        ),
      );
    }

    if (allowedToRemove && !user.presenter && isMeteorConnected) {
      let label = intl.formatMessage(messages.giveWhiteboardAccess);

      if (user.whiteboardAccess) {
        label = intl.formatMessage(messages.removeWhiteboardAccess);
      }

      actions.push(
        this.makeDropdownItem(
          'giveIndividualAccess',
          label,
          () => changeWhiteboardMode(!user.whiteboardAccess, user.userId),
          'pen_tool',
        ),
      );
    }

    if (allowedToSetPresenter && isMeteorConnected) {
      actions.push(
        this.makeDropdownItem(
          'setPresenter',
          isMe(user.userId)
            ? intl.formatMessage(messages.takePresenterLabel)
            : intl.formatMessage(messages.makePresenterLabel),
          () => {
            this.onActionsHide(assignPresenter(user.userId));
          },
          'presentation',
        ),
      );
    }

    if (allowedToPromote && !user.guest && isMeteorConnected) {
      actions.push(
        this.makeDropdownItem(
          'promote',
          intl.formatMessage(messages.PromoteUserLabel),
          () => this.onActionsHide(changeRole(user.userId, 'MODERATOR')),
          'promote',
        ),
      );
    }

    if (allowedToDemote && !user.guest && isMeteorConnected) {
      actions.push(
        this.makeDropdownItem(
          'demote',
          intl.formatMessage(messages.DemoteUserLabel),
          () => this.onActionsHide(changeRole(user.userId, 'VIEWER')),
          'user',
        ),
      );
    }

    if (allowedToChangeUserLockStatus && isMeteorConnected) {
      const userLocked = user.locked && user.role !== ROLE_MODERATOR;
      actions.push(
        this.makeDropdownItem(
          'unlockUser',
          userLocked
            ? intl.formatMessage(messages.UnlockUserLabel, { 0: user.name })
            : intl.formatMessage(messages.LockUserLabel, { 0: user.name }),
          () => this.onActionsHide(toggleUserLock(user.userId, !userLocked)),
          userLocked ? 'unlock' : 'lock',
        ),
      );
    }

    if (allowUserLookup && isMeteorConnected) {
      actions.push(
        this.makeDropdownItem(
          'directoryLookup',
          intl.formatMessage(messages.DirectoryLookupLabel),
          () => this.onActionsHide(requestUserInformation(user.extId)),
          'user',
        ),
      );
    }

    if (allowedToRemove && isMeteorConnected) {
      actions.push(
        this.makeDropdownItem(
          'remove',
          intl.formatMessage(messages.RemoveUserLabel, { 0: user.name }),
          () => this.onActionsHide(
            mountModal(
              <RemoveUserModal
                intl={intl}
                user={user}
                onConfirm={removeUser}
              />,
            ),
          ),
          'circle_close',
        ),
      );
    }

    return [actions, statusActions];
  }

  getDropdownMenuParent() {
    return findDOMNode(this.dropdown);
  }

  makeDropdownItem(key, label, onClick, icon = null, iconRight = null) {
    const { getEmoji } = this.props;
    return (
      <DropdownListItem
        {...{
          key,
          label,
          onClick,
          icon,
          iconRight,
        }}
        className={key === getEmoji ? styles.emojiSelected : null}
        data-test={key}
      />
    );
  }

  resetMenuState() {
    return this.setState({
      isActionsOpen: false,
      dropdownOffset: 0,
      dropdownDirection: 'top',
      dropdownVisible: false,
      showNestedOptions: false,
    });
  }

  handleScroll() {
    this.setState({
      isActionsOpen: false,
      showNestedOptions: false,
    });
  }

  /**
   * Check if the dropdown is visible, if so, check if should be draw on top or bottom direction.
   */
  checkDropdownDirection() {
    const { getScrollContainerRef } = this.props;
    if (this.isDropdownActivedByUser()) {
      const dropdown = this.getDropdownMenuParent();
      const dropdownTrigger = dropdown.children[0];
      const dropdownContent = dropdown.children[1];

      const scrollContainer = getScrollContainerRef();

      const nextState = {
        dropdownVisible: true,
      };

      const isDropdownVisible = UserDropdown.checkIfDropdownIsVisible(
        dropdownContent.offsetTop,
        dropdownContent.offsetHeight,
      );

      if (!isDropdownVisible) {
        const { offsetTop, offsetHeight } = dropdownTrigger;
        const offsetPageTop = offsetTop + offsetHeight - scrollContainer.scrollTop;

        nextState.dropdownOffset = window.innerHeight - offsetPageTop;
        nextState.dropdownDirection = 'bottom';
      }

      this.setState(nextState);
    }
  }

  /**
   * Check if the dropdown is visible and is opened by the user
   *
   * @return True if is visible and opened by the user
   */
  isDropdownActivedByUser() {
    const { isActionsOpen, dropdownVisible } = this.state;

    return isActionsOpen && !dropdownVisible;
  }

  renderUserAvatar() {
    const {
      user,
      voiceUser,
      streams,
      showVideo,
      disableVideo,
      audioModalIsOpen,
      swapLayout,
      // amIModerator,
      // amIPresenter,
      // normalizeEmojiName,
      userInBreakout,
      breakoutSequence,
      meetingIsBreakout,
    } = this.props;

    const { isWarning } = this.state;

    const { clientType } = user;
    const isVoiceOnly = clientType === 'dial-in-user';

    const findStream = !streams.length
      ? null
      : streams.find(stream => stream.userId === user.userId);

    const iconVoiceOnlyUser = <Icon iconName="audio_on" />;
    const userIcon = isVoiceOnly && iconVoiceOnlyUser;
    const icons = userInBreakout && !meetingIsBreakout ? breakoutSequence : userIcon;

    return (
      <UserAvatar
        moderator={user.role === ROLE_MODERATOR}
        presenter={user.presenter}
        talking={voiceUser.isTalking}
        muted={voiceUser.isMuted}
        listenOnly={voiceUser.isListenOnly}
        voice={voiceUser.isVoiceUser}
        noVoice={!voiceUser.isVoiceUser}
        height={!this.avatar ? 140 : this.avatar.offsetWidth * 0.75}
        whiteboardAccess={user.whiteboardAccess}
        isWarning={isWarning}
      >
        {!disableVideo && !audioModalIsOpen && findStream && showVideo ? (
          <VideoProviderContainer
            swapLayout={swapLayout}
            userId={user.userId}
            findStream={findStream}
            role={user.role}
            presenter={user.presenter}
          />
        ) : (
          user.name.toLowerCase().slice(0, 2)
        )}
        {icons}
      </UserAvatar>
    );
  }

  render() {
    const {
      compact,
      currentUser,
      user,
      intl,
      isThisMeetingLocked,
      isMe,
      normalizeEmojiName,
      getAvailableActions,
      meetingIsBreakout,
      voiceUser,
      mountModal,
      removeUser,
      isMeteorConnected,
      changeWhiteboardMode,
    } = this.props;

    const {
      isActionsOpen,
      dropdownVisible,
      dropdownDirection,
      dropdownOffset,
      showNestedOptions,
    } = this.state;

    const [actions, statusActions] = this.getUsersActions();

    const userItemContentsStyle = {};

    userItemContentsStyle[styles.dropdown] = true;
    userItemContentsStyle[styles.userListItem] = !isActionsOpen;
    userItemContentsStyle[styles.usertListItemWithMenu] = isActionsOpen;

    const you = isMe(user.userId) ? intl.formatMessage(messages.you) : '';

    const presenter = user.presenter
      ? intl.formatMessage(messages.presenter)
      : '';

    const userAriaLabel = intl.formatMessage(messages.userAriaLabel, {
      0: user.name,
      1: presenter,
      2: you,
      3: user.emoji,
    });

    const contents = (
      <div
        data-test={isMe(user.userId) ? 'userListItemCurrent' : null}
        className={!actions.length ? styles.userListItem : null}
      >
        <div className={styles.userItemContents}>
          <div
            className={styles.userAvatar}
            ref={(node) => {
              this.avatar = node;
            }}
          >
            {this.renderUserAvatar()}
          </div>
        </div>
      </div>
    );

    const amIModerator = currentUser.role === ROLE_MODERATOR;
    const actionPermissions = getAvailableActions(
      amIModerator,
      meetingIsBreakout,
      user,
      voiceUser,
    );

    const { allowedToRemove } = actionPermissions;

    if (!actions.length) {
      return (
        <Fragment>
          {contents}
          <UserName
            {...{
              user,
              compact,
              intl,
              isThisMeetingLocked,
              userAriaLabel,
              isActionsOpen,
              isMe,
              normalizeEmojiName,
              statusActions,
            }}
          />
          <UserIcons
            {...{
              user,
              amIModerator: currentUser.role === ROLE_MODERATOR,
            }}
          />
        </Fragment>
      );
    }

    return (
      <Fragment>
        {amIModerator && (
          <div className={styles.buttonContainer}>
            {!isMe(user.userId) && (
              <button
                type="button"
                className={styles.buttonWarning}
                onClick={this.createWarningSignal}
              >
                <ExclamationIcon className={styles.icon} />
              </button>
            )}

            {allowedToRemove && (
              <button
                type="button"
                className={styles.buttonRemove}
                onClick={() => mountModal(
                  <RemoveUserModal
                    intl={intl}
                    user={user}
                    onConfirm={removeUser}
                  />,
                )
                }
              >
                <UserRemoveIcon className={styles.icon} />
              </button>
            )}

            {allowedToRemove && !user.presenter && isMeteorConnected && (
              <button
                type="button"
                className={styles.buttonPromote}
                onClick={() => changeWhiteboardMode(!user.whiteboardAccess, user.userId)
                }
              >
                <PencilIcon className={styles.icon} />
              </button>
            )}

            {user.presenter && (
              <button
                type='button'
                className={styles.btnPresenter}
                onClick={() => {}}
              >
                <PencilAltIcon className={styles.preIcon} />
              </button>
            )}
          </div>
        )}
        <Dropdown
          ref={(ref) => {
            this.dropdown = ref;
          }}
          keepOpen={isActionsOpen || showNestedOptions}
          onShow={this.onActionsShow}
          onHide={this.onActionsHide}
          className={userItemContentsStyle}
          autoFocus={false}
          aria-haspopup="true"
          aria-live="assertive"
          aria-relevant="additions"
        >
          <DropdownTrigger>{contents}</DropdownTrigger>
          <DropdownContent
            style={{
              visibility: dropdownVisible ? 'visible' : 'hidden',
              [dropdownDirection]: `${dropdownOffset}px`,
            }}
            className={styles.dropdownContent}
            placement={`right ${dropdownDirection}`}
          >
            <DropdownList
              ref={(ref) => {
                this.list = ref;
              }}
              getDropdownMenuParent={this.getDropdownMenuParent}
              onActionsHide={this.onActionsHide}
            >
              {actions}
            </DropdownList>
          </DropdownContent>
        </Dropdown>
        <UserName
          {...{
            user,
            compact,
            intl,
            isThisMeetingLocked,
            userAriaLabel,
            isActionsOpen,
            isMe,
            normalizeEmojiName,
            statusActions,
          }}
        />
        <UserIcons
          {...{
            user,
            amIModerator: currentUser.role === ROLE_MODERATOR,
          }}
        />
      </Fragment>
    );
  }
}

UserDropdown.propTypes = propTypes;
UserDropdown.defaultProps = defaultProps;
export default withModalMounter(lockContextContainer(UserDropdown));
