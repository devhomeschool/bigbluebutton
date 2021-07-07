import Logger from '/imports/startup/server/logger';
import Users from '/imports/api/users';

export default function addInitialTime(meetingId, userId, initialTime) {
  console.log('begin addInitialTime modifier');
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
    console.log('begin addInitialTime modifier try');
    const result = Users.update(selector, modifier);
    if (result) {
      console.log('successfull addInitialTime modifier try');
      Logger.info(`Add user initialTime=${initialTime} id=${userId} meeting=${meetingId}`);
    }
  } catch (err) {
    console.log('error addInitialTime modifier');
    Logger.error(`Changed user role: ${err}`);
  }

  return null;
}
