import type { Auth } from '@mikuroxina/scoreboard-types'

export interface IDProvider {
  readonly userId: (accessToken: string) => Promise<Auth.UserId | null>
}
