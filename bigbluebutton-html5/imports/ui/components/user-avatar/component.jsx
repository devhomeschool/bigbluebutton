import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import cx from "classnames";
import openSocket from "socket.io-client";
import Button from "/imports/ui/components/button/component";

import { styles } from "./styles";

const propTypes = {
  children: PropTypes.node.isRequired,
  moderator: PropTypes.bool.isRequired,
  presenter: PropTypes.bool,
  talking: PropTypes.bool,
  muted: PropTypes.bool,
  listenOnly: PropTypes.bool,
  voice: PropTypes.bool,
  noVoice: PropTypes.bool,
  color: PropTypes.string,
  className: PropTypes.string,
};

const defaultProps = {
  moderator: false,
  presenter: false,
  talking: false,
  muted: false,
  listenOnly: false,
  voice: false,
  noVoice: false,
  color: "#000",
  className: null,
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
}) => {
  const [isWarning, setIsWarning] = useState(false);

  useEffect(() => {
    const socket = openSocket("https://bbb-heroku-test.herokuapp.com/");
    socket.on("user", (data) => {
      setImmediate(() => {
        console.log("set Immediate ativado!");
        if (data.action === "warning") {
          setIsWarning((prevState) => {
            return !prevState;
          });
        }
      });
    });
  }, []);

  const createWarningSignal = async () => {
    const response = await fetch(
      "https://bbb-heroku-test.herokuapp.com/user/status/warning",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: "String apenas para propositos de teste",
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Algo deu errado na chamada da api!");
    }

    const resData = await response.json();
    console.log(resData.message);
  };

  return (
    <div
      aria-hidden="true"
      data-test="userAvatar"
      className={cx(
        styles.avatar,
        {
          [styles.moderator]: moderator,
          [styles.presenter]: presenter,
          [styles.muted]: muted,
          [styles.listenOnly]: listenOnly,
          [styles.voice]: voice,
          [styles.noVoice]: noVoice && !listenOnly,
        },
        className
      )}
      style={
        isWarning
          ? { backgroundColor: "#FF0", color: "#FF0" }
          : {
              backgroundColor: color,
              color, // We need the same color on both for the border
            }
      }
    >
      <Button
        ghost
        circle
        className={styles.button}
        onClick={createWarningSignal}
        icon="alert"
      />

      <div
        className={cx({
          [styles.talking]: talking && !muted,
        })}
      />

      <div className={styles.content}>{children}</div>
    </div>
  );
};

UserAvatar.propTypes = propTypes;
UserAvatar.defaultProps = defaultProps;

export default UserAvatar;
