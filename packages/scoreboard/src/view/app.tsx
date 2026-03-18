import { useAuth0 } from '@auth0/auth0-react'

import { LoginButton } from './login-button'
import { LogoutButton } from './logout-button'
import { UsersEditor } from './users-editor'

export function App() {
  const { isLoading, error, user } = useAuth0()
  if (error) {
    return (
      <div>
        <h1>Something went wrong</h1>
        <p>{error.message}</p>
      </div>
    )
  }
  if (isLoading) {
    return <p>Loading…</p>
  }
  if (!user) {
    return <LoginButton />
  }
  if (user.email !== 'mikuroxina@gmail.com') {
    return <p>You have no permissions.</p>
  }
  return (
    <div>
      <h1>Bemuse Scoreboard Management Widget</h1>
      <nav>
        <LogoutButton />
      </nav>
      <div>
        <UsersEditor />
      </div>
    </div>
  )
}
