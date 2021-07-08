import { check } from 'meteor/check';
import addInitialTime from '/imports/api/users/server/modifiers/addInitialTime';

export default function handleAddInitialTime(payload, meetingId) {
  console.log('begin handleInitialTime');
  check(payload.body, Object);
  check(meetingId, String);

  const { userId, initialTime } = payload.body;

  addInitialTime(meetingId, userId, initialTime);
  console.log('end handleInitialTime');
}
