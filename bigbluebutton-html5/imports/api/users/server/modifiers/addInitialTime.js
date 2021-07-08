import Logger from '/imports/startup/server/logger';
import Users from '/imports/api/users';

export default function addInitialTime(meetingId, userId, initialTime) {
  const selector = {
    meetingId,
    userId,
  };

  const modifier = {
    $set: {
      initialTime,
    },
  };

  try {
    const result = Users.update(selector, modifier);
    if (result) {
      Logger.info(`Add user initialTime=${initialTime} id=${userId} meeting=${meetingId}`);
    }
  } catch (err) {
    Logger.error(`Changed user role: ${err}`);
  }

  return null;
}
