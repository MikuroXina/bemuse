import SparkMD5 from 'spark-md5'

export class Payload {
  public readonly buffers: ArrayBuffer[] = []
  public size = 0

  add(buffer: ArrayBuffer): [start: number, end: number] {
    const result: [number, number] = [this.size, this.size + buffer.byteLength]
    this.buffers.push(buffer)
    this.size += buffer.byteLength
    return result
  }

  get hash(): string {
    const hasher = new SparkMD5.ArrayBuffer()
    for (const buffer of this.buffers) {
      hasher.append(buffer)
    }
    return hasher.end()
  }
}

export default Payload
