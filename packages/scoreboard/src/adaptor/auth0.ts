import type { Auth } from '@mikuroxina/scoreboard-types'
import { ManagementClient, UserInfoClient } from 'auth0'

import type { IDProvider } from '../interface/idp'
import type { UserRepository } from '../interface/user'

export const idProvider = (auth0Domain: string): IDProvider => {
  const client = new UserInfoClient({
    domain: auth0Domain,
  })
  return {
    userId: async (accessToken) => {
      const info = await client.getUserInfo(accessToken)
      if (info.status !== 200) {
        return null
      }
      return info.data.sub as Auth.UserId
    },
  }
}

export const userRepo = ({
  auth0Domain: domain,
  auth0ClientId: clientId,
  auth0ClientSecret: clientSecret,
}: {
  auth0Domain: string
  auth0ClientId: string
  auth0ClientSecret: string
}): UserRepository => {
  const client = new ManagementClient({
    domain,
    clientId,
    clientSecret,
  })
  return {
    userInfo: async (userId) => {
      const info = await client.users.get(userId)
      return {
        id: info.user_id! as Auth.UserId,
        name: info.nickname ?? '(unnamed)',
        created_at: info.created_at as string,
        is_frozen: info.blocked ?? false,
      }
    },
  }
}
