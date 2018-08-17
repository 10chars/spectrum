// @flow
import type { GraphQLContext } from '../../';
import UserError from '../../utils/UserError';
import {
  unmuteDirectMessageThread,
  getDirectMessageThread,
} from '../../models/usersDirectMessageThreads';
import { isAuthedResolver as requireAuth } from '../../utils/permissions';

type UnmuteDMThreadInput = {
  input: {
    threadId: string,
  },
};

// prettier-ignore
export default requireAuth( async (_: any, args: UnmuteDMThreadInput, ctx: GraphQLContext) => {
  const { input: { threadId } } = args
  const { user: currentUser } = ctx 

  if (!threadId) {
    return new UserError('A threadId is required.');
  }

  const [ directMessageThread ] = await getDirectMessageThread(
    threadId,
    currentUser.id
  );

  if (!directMessageThread) {
    return new UserError('This direct message thread does not exist.');
  }

  try {
    return await unmuteDirectMessageThread(directMessageThread.id);
  } catch (e) {
    return new UserError('We could not mute this message. Please try again');
  }
})
