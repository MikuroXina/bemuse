import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'

import { App } from './view/app'

const queryClient = new QueryClient()

export function View() {
  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </StrictMode>
  )
}
