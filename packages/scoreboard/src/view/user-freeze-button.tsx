import {
  type MutationFunctionContext,
  useMutation,
} from '@tanstack/react-query'

const freezeUser = async (id: string) => {
  const res = await fetch(`/api/v1/moderation/users/${id}/freeze`, {
    method: 'POST',
    credentials: 'include',
  })
  if (!res.ok) {
    throw new Error(`freeze failed: ${await res.text()}`)
  }
}

const unfreezeUser = async (id: string) => {
  const res = await fetch(`/api/v1/moderation/users/${id}/unfreeze`, {
    method: 'POST',
    credentials: 'include',
  })
  if (!res.ok) {
    throw new Error(`freeze failed: ${await res.text()}`)
  }
}

export interface UserFreezeButtonProps {
  userId: string
  frozen: boolean
}

export function UserFreezeButton({ userId, frozen }: UserFreezeButtonProps) {
  async function onMutate(_vars: string, context: MutationFunctionContext) {
    await context.client.invalidateQueries({ queryKey: ['listUsers'] })
  }

  const mutation = useMutation({
    mutationFn: frozen ? unfreezeUser : freezeUser,
    onMutate,
  })

  return (
    <div>
      {mutation.isPending ? (
        'Operating…'
      ) : frozen ? (
        <button onClick={() => mutation.mutate(userId)}>Unfreeze</button>
      ) : (
        <button onClick={() => mutation.mutate(userId)}>Freeze</button>
      )}
      {mutation.isError && mutation.error.message}
    </div>
  )
}
