// @flow
const { db } = require('./db');

/*
===========================================================

  MODIFYING AND CREATING DATA IN USERSDIRECTMESSAGETHREADS

===========================================================
*/

// creates a single member in a direct message thread. invoked when a user is added
// to an existing direct message thread (group thread only)
const createMemberInDirectMessageThread = (
  threadId: string,
  userId: string,
  setActive: boolean
): Promise<Object> => {
  return db
    .table('usersDirectMessageThreads')
    .insert(
      {
        threadId,
        userId,
        isArchived: false,
        createdAt: new Date(),
        lastActive: setActive ? new Date() : null,
        lastSeen: setActive ? new Date() : null,
        receiveNotifications: true,
      },
      { returnChanges: true }
    )
    .run()
    .then(result => result.changes[0].new_val);
};

// removes a single member from a channel. will be invoked if a user leaves
// a channel
const removeMemberInDirectMessageThread = (
  threadId: string,
  userId: string
): Promise<Object> => {
  return db
    .table('usersDirectMessageThreads')
    .getAll(threadId, { index: 'threadId' })
    .filter({ userId })
    .delete()
    .run();
};

// removes all the user relationships to a dm thread. will be invoked when a
// dm thread is permanently deleted, at which point we don't want any records in the
// database to show a user relationship to the deleted thread
const removeMembersInDirectMessageThread = (
  threadId: string
): Promise<Object> => {
  return db
    .table('usersDirectMessageThreads')
    .getAll(threadId, { index: 'threadId' })
    .delete()
    .run();
};

const setUserLastSeenInDirectMessageThread = (
  threadId: string,
  userId: string
): Promise<Object> => {
  return db
    .table('usersDirectMessageThreads')
    .getAll(userId, { index: 'userId' })
    .filter({ threadId })
    .update({
      lastSeen: db.now(),
    })
    .run()
    .then(() =>
      db
        .table('directMessageThreads')
        .get(threadId)
        .run()
    );
};

const updateDirectMessageThreadNotificationStatusForUser = (
  threadId: string,
  userId: string,
  val: boolean
): Promise<Object> => {
  return db
    .table('usersDirectMessageThreads')
    .getAll(userId, { index: 'userId' })
    .filter({ threadId })
    .update({
      receiveNotifications: val,
    })
    .run();
};

/*
===========================================================

        GETTING DATA FROM USERSDIRECTMESSAGETHREADS

===========================================================
*/

// TODO: Add method to update if the thread is archived or not.
// TODO: Add method to get if the thread is archived or not.
const archiveDirectMessageThread = (
  userDirectMessageThreadId: string
): Promise<Object> => {
  return db
    .table('usersDirectMessageThreads')
    .get(userDirectMessageThreadId)
    .update({ archivedAt: new Date() }, { returnChanges: true })
    .run();
};

const unarchiveDirectMessageThread = (
  userDirectMessageThreadId: string
): Promise<Object> => {
  return db
    .table('usersDirectMessageThreads')
    .get(userDirectMessageThreadId)
    .update({ archivedAt: db.literal() }, { returnChanges: true })
    .run();
};

const updateIsDirectMessageThreadArchived = (
  userDirectMessageThreadId: string,
  isArchived: boolean
): Promise<Object> => {
  return db
    .table('usersDirectMessageThreads')
    .get(userDirectMessageThreadId)
    .update({ isArchived })
    .run();
};

const getDirectMessageThread = (
  threadId: string,
  userId: string
): Promise<Object> => {
  return db
    .table('usersDirectMessageThreads')
    .getAll(threadId, { index: 'threadId' })
    .filter({ userId })
    .run();
};

const getMembersInDirectMessageThread = (
  threadId: string
): Promise<Array<Object>> => {
  return db
    .table('usersDirectMessageThreads')
    .getAll(threadId, { index: 'threadId' })
    .eqJoin('userId', db.table('users'))
    .without({ left: ['createdAt'], right: ['id', 'lastSeen'] })
    .zip()
    .run();
};

// for loader
const getMembersInDirectMessageThreads = (
  threadIds: Array<string>
): Promise<Array<Object>> => {
  return db
    .table('usersDirectMessageThreads')
    .getAll(...threadIds, { index: 'threadId' })
    .eqJoin('userId', db.table('users'))
    .without({ left: ['createdAt'], right: ['id', 'lastSeen'] })
    .group(rec => rec('left')('threadId'))
    .zip()
    .run();
};

const isMemberOfDirectMessageThread = (threadId: string, userId: string) => {
  return db
    .table('usersDirectMessageThreads')
    .getAll(threadId, { index: 'threadId' })('userId')
    .contains(userId)
    .run();
};

module.exports = {
  createMemberInDirectMessageThread,
  removeMemberInDirectMessageThread,
  removeMembersInDirectMessageThread,
  setUserLastSeenInDirectMessageThread,
  updateDirectMessageThreadNotificationStatusForUser,
  updateIsDirectMessageThreadArchived,
  unarchiveDirectMessageThread,
  archiveDirectMessageThread,
  // get
  getDirectMessageThread,
  getMembersInDirectMessageThread,
  getMembersInDirectMessageThreads,
  isMemberOfDirectMessageThread,
};
