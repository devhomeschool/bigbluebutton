import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import _ from 'lodash';
import { withModalMounter } from '/imports/ui/components/modal/service';
import Button from '/imports/ui/components/button/component';
import cx from 'classnames';
import NavBarStyles from '/imports/ui/components/nav-bar/styles';
import LockViewersContainer from '/imports/ui/components/lock-viewers/container';
import BreakoutRoom from '/imports/ui/components/actions-bar/create-breakout-room/container';
import CaptionsService from '/imports/ui/components/captions/service';
import CaptionsWriterMenu from '/imports/ui/components/captions/writer-menu/container';
import { styles } from './styles';
import { getUserNamesLink } from '/imports/ui/components/user-list/service';
import Dropdown from '/imports/ui/components/dropdown/component';
import DropdownTrigger from '/imports/ui/components/dropdown/trigger/component';
import DropdownContent from '/imports/ui/components/dropdown/content/component';
import DropdownList from '/imports/ui/components/dropdown/list/component';
import DropdownListItem from '/imports/ui/components/dropdown/list/item/component';

const propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  isMeetingMuted: PropTypes.bool.isRequired,
  toggleMuteAllUsers: PropTypes.func.isRequired,
  toggleMuteAllUsersExceptPresenter: PropTypes.func.isRequired,
  toggleStatus: PropTypes.func.isRequired,
  mountModal: PropTypes.func.isRequired,
  users: PropTypes.arrayOf(Object).isRequired,
  meetingIsBreakout: PropTypes.bool.isRequired,
  hasBreakoutRoom: PropTypes.bool.isRequired,
  isBreakoutEnabled: PropTypes.bool.isRequired,
  isBreakoutRecordable: PropTypes.bool.isRequired,
};

const intlMessages = defineMessages({
  optionsLabel: {
    id: 'app.userList.userOptions.manageUsersLabel',
    description: 'Manage user label',
  },
  clearAllLabel: {
    id: 'app.userList.userOptions.clearAllLabel',
    description: 'Clear all label',
  },
  clearAllDesc: {
    id: 'app.userList.userOptions.clearAllDesc',
    description: 'Clear all description',
  },
  muteAllLabel: {
    id: 'app.userList.userOptions.muteAllLabel',
    description: 'Mute all label',
  },
  muteAllDesc: {
    id: 'app.userList.userOptions.muteAllDesc',
    description: 'Mute all description',
  },
  unmuteAllLabel: {
    id: 'app.userList.userOptions.unmuteAllLabel',
    description: 'Unmute all label',
  },
  unmuteAllDesc: {
    id: 'app.userList.userOptions.unmuteAllDesc',
    description: 'Unmute all desc',
  },
  lockViewersLabel: {
    id: 'app.userList.userOptions.lockViewersLabel',
    description: 'Lock viewers label',
  },
  lockViewersDesc: {
    id: 'app.userList.userOptions.lockViewersDesc',
    description: 'Lock viewers description',
  },
  muteAllExceptPresenterLabel: {
    id: 'app.userList.userOptions.muteAllExceptPresenterLabel',
    description: 'Mute all except presenter label',
  },
  muteAllExceptPresenterDesc: {
    id: 'app.userList.userOptions.muteAllExceptPresenterDesc',
    description: 'Mute all except presenter description',
  },
  createBreakoutRoom: {
    id: 'app.actionsBar.actionsDropdown.createBreakoutRoom',
    description: 'Create breakout room option',
  },
  createBreakoutRoomDesc: {
    id: 'app.actionsBar.actionsDropdown.createBreakoutRoomDesc',
    description: 'Description of create breakout room option',
  },
  invitationItem: {
    id: 'app.invitation.title',
    description: 'invitation to breakout title',
  },
  saveUserNames: {
    id: 'app.actionsBar.actionsDropdown.saveUserNames',
    description: 'Save user name feature description',
  },
  captionsLabel: {
    id: 'app.actionsBar.actionsDropdown.captionsLabel',
    description: 'Captions menu toggle label',
  },
  captionsDesc: {
    id: 'app.actionsBar.actionsDropdown.captionsDesc',
    description: 'Captions menu toggle description',
  },
  savedNamesListTitle: {
    id: 'app.userList.userOptions.savedNames.title',
    description: '',
  },
  sortedFirstNameHeading: {
    id: 'app.userList.userOptions.sortedFirstName.heading',
    description: '',
  },
  sortedLastNameHeading: {
    id: 'app.userList.userOptions.sortedLastName.heading',
    description: '',
  },
});

