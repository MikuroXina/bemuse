import { expect, it } from 'vitest'

import {
  type CustomFolderContext,
  type CustomFolderScanIO,
  getCustomFolderState,
  scanFolder,
  setCustomFolder,
} from './index.js'
import type { CustomFolderState } from './types.js'

const debugging = false

const mockFolderScanIO: CustomFolderScanIO = {
  log: (text) => {
    if (debugging) {
      console.log('scanFolder: [log]', text)
    }
  },
  setStatus: (text) => {
    if (debugging) {
      console.debug('scanFolder: [setStatus]', text)
    }
  },
  updateState: () => {},
}

class CustomFolderContextMock implements CustomFolderContext {
  private map = new Map<string, CustomFolderState>()
  async get(key: string) {
    return this.map.get(key)
  }

  async set(key: string, value: CustomFolderState) {
    this.map.set(key, value)
  }

  async del(key: string) {
    this.map.delete(key)
  }
}

const song1: MockFolder = {
  'normal.bms': '#TITLE meow [NORMAL]\n#BPM 90\n#00111:01',
  'hyper.bms': '#TITLE meow [HYPER]\n#BPM 90\n#00111:01',
}

const song2: MockFolder = {
  'normal.bms': '#TITLE nyan [NORMAL]\n#BPM 90\n#00111:01',
  'hyper.bms': '#TITLE nyan [HYPER]\n#BPM 90\n#00111:01',
}

it('allows setting custom folder and loading it in-game', async () => {
  const folder: MockFolder = { song1, song2 }
  const tester = new CustomFolderTestHarness()
  await tester.setFolder(folder)
  await tester.checkState(async (state) => {
    expect(state.chartFilesScanned).not.to.equal(true)
  })

  await tester.scan()
  await tester.checkState(async (state) => {
    expect(state.songs).to.have.length(2)
  })
})

it('can scan for new songs', async () => {
  const folder: MockFolder = { song1 }
  const tester = new CustomFolderTestHarness()
  await tester.setFolder(folder)
  await tester.scan()
  await tester.checkState(async (state) => {
    expect(state.songs).to.have.length(1)
  })

  folder['song2'] = song2
  await tester.scan()
  await tester.checkState(async (state) => {
    expect(state.songs).to.have.length(2)
  })
})

it('detects deleted folders', async () => {
  const folder: MockFolder = { song1, song2 }
  const tester = new CustomFolderTestHarness()
  await tester.setFolder(folder)
  await tester.scan()
  await tester.checkState(async (state) => {
    expect(state.songs).to.have.length(2)
  })

  delete folder['song1']
  await tester.scan()
  await tester.checkState(async (state) => {
    expect(state.songs).to.have.length(1)
  })
})
class CustomFolderTestHarness {
  private context = new CustomFolderContextMock()

  constructor() {
    this.context = new CustomFolderContextMock()
  }

  async setFolder(data: MockFolder) {
    await setCustomFolder(
      this.context,
      createMockFileSystemDirectoryHandle(data)
    )
  }

  async scan() {
    await scanFolder(this.context, mockFolderScanIO)
  }

  async checkState(f: (state: CustomFolderState) => Promise<void>) {
    const state = await getCustomFolderState(this.context)
    expect(state).not.to.equal(undefined)
    await f(state!)
  }
}

type MockFolder = {
  [name: string]: MockFolder | string
}

function createMockFileSystemDirectoryHandle(
  data: MockFolder
): FileSystemDirectoryHandle {
  return {
    kind: 'directory',
    queryPermission: async () => 'granted',
    [Symbol.asyncIterator]: async function* () {
      for (const [name, value] of Object.entries(data)) {
        if (typeof value === 'string') {
          yield [name, createMockFileSystemFileHandle(name, value)] as const
        } else {
          yield [name, createMockFileSystemDirectoryHandle(value)] as const
        }
      }
    },
    getDirectoryHandle: async (name: string) => {
      expect(data[name]).to.be.an('object')
      return createMockFileSystemDirectoryHandle(data[name] as MockFolder)
    },
    getFileHandle: async (name: string) => {
      expect(data[name]).to.be.a('string')
      return createMockFileSystemFileHandle(name, data[name] as string)
    },
  } as unknown as FileSystemDirectoryHandle
}

function createMockFileSystemFileHandle(
  name: string,
  data: string
): FileSystemFileHandle {
  return {
    kind: 'file',
    queryPermission: async () => 'granted',
    getFile: async () => {
      const blob = new Blob([data], { type: 'text/plain' })
      return Object.assign(blob, {
        name,
        lastModified: 1,
      }) as File
    },
  } as FileSystemFileHandle
}
