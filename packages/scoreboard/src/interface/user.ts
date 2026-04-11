import type { Auth } from '@mikuroxina/scoreboard-types'

export interface UserQuery {
  readonly userInfo: (userId: Auth.UserId) => Promise<Auth.UserInfo>
  readonly userInfoBatch: (
    userIds: readonly Auth.UserId[]
  ) => Promise<Record<Auth.UserId, Auth.UserInfo>>
}

export interface UserRepository {
  readonly freeze: (userId: Auth.UserId) => Promise<void>
  readonly unfreeze: (userId: Auth.UserId) => Promise<void>
}
