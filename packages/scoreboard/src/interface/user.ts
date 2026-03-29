import type { Auth } from '@mikuroxina/scoreboard-types'

export interface UserRepository {
  readonly userInfo: (userId: Auth.UserId) => Promise<Auth.UserInfo>
  readonly userInfoBatch: (
    userIds: readonly Auth.UserId[]
  ) => Promise<Record<Auth.UserId, Auth.UserInfo>>
}
