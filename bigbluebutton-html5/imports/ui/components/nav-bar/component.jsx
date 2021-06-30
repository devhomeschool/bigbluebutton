import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Session } from 'meteor/session';
import cx from 'classnames';
import { withModalMounter } from '/imports/ui/components/modal/service';
import withShortcutHelper from '/imports/ui/components/shortcut-help/service';
import getFromUserSettings from '/imports/ui/services/users-settings';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import Icon from '../icon/component';
import { styles } from './styles.scss';
import Button from '../button/component';
import RecordingIndicator from './recording-indicator/container';
import SettingsDropdownContainer from './settings-dropdown/container';
import TalkingIndicatorContainer from '/imports/ui/components/nav-bar/talking-indicator/container';
import UserOptionsContainer from '../user-list/user-list-content/user-participants/user-options/container';

const intlMessages = defineMessages({
  toggleUserListLabel: {
    id: 'app.navBar.userListToggleBtnLabel',
    description: 'Toggle button label',
  },
  toggleUserListAria: {
    id: 'app.navBar.toggleUserList.ariaLabel',
    description: 'description of the lists inside the userlist',
  },
  newMessages: {
    id: 'app.navBar.toggleUserList.newMessages',
    description: 'label for toggleUserList btn when showing red notification',
  },
});

const propTypes = {
  amIModerator: PropTypes.bool,
  meetingIsBreakout: PropTypes.bool,
  isExpanded: PropTypes.bool,
  intl: intlShape.isRequired,
  setEmojiStatus: PropTypes.func.isRequired,
  users: PropTypes.arrayOf(PropTypes.object).isRequired,
  presentationTitle: PropTypes.string,
  hasUnreadMessages: PropTypes.bool,
  shortcuts: PropTypes.string,
};

const defaultProps = {
  amIModerator: true,
  meetingIsBreakout: false,
  isExpanded: false,
  presentationTitle: 'Default Room Title',
  hasUnreadMessages: false,
  shortcuts: '',
};

class NavBar extends PureComponent {
  static handleToggleUserList() {
    Session.set(
      'openPanel',
      Session.get('openPanel') !== ''
        ? ''
        : 'userlist',
    );
    Session.set('idChatOpen', '');
  }

  constructor() {
    super();
    this.state = {
      classTime: null,
    };

    this.initialTime = null;
    this.calculateTimePassed = this.calculateTimePassed.bind(this);
  }

  componentDidMount() {
    const {
      processOutsideToggleRecording,
      connectRecordingObserver,
      checkInitialTime,
    } = this.props;

    if (Meteor.settings.public.allowOutsideCommands.toggleRecording
      || getFromUserSettings('bbb_outside_toggle_recording', false)) {
      connectRecordingObserver();
      window.addEventListener('message', processOutsideToggleRecording);
    }

    this.initialTime = checkInitialTime();
    setTimeout(() => {
      this.setState({ classTime: this.calculateTimePassed() });
    }, 1000);
  }

  componentDidUpdate() {
    setTimeout(() => {
      this.setState({ classTime: this.calculateTimePassed() });
    }, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  calculateTimePassed() {
    const timePassed = +Date.now() - +this.initialTime;
    const time = {
      hours: Math.floor((timePassed / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((timePassed / 1000 / 60) % 60),
      seconds: Math.floor((timePassed / 1000) % 60),
    };
    return time;
  }

  render() {
    const {
      hasUnreadMessages,
      isExpanded,
      intl,
      // shortcuts: TOGGLE_USERLIST_AK,
      mountModal,
      presentationTitle,
      users,
      setEmojiStatus,
      meetingIsBreakout,
      amIModerator,
    } = this.props;

    const { classTime } = this.state;

    const toggleBtnClasses = {};
    toggleBtnClasses[styles.btn] = true;
    toggleBtnClasses[styles.btnWithNotificationDot] = hasUnreadMessages;

    let ariaLabel = intl.formatMessage(intlMessages.toggleUserListAria);
    ariaLabel += hasUnreadMessages ? (` ${intl.formatMessage(intlMessages.newMessages)}`) : '';

    return (
      <div className={styles.navbar}>
        <div className={styles.top}>
          <div className={styles.left}>
            {!isExpanded ? null
              : <Icon iconName="left_arrow" className={styles.arrowLeft} />
            }
            <Button
              data-test="userListToggleButton"
              onClick={NavBar.handleToggleUserList}
              ghost
              circle
              hideLabel
              label={intl.formatMessage(intlMessages.toggleUserListLabel)}
              aria-label={ariaLabel}
              icon="user"
              className={cx(toggleBtnClasses)}
              aria-expanded={isExpanded}
              // accessKey={TOGGLE_USERLIST_AK}
            />
            {isExpanded ? null
              : <Icon iconName="right_arrow" className={styles.arrowRight} />
            }
          </div>
          <div className={styles.center}>
            <h1 className={styles.presentationTitle}>{ presentationTitle }</h1>
            <RecordingIndicator
              mountModal={mountModal}
              amIModerator={amIModerator}
              classTime={classTime}
            />
            {!amIModerator ? null
              : (
                <UserOptionsContainer {...{
                  users,
                  setEmojiStatus,
                  meetingIsBreakout,
                  intl,
                }}
                />
              )
            }
          </div>
          <div className={styles.right}>
            <SettingsDropdownContainer amIModerator={amIModerator} />
          </div>
        </div>
        { amIModerator ? null : (
          <div className={styles.bottom}>
            <TalkingIndicatorContainer amIModerator={amIModerator} />
          </div>
        )}
      </div>
    );
  }
}

NavBar.propTypes = propTypes;
NavBar.defaultProps = defaultProps;
export default withShortcutHelper(withModalMounter(injectIntl(NavBar)), 'toggleUserList');
