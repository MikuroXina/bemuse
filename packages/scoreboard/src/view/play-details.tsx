import { useAuth0 } from '@auth0/auth0-react'
import { Moderation } from '@mikuroxina/scoreboard-types'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { parse } from 'valibot'

const fetchLog =
  (tokenPromise: Promise<string>) =>
  async ({ queryKey: [, userId] }: { queryKey: ['inspectUser', string] }) => {
    const res = await fetch(`/api/v1/moderation/users/${userId}/`, {
      headers: {
        Authorization: `Bearer ${await tokenPromise}`,
      },
    })
    return parse(Moderation.inspectUserResponseSchema, await res.json())
  }

function PlayLog({ userId }: { userId: string }) {
  const { getAccessTokenSilently } = useAuth0()
  const tokenPromise = getAccessTokenSilently()
  const { status, error, data } = useQuery({
    queryKey: ['inspectUser', userId],
    queryFn: fetchLog(tokenPromise),
  })

  if (status === 'pending') {
    return <p>Loading…</p>
  }
  if (status === 'error') {
    return (
      <div>
        <p>Something went wrong</p>
        <p>{error.message}</p>
      </div>
    )
  }
  return (
    <table>
      <tr>
        <th>Chart</th>
        <th>Play Mode</th>
        <th>Score</th>
        <th>Recorded At</th>
      </tr>
      {data.plays.map(({ id, play_mode, created_at, chart_md5, score }) => (
        <tr key={id}>
          <td>{chart_md5}</td>
          <td>{play_mode}</td>
          <td>{score.score}</td>
          <td>{created_at}</td>
        </tr>
      ))}
    </table>
  )
}

export interface PlayDetailsProps {
  userId: string
}

export function PlayDetails({ userId }: PlayDetailsProps) {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <div>
        <span>Play History:</span>
        <button onClick={() => setOpen((flag) => !flag)}>Open/Close</button>
      </div>
      <div>{open && <PlayLog userId={userId} />}</div>
    </div>
  )
}
