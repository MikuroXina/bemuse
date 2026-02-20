import { sceneRoot } from '@bemuse/utils/main-element.js'
import query from '@bemuse/utils/query.js'

const availablePlaygrounds = await (async function (context) {
  const playgrounds = {}
  for (const key of Object.keys(context)) {
    const name = key.match(/\w[^.]+/)[0]
    playgrounds[name] = await context[key]()
  }
  return playgrounds
})(import.meta.glob('./playgrounds*{j,t}s{x,}.'))

const DefaultPlayground = () => {
  const linkStyle = { color: '#abc' }
  return (
    <div>
      <h1>Bemuse Playground</h1>
      <p>Please select a playground</p>
      <ul>
        {Object.keys(availablePlaygrounds).map((key) => (
          <li key={key}>
            <a style={linkStyle} href={'?mode=playground&playground=' + key}>
              {key}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function main() {
  if (availablePlaygrounds[query.playground]) {
    availablePlaygrounds[query.playground].main()
  } else {
    sceneRoot.render(<DefaultPlayground />)
  }
}
