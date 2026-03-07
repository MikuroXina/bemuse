import SparkMD5 from 'spark-md5'

export class Payload {
  constructor() {
    this.buffers = []
    this.size = 0
  }

  add(buffer) {
    const result = [this.size, this.size + buffer.length]
    this.buffers.push(buffer)
    this.size += buffer.length
    return result
  }

  get hash() {
    const hasher = new SparkMD5.ArrayBuffer()
    for (const buffer of this.buffers) {
      hasher.append(buffer.buffer)
    }
    return hasher.end()
  }
}

export default Payload
