import { describe, expect, it } from 'vitest'
import { renderChart } from './song-render'

const metadataUrl =
  'https://raw.githubusercontent.com/bemusic/bemuse-test-server/c75567b055662e419599c7c8a7f3325f813d9586/%5Byamajet%5Dfoon/assets/metadata.json'
const chartUrl =
  'https://raw.githubusercontent.com/bemusic/bemuse-test-server/c75567b055662e419599c7c8a7f3325f813d9586/%5Byamajet%5Dfoon/foon_5n.bms'

describe('renderChart', () => {
  it('can render', async function () {
    const soundAssetsMetadata = await fetch(metadataUrl).then((res) =>
      res.json()
    )
    const chartData = await fetch(chartUrl).then((res) => res.arrayBuffer())
    const chartFilename = 'foon_5n.bms'
    const out = await renderChart({
      soundAssetsMetadata,
      chartData,
      chartFilename,
      loadBemusepack: (path) =>
        fetch(new URL(path, metadataUrl).href).then((r) => r.arrayBuffer()),
    })
    expect(out.replayGain).to.be.a('number')
    expect(out.ogg).to.be.an.instanceOf(Uint8Array)
  }, 50000)
})
