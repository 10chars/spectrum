// @flow
import type { GraphQLContext } from '../../..';
import { isAdmin } from '../../../utils/permissions';
import { getCommunitiesWithOneThread } from '../../../models/admin/communities';

export default async (_: any, __: any, { user }: GraphQLContext) => {
  if (!isAdmin(user.id)) return null;

  return await getCommunitiesWithOneThread();
};