class UserOptions extends PureComponent {
  constructor(props) {
    super(props);

    this.clearStatusId = _.uniqueId('list-item-');
    this.muteId = _.uniqueId('list-item-');
    this.muteAllId = _.uniqueId('list-item-');
    this.lockId = _.uniqueId('list-item-');
    this.createBreakoutId = _.uniqueId('list-item-');
    this.saveUsersNameId = _.uniqueId('list-item-');
    this.captionsId = _.uniqueId('list-item-');

    this.handleCreateBreakoutRoomClick = this.handleCreateBreakoutRoomClick.bind(this);
    this.handleCaptionsClick = this.handleCaptionsClick.bind(this);
    this.onCreateBreakouts = this.onCreateBreakouts.bind(this);
    this.onInvitationUsers = this.onInvitationUsers.bind(this);
    this.renderMenuItems = this.renderMenuItems.bind(this);
    this.onSaveUserNames = this.onSaveUserNames.bind(this);
  }

  onSaveUserNames() {
    const { intl, meetingName } = this.props;
    const date = new Date();
    getUserNamesLink(
      intl.formatMessage(intlMessages.savedNamesListTitle, {
        0: meetingName,
        1: `${date.toLocaleDateString(
          document.documentElement.lang,
        )}:${date.toLocaleTimeString(document.documentElement.lang)}`,
      }),
      intl.formatMessage(intlMessages.sortedFirstNameHeading),
      intl.formatMessage(intlMessages.sortedLastNameHeading),
    ).dispatchEvent(
      new MouseEvent('click', { bubbles: true, cancelable: true, view: window }),
    );
  }

  onCreateBreakouts() {
    return this.handleCreateBreakoutRoomClick(false);
  }

  onInvitationUsers() {
    return this.handleCreateBreakoutRoomClick(true);
  }

  handleCreateBreakoutRoomClick(isInvitation) {
    const { mountModal, isBreakoutRecordable } = this.props;

    return mountModal(
      <BreakoutRoom
        {...{
          isBreakoutRecordable,
          isInvitation,
        }}
      />,
    );
  }

  handleCaptionsClick() {
    const { mountModal } = this.props;
    mountModal(<CaptionsWriterMenu />);
  }

