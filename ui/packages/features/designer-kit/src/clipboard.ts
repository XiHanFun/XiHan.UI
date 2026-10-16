/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 设计器剪贴板数据：带格式标记、产品名与版本的 JSON 包的序列化与解析；读写剪贴板事件由设计器负责。

import type { JsonValue } from '@xihan-ui/core/json'
import { findJsonViolation, isPlainObject } from '@xihan-ui/core/json'

/** 剪贴板包的格式标记。 */
export const CLIPBOARD_FORMAT = 'xihan-designer-clipboard'

/** 剪贴板包：product 为产品名（如 print、flow），version 为载荷的结构版本，payload 为产品自己的数据。 */
export interface ClipboardEnvelope<T extends JsonValue = JsonValue> {
  readonly format: typeof CLIPBOARD_FORMAT
  readonly product: string
  readonly version: number
  readonly payload: T
}

/** 解析失败的原因：不是 JSON、不是剪贴板包、包的字段不合法、来自别的产品。 */
export type ClipboardDecodeError = 'invalid-json' | 'not-clipboard' | 'invalid-envelope' | 'other-product'

/** 解析结果：成功时给出版本与载荷，载荷的结构由产品按版本再校验。 */
export type ClipboardDecodeResult
  = | { readonly ok: true, readonly version: number, readonly payload: JsonValue }
    | { readonly ok: false, readonly reason: ClipboardDecodeError }

const PRODUCT_PATTERN = /^[a-z][a-z0-9-]*$/

function checkProduct(product: string): void {
  if (typeof product !== 'string' || !PRODUCT_PATTERN.test(product))
    throw new RangeError(`[designer-kit] clipboard product must match ${PRODUCT_PATTERN}, got ${String(product)}`)
}

function isVersion(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1
}

/** 剪贴板数据的 MIME 类型 `application/x-xihan-<product>+json`，与 text/plain 一同写入剪贴板事件。 */
export function clipboardMimeType(product: string): string {
  checkProduct(product)
  return `application/x-xihan-${product}+json`
}

/**
 * 把载荷包成剪贴板包并序列化为 JSON 文本。产品名须为小写字母开头的小写字母、数字与连字符，
 * 版本须为正整数，载荷须为合法 JSON 值，否则抛错。
 */
export function encodeClipboard(product: string, version: number, payload: JsonValue): string {
  checkProduct(product)
  if (!isVersion(version))
    throw new RangeError(`[designer-kit] clipboard version must be a positive integer, got ${version}`)
  const violation = findJsonViolation(payload, '/payload')
  if (violation !== undefined)
    throw new RangeError(`[designer-kit] clipboard payload is not a JSON value at ${violation}`)
  const envelope: ClipboardEnvelope = { format: CLIPBOARD_FORMAT, product, version, payload }
  return JSON.stringify(envelope)
}

/**
 * 解析剪贴板文本，只接受 product 产品的剪贴板包；包上多出的字段忽略。
 * 版本是否支持、载荷结构是否合法由产品自己判断。
 */
export function decodeClipboard(text: string, product: string): ClipboardDecodeResult {
  checkProduct(product)
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  }
  catch {
    return { ok: false, reason: 'invalid-json' }
  }
  if (!isPlainObject(parsed) || parsed.format !== CLIPBOARD_FORMAT)
    return { ok: false, reason: 'not-clipboard' }
  if (typeof parsed.product !== 'string' || !isVersion(parsed.version) || !Object.hasOwn(parsed, 'payload'))
    return { ok: false, reason: 'invalid-envelope' }
  if (parsed.product !== product)
    return { ok: false, reason: 'other-product' }
  return { ok: true, version: parsed.version, payload: parsed.payload as JsonValue }
}
