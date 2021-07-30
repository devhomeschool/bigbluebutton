import React, { Component } from 'react';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { styles } from '/imports/ui/components/user-list/user-list-content/styles';
import _ from 'lodash';
import { findDOMNode } from 'react-dom';
import UserListItemContainer from './user-list-item/container';
import VideoProviderContainer from '/imports/ui/components/video-provider/container';


const propTypes = {
  compact: PropTypes.bool,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  currentUser: PropTypes.shape({}).isRequired,
  users: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  setEmojiStatus: PropTypes.func.isRequired,
  roving: PropTypes.func.isRequired,
  requestUserInformation: PropTypes.func.isRequired,
  usersVideo: PropTypes.arrayOf(Array),
  swapLayout: PropTypes.bool,
  disableVideo: PropTypes.bool,
  audioModalIsOpen: PropTypes.bool,
  viewParticipantsWebcams: PropTypes.bool,
};

const defaultProps = {
  compact: false,
  usersVideo: [],
  swapLayout: false,
  disableVideo: false,
  audioModalIsOpen: false,
  viewParticipantsWebcams: true,
};

const listTransition = {
  enter: styles.enter,
  enterActive: styles.enterActive,
  appear: styles.appear,
  appearActive: styles.appearActive,
  leave: styles.leave,
  leaveActive: styles.leaveActive,
};

class UserParticipants extends Component {
  constructor() {
    super();

    this.state = {
      selectedUser: null,
    };

    this.userRefs = [];

    this.getScrollContainerRef = this.getScrollContainerRef.bind(this);
    this.rove = this.rove.bind(this);
    this.changeState = this.changeState.bind(this);
    this.getUsers = this.getUsers.bind(this);
    this.handleClickSelectedUser = this.handleClickSelectedUser.bind(this);
  }

  componentDidMount() {
    const { compact } = this.props;
    if (!compact) {
      this.refScrollContainer.addEventListener(
        'keydown',
        this.rove,
      );

      this.refScrollContainer.addEventListener(
        'click',
        this.handleClickSelectedUser,
      );
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const isPropsEqual = _.isEqual(this.props, nextProps);
    const isStateEqual = _.isEqual(this.state, nextState);
    return !isPropsEqual || !isStateEqual;
  }

  componentDidUpdate(prevProps, prevState) {
    const { selectedUser } = this.state;

    if (selectedUser === prevState.selectedUser) return;

    if (selectedUser) {
      const { firstChild } = selectedUser;
      if (firstChild) firstChild.focus();
    }
  }

  componentWillUnmount() {
    this.refScrollContainer.removeEventListener('keydown', this.rove);
    this.refScrollContainer.removeEventListener('click', this.handleClickSelectedUser);
  }

  getScrollContainerRef() {
    return this.refScrollContainer;
  }

  getUsers(
    cameraIsMirrored,
    mirrorCamera,
    intl,
    intlMessages,
    ACTION_NAME_MIRROR,
    onMount,
    handleCanvasResize,
  ) {
    const {
      compact,
      setEmojiStatus,
      users,
      requestUserInformation,
      currentUser,
      meetingIsBreakout,
      audioModalIsOpen,
      swapLayout,
    } = this.props;

    let index = -1;

    return users.map(u => (
      <CSSTransition
        classNames={listTransition}
        appear
        enter
        exit
        timeout={0}
        component="div"
        className={cx(styles.participantsList)}
        key={u.userId}
      >
        <div ref={(node) => { this.userRefs[index += 1] = node; }}>
          <UserListItemContainer
            {...{
              compact,
              setEmojiStatus,
              requestUserInformation,
              currentUser,
              meetingIsBreakout,
              audioModalIsOpen,
              swapLayout,
            }}
            cameraIsMirrored={cameraIsMirrored}
            mirrorCamera={mirrorCamera}
            intl={intl}
            intlMessages={intlMessages}
            ACTION_NAME_MIRROR={ACTION_NAME_MIRROR}
            onMount={onMount}
            handleCanvasResize={handleCanvasResize}
            user={u}
            getScrollContainerRef={this.getScrollContainerRef}
          />
        </div>
      </CSSTransition>
    ));
  }

  handleClickSelectedUser(event) {
    let selectedUser = null;
    if (event.path) {
      selectedUser = event.path.find(p => p.className && p.className.includes('participantsList'));
    }
    this.setState({ selectedUser });
  }

  rove(event) {
    const { roving } = this.props;
    const { selectedUser } = this.state;
    const usersItemsRef = findDOMNode(this.refScrollItems);
    roving(event, this.changeState, usersItemsRef, selectedUser);
  }

  changeState(ref) {
    this.setState({ selectedUser: ref });
  }

  render() {
    const {
      amIModerator,
      amIPresenter,
      audioModalIsOpen,
      usersVideo,
      viewParticipantsWebcams,
    } = this.props;

    const { streams } = usersVideo;
    const { viewParticipantsWebcams: viewWebcams } = viewParticipantsWebcams;
    const showVideo = streams.length > 0 && viewWebcams;
    const disableVideo = !viewWebcams;
    return (
      <div className={styles.userListColumn}>
        <div
          className={styles.scrollableList}
          tabIndex={0}
          ref={(ref) => { this.refScrollContainer = ref; }}
        >
          <div className={styles.list}>
            <TransitionGroup ref={(ref) => { this.refScrollItems = ref; }}>
              {!disableVideo
                && !audioModalIsOpen && showVideo && (amIModerator || amIPresenter)
                ? (
                  <VideoProviderContainer
                    {...this.props}
                    getUsers={this.getUsers}
                  />
                ) : this.getUsers()}
            </TransitionGroup>
          </div>
        </div>
      </div>
    );
  }
}

UserParticipants.propTypes = propTypes;
UserParticipants.defaultProps = defaultProps;

export default UserParticipants;
