// 测试用的 zip 读取：按中央目录逐个读出条目，核对本地文件头、大小与 CRC。

import { Buffer } from 'node:buffer'
import { crc32, inflateRawSync } from 'node:zlib'

export interface UnzippedEntry {
  readonly name: string
  readonly method: number
  readonly compressedSize: number
  readonly data: Buffer
  readonly text: string
}

function fail(message: string): never {
  throw new Error(`zip: ${message}`)
}

/** 读出 zip 里的全部条目，结构或校验不对时抛出。 */
export function unzip(bytes: Uint8Array): Map<string, UnzippedEntry> {
  const buffer = Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  let end = buffer.length - 22
  while (end >= 0 && buffer.readUInt32LE(end) !== 0x06054B50)
    end--
  if (end < 0)
    fail('end of central directory not found')
  const count = buffer.readUInt16LE(end + 10)
  const size = buffer.readUInt32LE(end + 12)
  let offset = buffer.readUInt32LE(end + 16)
  if (offset + size !== end)
    fail('central directory size mismatch')
  const entries = new Map<string, UnzippedEntry>()
  for (let i = 0; i < count; i++) {
    if (buffer.readUInt32LE(offset) !== 0x02014B50)
      fail('bad central directory header')
    const flags = buffer.readUInt16LE(offset + 8)
    const method = buffer.readUInt16LE(offset + 10)
    const crc = buffer.readUInt32LE(offset + 16)
    const compressedSize = buffer.readUInt32LE(offset + 20)
    const uncompressedSize = buffer.readUInt32LE(offset + 24)
    const nameLength = buffer.readUInt16LE(offset + 28)
    const extraLength = buffer.readUInt16LE(offset + 30)
    const commentLength = buffer.readUInt16LE(offset + 32)
    const local = buffer.readUInt32LE(offset + 42)
    const name = buffer.toString('utf8', offset + 46, offset + 46 + nameLength)
    if ((flags & 0x0800) === 0)
      fail(`${name}: utf-8 flag missing`)
    if (buffer.readUInt32LE(local) !== 0x04034B50)
      fail(`${name}: bad local header`)
    if (buffer.readUInt32LE(local + 14) !== crc || buffer.readUInt32LE(local + 18) !== compressedSize || buffer.readUInt32LE(local + 22) !== uncompressedSize)
      fail(`${name}: local header disagrees with central directory`)
    const start = local + 30 + buffer.readUInt16LE(local + 26) + buffer.readUInt16LE(local + 28)
    const raw = buffer.subarray(start, start + compressedSize)
    const data = method === 8 ? inflateRawSync(raw) : method === 0 ? Buffer.from(raw) : fail(`${name}: unsupported method ${method}`)
    if (data.length !== uncompressedSize)
      fail(`${name}: size mismatch`)
    if (crc32(data) !== crc)
      fail(`${name}: crc mismatch`)
    entries.set(name, { name, method, compressedSize, data, text: data.toString('utf8') })
    offset += 46 + nameLength + extraLength + commentLength
  }
  return entries
}
