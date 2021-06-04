import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

import { styles } from './styles';

const propTypes = {
  children: PropTypes.node.isRequired,
  moderator: PropTypes.bool,
  presenter: PropTypes.bool,
  talking: PropTypes.bool,
  muted: PropTypes.bool,
  listenOnly: PropTypes.bool,
  voice: PropTypes.bool,
  noVoice: PropTypes.bool,
  color: PropTypes.string,
  className: PropTypes.string,
  isChat: PropTypes.bool,
  height: PropTypes.number.isRequired,
};

const defaultProps = {
  moderator: false,
  presenter: false,
  talking: false,
  muted: false,
  listenOnly: false,
  voice: false,
  noVoice: false,
  color: '#000',
  className: null,
  isChat: false,
};

const UserAvatar = ({
  children,
  moderator,
  presenter,
  talking,
  muted,
  listenOnly,
  color,
  voice,
  noVoice,
  className,
  isChat,
  height,
}) => (

  <div
    aria-hidden="true"
    data-test="userAvatar"
    className={cx(styles.avatar, {
      [styles.moderator]: moderator,
      [styles.presenter]: presenter,
      [styles.muted]: muted,
      [styles.listenOnly]: listenOnly,
      [styles.voice]: voice,
      [styles.noVoice]: noVoice && !listenOnly,
      [styles.isChat]: isChat,
      [styles.talking]: (talking && !muted),
    }, className)}
    style={{
      backgroundColor: color,
      color,
      height: `${height}px`,
    }}
  >
    <div className={styles.content}>
      {children}
    </div>
  </div>
);

UserAvatar.propTypes = propTypes;
UserAvatar.defaultProps = defaultProps;

export default UserAvatar;
