import type { ReactScene } from '@bemuse/scene-manager'

import type GameDisplay from './display'

export default function GameScene(display: GameDisplay): ReactScene {
  return function (container: Element) {
    const handler = () => false
    window.addEventListener('touchstart', handler)
    showCanvas(display, container)
    return {
      teardown() {
        window.removeEventListener('touchstart', handler)
      },
    }
  }
}

function showCanvas(display: GameDisplay, container: Element) {
  const { view, wrapper, context } = display
  const { width, height } = context.skin
  container.appendChild(wrapper)
  container.addEventListener('touchstart', disableContextMenu)
  function disableContextMenu() {
    container.removeEventListener('touchstart', disableContextMenu)
    container.addEventListener('contextmenu', (e) => {
      e.preventDefault()
    })
  }

  resize()
  window.addEventListener('resize', resize)

  function resize() {
    const scale = Math.min(
      window.innerWidth / width,
      window.innerHeight / height
    )
    view.style.width = Math.round(width * scale) + 'px'
    view.style.height = Math.round(height * scale) + 'px'
    wrapper.style.width = Math.round(width * scale) + 'px'
    wrapper.style.height = Math.round(height * scale) + 'px'
    const yOffset = (window.innerHeight - height * scale) / 2
    wrapper.style.marginTop = Math.round(yOffset) + 'px'
  }

  return wrapper
}