  renderMenuItems(contentWidth) {
    const {
      intl,
      isMeetingMuted,
      mountModal,
      toggleStatus,
      toggleMuteAllUsers,
      toggleMuteAllUsersExceptPresenter,
      meetingIsBreakout,
      hasBreakoutRoom,
      isBreakoutEnabled,
      getUsersNotAssigned,
      amIModerator,
      users,
      isMeteorConnected,
    } = this.props;

    const canCreateBreakout = amIModerator
      && !meetingIsBreakout
      && !hasBreakoutRoom
      && isBreakoutEnabled;

    const canInviteUsers = amIModerator
      && !meetingIsBreakout
      && hasBreakoutRoom
      && getUsersNotAssigned(users).length;

    const toggleBtnClasses = {};
    toggleBtnClasses[NavBarStyles.btn] = true;

    this.menuItems = _.compact([
      (isMeteorConnected ? (
        <Button
          key={this.clearStatusId}
          icon="clear_status"
          label={intl.formatMessage(intlMessages.clearAllLabel)}
          description={intl.formatMessage(intlMessages.clearAllDesc)}
          onClick={toggleStatus}
          ghost
          circle
          hideLabel
          className={cx(toggleBtnClasses)}
        />) : null
      ),
      (!meetingIsBreakout && isMeteorConnected ? (
        <Button
          key={this.muteAllId}
          icon={isMeetingMuted ? 'unmute' : 'mute'}
          label={intl.formatMessage(intlMessages[isMeetingMuted ? 'unmuteAllLabel' : 'muteAllLabel'])}
          description={intl.formatMessage(intlMessages[isMeetingMuted ? 'unmuteAllDesc' : 'muteAllDesc'])}
          onClick={toggleMuteAllUsers}
          ghost
          circle
          hideLabel
          className={cx(toggleBtnClasses)}
        />) : null
      ),
      (!meetingIsBreakout && !isMeetingMuted && isMeteorConnected ? (
        <Button
          key={this.muteId}
          icon="mute"
          label={intl.formatMessage(intlMessages.muteAllExceptPresenterLabel)}
          description={intl.formatMessage(intlMessages.muteAllExceptPresenterDesc)}
          onClick={toggleMuteAllUsersExceptPresenter}
          ghost
          circle
          hideLabel
          className={cx(toggleBtnClasses)}
        />) : null
      ),
      (amIModerator
        ? (
          <Button
            icon="download"
            label={intl.formatMessage(intlMessages.saveUserNames)}
            key={this.saveUsersNameId}
            onClick={this.onSaveUserNames}
            ghost
            circle
            hideLabel
            className={cx(toggleBtnClasses)}
          />)
        : null
      ),
      (!meetingIsBreakout && isMeteorConnected ? (
        <Button
          key={this.lockId}
          icon="lock"
          label={intl.formatMessage(intlMessages.lockViewersLabel)}
          description={intl.formatMessage(intlMessages.lockViewersDesc)}
          onClick={() => mountModal(<LockViewersContainer />)}
          ghost
          circle
          hideLabel
          className={cx(toggleBtnClasses)}
        />) : null
      ),
      (canCreateBreakout && isMeteorConnected ? (
        <Button
          key={this.createBreakoutId}
          icon="rooms"
          label={intl.formatMessage(intlMessages.createBreakoutRoom)}
          description={intl.formatMessage(intlMessages.createBreakoutRoomDesc)}
          onClick={this.onCreateBreakouts}
          ghost
          circle
          hideLabel
          className={cx(toggleBtnClasses)}
        />) : null
      ),
      (canInviteUsers && isMeteorConnected ? (
        <Button
          icon="rooms"
          label={intl.formatMessage(intlMessages.invitationItem)}
          key={this.createBreakoutId}
          onClick={this.onInvitationUsers}
          ghost
          circle
          hideLabel
          className={cx(toggleBtnClasses)}
        />) : null
      ),
      (amIModerator && CaptionsService.isCaptionsEnabled() && isMeteorConnected
        ? (
          <Button
            icon="closed_caption"
            label={intl.formatMessage(intlMessages.captionsLabel)}
            description={intl.formatMessage(intlMessages.captionsDesc)}
            key={this.captionsId}
            onClick={this.handleCaptionsClick}
            ghost
            circle
            hideLabel
            className={cx(toggleBtnClasses)}
          />
        )
        : null),
    ]);

    this.compactMenuItems = _.compact([
      (isMeteorConnected ? (
        <DropdownListItem
          key={this.clearStatusId}
          icon="clear_status"
          label={intl.formatMessage(intlMessages.clearAllLabel)}
          description={intl.formatMessage(intlMessages.clearAllDesc)}
          onClick={toggleStatus}
        />
      ) : null),
      (!meetingIsBreakout && isMeteorConnected ? (
        <DropdownListItem
          key={this.muteAllId}
          icon={isMeetingMuted ? 'unmute' : 'mute'}
          label={intl.formatMessage(
            intlMessages[isMeetingMuted ? 'unmuteAllLabel' : 'muteAllLabel'],
          )}
          description={intl.formatMessage(
            intlMessages[isMeetingMuted ? 'unmuteAllDesc' : 'muteAllDesc'],
          )}
          onClick={toggleMuteAllUsers}
        />
      ) : null),
      (!meetingIsBreakout && !isMeetingMuted && isMeteorConnected ? (
        <DropdownListItem
          key={this.muteId}
          icon="mute"
          label={intl.formatMessage(intlMessages.muteAllExceptPresenterLabel)}
          description={intl.formatMessage(
            intlMessages.muteAllExceptPresenterDesc,
          )}
          onClick={toggleMuteAllUsersExceptPresenter}
        />
      ) : null),
      (amIModerator ? (
        <DropdownListItem
          icon="download"
          label={intl.formatMessage(intlMessages.saveUserNames)}
          key={this.saveUsersNameId}
          onClick={this.onSaveUserNames}
        />
      ) : null),
      (!meetingIsBreakout && isMeteorConnected ? (
        <DropdownListItem
          key={this.lockId}
          icon="lock"
          label={intl.formatMessage(intlMessages.lockViewersLabel)}
          description={intl.formatMessage(intlMessages.lockViewersDesc)}
          onClick={() => mountModal(<LockViewersContainer />)}
        />) : null),
      (canCreateBreakout && isMeteorConnected ? (
        <DropdownListItem
          key={this.createBreakoutId}
          icon="rooms"
          label={intl.formatMessage(intlMessages.createBreakoutRoom)}
          description={intl.formatMessage(intlMessages.createBreakoutRoomDesc)}
          onClick={this.onCreateBreakouts}
        />
      ) : null),
      (canInviteUsers && isMeteorConnected ? (
        <DropdownListItem
          icon="rooms"
          label={intl.formatMessage(intlMessages.invitationItem)}
          key={this.createBreakoutId}
          onClick={this.onInvitationUsers}
        />
      ) : null),
      (amIModerator
      && CaptionsService.isCaptionsEnabled()
      && isMeteorConnected ? (
        <DropdownListItem
          icon="closed_caption"
          label={intl.formatMessage(intlMessages.captionsLabel)}
          description={intl.formatMessage(intlMessages.captionsDesc)}
          key={this.captionsId}
          onClick={this.handleCaptionsClick}
        />
        ) : null),
    ]);

    return contentWidth >= 720 ? this.menuItems : this.compactMenuItems;
  }

  render() {
    const { intl } = this.props;
    const content = document.querySelector('#content');
    const contentWidth = content === null ? 0 : content.offsetWidth;

    return (
      <div className={styles.menuItems}>
        {
          contentWidth >= 720 ? (
            this.renderMenuItems(contentWidth)
          ) : (
            <Dropdown
              ref={(ref) => { this.dropdown = ref; }}
              autoFocus={false}
              onShow={this.onActionsShow}
              onHide={this.onActionsHide}
              className={styles.dropdown}
            >
              <DropdownTrigger tabIndex={0}>
                <Button
                  label={intl.formatMessage(intlMessages.optionsLabel)}
                  icon="settings"
                  ghost
                  color="primary"
                  hideLabel
                  className={styles.optionsButton}
                  size="sm"
                  onClick={() => null}
                />
              </DropdownTrigger>
              <DropdownContent
                className={styles.dropdownContent}
                placement="left top"
                style={{ left: '0' }}
              >
                <DropdownList>
                  {
                    this.renderMenuItems(contentWidth)
                  }
                </DropdownList>
              </DropdownContent>
            </Dropdown>
          )
        }
      </div>
    );
  }
}

UserOptions.propTypes = propTypes;
export default withModalMounter(injectIntl(UserOptions));
