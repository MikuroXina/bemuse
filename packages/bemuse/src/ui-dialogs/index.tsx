import './index.scss'

import Button from '@bemuse/ui/Button.js'
import Panel from '@bemuse/ui/Panel.js'
import VBox from '@bemuse/ui/VBox.js'
import WARP from '@bemuse/utils/warp-element.js'
import * as AlertDialog from '@radix-ui/react-alert-dialog'
import type { ReactNode } from 'react'
import { createRoot } from 'react-dom/client'

import { ComboBox } from './ComboBox.js'

export async function showAlert(title: string, message: ReactNode) {
  await registerActiveModal(
    new Promise<void>((resolve) => {
      const container = document.createElement('div')
      const root = createRoot(container)
      WARP.appendChild(container)
      const onClick = () => {
        WARP.removeChild(container)
        root.unmount()
        resolve()
      }
      const popup = (
        <AlertDialog.Root open>
          <AlertDialog.Overlay className='AlertDialogのoverlay' />
          <AlertDialog.Content className='AlertDialogのcontent'>
            <Panel title={<AlertDialog.Title>{title}</AlertDialog.Title>}>
              <VBox padding='1em' gap='0.75em'>
                <AlertDialog.Description>{message}</AlertDialog.Description>
                <div style={{ textAlign: 'right' }}>
                  <AlertDialog.Action asChild>
                    <Button onClick={onClick} ref={(b) => b && b.focus()}>
                      OK
                    </Button>
                  </AlertDialog.Action>
                </div>
              </VBox>
            </Panel>
          </AlertDialog.Content>
        </AlertDialog.Root>
      )
      root.render(popup)
    })
  )
}

export async function showQuickPick<T extends QuickPickItem>(
  items: T[],
  options: QuickPickOptions
) {
  return registerActiveModal(
    new Promise<T>((resolve) => {
      const container = document.createElement('div')
      const root = createRoot(container)
      WARP.appendChild(container)
      const onSelect = (item: T) => {
        WARP.removeChild(container)
        root.unmount()
        resolve(item)
      }
      const popup = (
        <AlertDialog.Root open>
          <AlertDialog.Overlay className='AlertDialogのoverlay' />
          <AlertDialog.Content className='AlertDialogのcontent'>
            <Panel
              title={<AlertDialog.Title>{options.title}</AlertDialog.Title>}
            >
              <VBox padding='1em' gap='0.75em'>
                <ComboBox items={items} onSelect={onSelect} />
              </VBox>
            </Panel>
          </AlertDialog.Content>
        </AlertDialog.Root>
      )
      root.render(popup)
    })
  )
}

export type QuickPickItem = {
  label: string
}

export type QuickPickOptions = {
  title: string
}

const activeModals = new Set<Promise<unknown>>()

function registerActiveModal<T extends Promise<unknown>>(promise: T) {
  activeModals.add(promise)
  Promise.resolve(promise).finally(() => {
    activeModals.delete(promise)
  })
  return promise
}

export function isModalActive() {
  return activeModals.size > 0
}
