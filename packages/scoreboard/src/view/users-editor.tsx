import { useAuth0 } from '@auth0/auth0-react'
import { Moderation } from '@mikuroxina/scoreboard-types'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Fragment } from 'react'
import { parse } from 'valibot'

import { PlayDetails } from './play-details'
import { UserFreezeButton } from './user-freeze-button'

const queryUsers =
  (tokenPromise: Promise<string>) =>
  async ({ pageParam }: { pageParam: string }) => {
    const params = new URLSearchParams({
      until: pageParam,
    })
    const res = await fetch(`/api/v1/moderation/users/?${params}`, {
      headers: {
        Authorization: `Bearer ${await tokenPromise}`,
      },
    })
    const data = await res.json()
    const users = parse(Moderation.listUsersResponseSchema, data)
    const nextCursor = users.at(-1)!.created_at
    return {
      data: users,
      nextCursor,
    }
  }

export function UsersEditor() {
  const { getAccessTokenSilently } = useAuth0()
  const tokenPromise = getAccessTokenSilently()
  const {
    data,
    status,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['listUsers'],
    queryFn: queryUsers(tokenPromise),
    initialPageParam: new Date().toISOString(),
    getNextPageParam: ({ nextCursor }) => nextCursor,
  })

  if (status === 'pending') {
    return <p>Loading…</p>
  }
  if (status === 'error') {
    return (
      <div>
        <h2>Something went wrong</h2>
        <span>{error.message}</span>
      </div>
    )
  }

  return (
    <div>
      <ol>
        {data?.pages.map(({ data }, i) => (
          <Fragment key={i}>
            {data.map((user) => (
              <li key={user.id}>
                <div>
                  <p>
                    <span>{user.name}</span>
                    <span>Registered at {user.created_at}</span>
                    {user.is_frozen && <span>FROZEN</span>}
                  </p>
                  <UserFreezeButton userId={user.id} frozen={user.is_frozen} />
                  <PlayDetails userId={user.id} />
                </div>
              </li>
            ))}
          </Fragment>
        ))}
      </ol>
      {hasNextPage && (
        <button disabled={isFetchingNextPage} onClick={() => fetchNextPage()}>
          Load more
        </button>
      )}
      {isFetchingNextPage && <p>Loading more…</p>}
    </div>
  )
}
