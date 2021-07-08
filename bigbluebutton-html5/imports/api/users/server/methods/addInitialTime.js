import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import RedisPubSub from '/imports/startup/server/redis';
import Logger from '/imports/startup/server/logger';
import { extractCredentials } from '/imports/api/common/server/helpers';

export default function addInitialTime(userId, initialTime) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'addInitialTime';

  const { meetingId, requesterUserId } = extractCredentials(this.userId);

  check(userId, String);
  check(initialTime, Number);

  const payload = {
    userId,
    initialTime,
    changedBy: requesterUserId,
  };

  Logger.verbose('Changed user initialTime', {
    userId, initialTime, changedBy: requesterUserId, meetingId,
  });

  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
