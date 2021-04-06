import React, { memo } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import _ from 'lodash';
import { styles } from './styles.scss';

const propTypes = {
  iconName: PropTypes.string.isRequired,
  prependIconName: PropTypes.string,
};

const defaultProps = {
  prependIconName: 'icon-bbb-',
};

const Icon = ({
  className,
  prependIconName,
  iconName,
  ...props
}) => (
  <i
    className={`${cx(className, [prependIconName, iconName].join(''))} ${styles.zindex}`}
    // ToastContainer from react-toastify passes a useless closeToast prop here
    {..._.omit(props, 'closeToast')}
  />
);

export default memo(Icon);

Icon.propTypes = propTypes;
Icon.defaultProps = defaultProps;
