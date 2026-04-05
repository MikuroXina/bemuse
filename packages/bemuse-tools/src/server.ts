import { createReadStream, promises } from 'node:fs'
import path from 'node:path'
import { Readable } from 'node:stream'

import cors from '@fastify/cors'
import middle from '@fastify/middie'
import staticServe from '@fastify/static'
import bytes from 'bytes'
import Fastify, { FastifyReply, FastifyRequest } from 'fastify'
import { glob } from 'glob'

export async function start(dir: string, port: number): Promise<void> {
  const fastify = Fastify()

  await fastify.register(middle)
  await fastify.register(cors, {
    methods: ['GET', 'HEAD', 'OPTIONS'],
  })
  const cwd = process.cwd()
  const root = path.resolve(cwd, dir)
  if (cwd !== root && !root.startsWith(cwd + path.sep)) {
    throw new Error('cannot serve a directory not in CWD')
  }
  await fastify.register(staticServe, { root })
  fastify.get('/:song(.+)/assets/:file([^/]+)', await bemuseAssets(dir))
  fastify.listen({ port }, (err, address) => {
    if (err != null) {
      throw err
    }
    console.log(`Listening at ${address}`)
  })
}

async function bemuseAssets(dir: string) {
  const serveSongAssets = createAssetServer()
  dir = path.normalize(await promises.realpath(dir))
  return async function bemuseAssetsHandler(
    req: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const params = req.params as { song: string; file: string }
    const song = decodeURIComponent(params['song'])
    const file = params['file'] as string
    const target = path.normalize(path.join(dir, song))
    if (target.slice(0, dir.length) !== dir) {
      return
    }
    await serveSongAssets(target, file, reply)
  }
}

interface SongServer {
  (file: string, res: FastifyReply): Promise<void>
}

function createAssetServer() {
  const songCache: Record<string, SongServer> = {}
  return async function assetServerHandler(
    target: string,
    file: string,
    res: FastifyReply
  ) {
    if (!songCache[target]) {
      songCache[target] = await createSongServer(target)
    }
    songCache[target](file, res)
  }
}

interface FileStat {
  name: string
  size: number
}

async function createSongServer(dir: string): Promise<SongServer> {
  const names = await glob('**/*.{wav,ogg,mp3,m4a,flac}', { cwd: dir })
  const files: FileStat[] = await Promise.all(
    names.map(async (name) => {
      const stats = await promises.stat(path.join(dir, name))
      return {
        name,
        size: stats.size,
      }
    })
  )

  interface Metadata {
    files: { name: string; ref: number[] }[]
    refs: { path: string }[]
  }
  const ref = { path: 'data.bemuse' }
  const metadata: Metadata = { files: [], refs: [ref] }
  let current = 0
  for (const file of files) {
    const left = current
    const right = left + file.size
    const entry = { name: file.name, ref: [0, left, right] }
    metadata.files.push(entry)
    current = right
  }
  console.log(
    'Serving ' + dir + ' (' + files.length + ' files, ' + bytes(current) + ')'
  )

  return async function (file: string, res: FastifyReply) {
    if (file === 'metadata.json') {
      res.send(metadata)
    } else if (file === 'data.bemuse') {
      streamFiles(dir, files, res)
    } else {
      res.callNotFound()
    }
  }
}

function streamFiles(
  dir: string,
  files: readonly FileStat[],
  res: FastifyReply
) {
  const encoder = new TextEncoder()
  const headerStream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode('BEMUSEPACK'))
      controller.enqueue([0, 0, 0, 0])
      controller.close()
    },
  })
  const fileStreams: ReadableStream[] = files
    .map((file) => createReadStream(path.join(dir, file.name)))
    .map((stream) => Readable.toWeb(stream) as ReadableStream)

  const stream = concatStreams(headerStream, ...fileStreams)

  res.send(stream)
}

function concatStreams(...streams: readonly ReadableStream[]): ReadableStream {
  return new ReadableStream({
    async start(controller) {
      for (const stream of streams) {
        const reader = stream.getReader()
        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            controller.enqueue(value)
          }
        } finally {
          reader.releaseLock()
        }
      }
      controller.close()
    },
  })
}
