import { showAlert, showQuickPick } from '@bemuse/components/dialog/index.js'

export function main() {
  ;(async () => {
    const result = await showQuickPick(
      ['one', 'two', 'three'].map((x) => ({ label: x })),
      { title: 'test' }
    )
    await showAlert('Result', 'You selected: ' + result.label)
  })()
}
