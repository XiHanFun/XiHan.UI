/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 最小的 zip 打包：本地文件头、中央目录与目录结尾，条目不压缩或用 deflate-raw 压缩。

import { XlsxError } from './errors'

/** 一个 zip 条目。 */
export interface ZipEntry {
  readonly name: string
  readonly data: Uint8Array<ArrayBuffer>
}

/** 压缩方式：store 不压缩，deflate 用运行环境的 CompressionStream('deflate-raw')。 */
export type ZipCompression = 'store' | 'deflate'

/** zip 写出选项。 */
export interface ZipOptions {
  /** 压缩方式，缺省 deflate；运行环境没有 CompressionStream 时 deflate 抛出 compression-unavailable。 */
  readonly compression?: ZipCompression
}

/** 1980-01-01 00:00 的 DOS 日期与时间：全部条目用同一个时间戳。 */
const DOS_DATE = (0 << 9) | (1 << 5) | 1
const DOS_TIME = 0
const UTF8_FLAG = 0x0800

function crcTable(): Uint32Array {
  const table = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++)
      c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1
    table[n] = c >>> 0
  }
  return table
}

/** 计算 CRC-32。 */
function crc32(data: Uint8Array, table: Uint32Array = crcTable()): number {
  let crc = 0xFFFFFFFF
  for (let i = 0; i < data.length; i++)
    crc = table[(crc ^ data[i]!) & 0xFF]! ^ (crc >>> 8)
  return (crc ^ 0xFFFFFFFF) >>> 0
}

async function deflateRaw(data: Uint8Array<ArrayBuffer>): Promise<Uint8Array<ArrayBuffer>> {
  if (typeof CompressionStream === 'undefined')
    throw new XlsxError('compression-unavailable')
  const stream = new Blob([data]).stream().pipeThrough(new CompressionStream('deflate-raw'))
  return new Uint8Array(await new Response(stream).arrayBuffer())
}

interface Prepared {
  readonly name: Uint8Array<ArrayBuffer>
  readonly crc: number
  readonly size: number
  readonly method: 0 | 8
  readonly body: Uint8Array<ArrayBuffer>
}

/**
 * 把条目打成 zip，文件名按 UTF-8 记。deflate 时某个条目压缩后不比原文小就按原文存放；
 * 时间戳固定为 1980-01-01，store 方式下同一输入得到的字节完全相同。不写 ZIP64，单个条目与整个包都须小于 4 GiB。
 */
export async function writeZip(entries: readonly ZipEntry[], options: ZipOptions = {}): Promise<Uint8Array<ArrayBuffer>> {
  const compression = options.compression ?? 'deflate'
  const encoder = new TextEncoder()
  const table = crcTable()
  const prepared: Prepared[] = []
  for (const entry of entries) {
    const deflated = compression === 'deflate' ? await deflateRaw(entry.data) : null
    const useDeflate = deflated !== null && deflated.length < entry.data.length
    prepared.push({
      name: encoder.encode(entry.name),
      crc: crc32(entry.data, table),
      size: entry.data.length,
      method: useDeflate ? 8 : 0,
      body: useDeflate ? deflated : entry.data,
    })
  }

  const localSize = prepared.reduce((sum, item) => sum + 30 + item.name.length + item.body.length, 0)
  const centralSize = prepared.reduce((sum, item) => sum + 46 + item.name.length, 0)
  if (prepared.length > 0xFFFF || localSize + centralSize > 0xFFFFFFFF || prepared.some(item => item.name.length > 0xFFFF))
    throw new XlsxError('archive-too-large', { entries: prepared.length, size: localSize + centralSize })
  const output = new Uint8Array(localSize + centralSize + 22)
  const view = new DataView(output.buffer)
  let offset = 0
  const offsets: number[] = []

  for (const item of prepared) {
    offsets.push(offset)
    view.setUint32(offset, 0x04034B50, true)
    view.setUint16(offset + 4, 20, true)
    view.setUint16(offset + 6, UTF8_FLAG, true)
    view.setUint16(offset + 8, item.method, true)
    view.setUint16(offset + 10, DOS_TIME, true)
    view.setUint16(offset + 12, DOS_DATE, true)
    view.setUint32(offset + 14, item.crc, true)
    view.setUint32(offset + 18, item.body.length, true)
    view.setUint32(offset + 22, item.size, true)
    view.setUint16(offset + 26, item.name.length, true)
    view.setUint16(offset + 28, 0, true)
    output.set(item.name, offset + 30)
    output.set(item.body, offset + 30 + item.name.length)
    offset += 30 + item.name.length + item.body.length
  }

  const centralOffset = offset
  prepared.forEach((item, index) => {
    view.setUint32(offset, 0x02014B50, true)
    view.setUint16(offset + 4, 20, true)
    view.setUint16(offset + 6, 20, true)
    view.setUint16(offset + 8, UTF8_FLAG, true)
    view.setUint16(offset + 10, item.method, true)
    view.setUint16(offset + 12, DOS_TIME, true)
    view.setUint16(offset + 14, DOS_DATE, true)
    view.setUint32(offset + 16, item.crc, true)
    view.setUint32(offset + 20, item.body.length, true)
    view.setUint32(offset + 24, item.size, true)
    view.setUint16(offset + 28, item.name.length, true)
    view.setUint16(offset + 30, 0, true)
    view.setUint16(offset + 32, 0, true)
    view.setUint16(offset + 34, 0, true)
    view.setUint16(offset + 36, 0, true)
    view.setUint32(offset + 38, 0, true)
    view.setUint32(offset + 42, offsets[index]!, true)
    output.set(item.name, offset + 46)
    offset += 46 + item.name.length
  })

  view.setUint32(offset, 0x06054B50, true)
  view.setUint16(offset + 4, 0, true)
  view.setUint16(offset + 6, 0, true)
  view.setUint16(offset + 8, prepared.length, true)
  view.setUint16(offset + 10, prepared.length, true)
  view.setUint32(offset + 12, offset - centralOffset, true)
  view.setUint32(offset + 16, centralOffset, true)
  view.setUint16(offset + 20, 0, true)
  return output
}
