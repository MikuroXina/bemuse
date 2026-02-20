import './style.scss'

import { useEffect, useRef } from 'react'
import { createRoot } from 'react-dom/client'

export function main() {
  const root = createRoot(document.getElementById('scene-root')!)
  root.render(<Page />)
}

function Page() {
  const buttonRef = useRef<HTMLAnchorElement>(null)
  useEffect(() => {
    import('./demo/index.js').then((loadedModule) => {
      if (!buttonRef.current) {
        return
      }
      loadedModule.main(buttonRef.current)
    })
  }, [])

  return (
    <div className='coming-soon'>
      <p>BEAT☆MUSIC☆SEQUENCE</p>
      <h1>Coming Soon</h1>
      <ul>
        <li>
          <a href='https://github.com/bemusic/bemuse'>GitHub Project</a>
        </li>
        <li>
          <a href='/badgeboard/'>Badgeboard</a>
        </li>
        <li>
          <a href='https://gitter.im/bemusic/bemuse'>Gitter Chat</a>
        </li>
        <li>
          <a ref={buttonRef} className='coming-soon--demo' href='#'>
            Loading Demo
          </a>
        </li>
      </ul>
    </div>
  )
}
