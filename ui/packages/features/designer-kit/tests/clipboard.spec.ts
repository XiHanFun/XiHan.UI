// 设计器剪贴板数据：序列化后原样解析回来、MIME 类型、只认本产品的包、非法输入的报错与失败原因。
import { describe, expect, it } from 'vitest'
import { CLIPBOARD_FORMAT, clipboardMimeType, decodeClipboard, encodeClipboard } from '../src'

describe('encodeClipboard / decodeClipboard', () => {
  it('包上格式标记、产品名与版本，解析回来得到同一份载荷', () => {
    const payload = { elements: [{ id: 'text-1', x: 10.5, y: 20, tags: ['a', null] }] }
    const text = encodeClipboard('print', 1, payload)
    expect(JSON.parse(text)).toEqual({ format: CLIPBOARD_FORMAT, product: 'print', version: 1, payload })
    expect(decodeClipboard(text, 'print')).toEqual({ ok: true, version: 1, payload })
  })

  it('按产品名生成 MIME 类型', () => {
    expect(clipboardMimeType('print')).toBe('application/x-xihan-print+json')
    expect(clipboardMimeType('flow-designer')).toBe('application/x-xihan-flow-designer+json')
  })

  it('不是 JSON、不是剪贴板包、包的字段不合法、来自别的产品时给出原因', () => {
    expect(decodeClipboard('hello', 'print')).toEqual({ ok: false, reason: 'invalid-json' })
    expect(decodeClipboard('{"elements":[]}', 'print')).toEqual({ ok: false, reason: 'not-clipboard' })
    expect(decodeClipboard('[1]', 'print')).toEqual({ ok: false, reason: 'not-clipboard' })
    const envelope = (fields: Record<string, unknown>): string => JSON.stringify({ format: CLIPBOARD_FORMAT, product: 'print', version: 1, payload: {}, ...fields })
    expect(decodeClipboard(envelope({ version: 0 }), 'print')).toEqual({ ok: false, reason: 'invalid-envelope' })
    expect(decodeClipboard(envelope({ version: 1.5 }), 'print')).toEqual({ ok: false, reason: 'invalid-envelope' })
    expect(decodeClipboard(envelope({ product: 3 }), 'print')).toEqual({ ok: false, reason: 'invalid-envelope' })
    expect(decodeClipboard(JSON.stringify({ format: CLIPBOARD_FORMAT, product: 'print', version: 1 }), 'print')).toEqual({ ok: false, reason: 'invalid-envelope' })
    expect(decodeClipboard(encodeClipboard('flow', 1, []), 'print')).toEqual({ ok: false, reason: 'other-product' })
  })

  it('包上多出的字段忽略，载荷可以是 null', () => {
    const text = JSON.stringify({ format: CLIPBOARD_FORMAT, product: 'print', version: 2, payload: null, source: 'x' })
    expect(decodeClipboard(text, 'print')).toEqual({ ok: true, version: 2, payload: null })
  })

  it('产品名、版本与载荷不合法时抛错', () => {
    expect(() => encodeClipboard('Print', 1, {})).toThrow(RangeError)
    expect(() => encodeClipboard('', 1, {})).toThrow(RangeError)
    expect(() => clipboardMimeType('a b')).toThrow(RangeError)
    expect(() => decodeClipboard('{}', '1x')).toThrow(RangeError)
    expect(() => encodeClipboard('print', 0, {})).toThrow(RangeError)
    expect(() => encodeClipboard('print', 1, { n: Number.NaN } as never)).toThrow(/\/payload\/n/)
  })
})
