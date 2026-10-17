/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// URL 的安全判定：只放行按用途加载或打开时不会被当作脚本或文档执行的地址。

/** URL 解析时从串中整个删掉的 ASCII 制表与换行。 */
const TAB_OR_NEWLINE = /[\t\n\r]/g
/** 协议名：字母开头，后接字母、数字与 + - .，以冒号结束。 */
const SCHEME = /^([a-z][a-z0-9+.-]*):/i
/** 地址形式可放行的协议。 */
const ADDRESS_SCHEMES: readonly string[] = ['http', 'https', 'blob']
/** 内联图片的前缀。 */
const INLINE_IMAGE_PREFIX = 'data:image/'
/** 链接可放行的协议。 */
const LINK_SCHEMES: readonly string[] = ['http', 'https', 'mailto', 'tel']

/** 去掉首尾的 C0 控制字符与空格（码位不超过 U+0020）。 */
function trimC0(value: string): string {
  let start = 0
  let end = value.length
  while (start < end && value.charCodeAt(start) <= 0x20)
    start++
  while (end > start && value.charCodeAt(end - 1) <= 0x20)
    end--
  return value.slice(start, end)
}

/**
 * 把一个值收成可以当图片地址用的串：http(s)、`blob:`、以 `data:image/` 开头的内联图片，以及不带协议的相对地址。
 * 其余协议（如 `javascript:`、非图片的 `data:`）、非字符串与空串返回 undefined。
 *
 * 判定前按浏览器解析 URL 的规则去掉首尾的控制字符与空格、删去串中的制表与换行，返回的是处理后的串。
 *
 * @example
 * toSafeImageSource(' https://example.com/a.png ') // 'https://example.com/a.png'
 * toSafeImageSource('java\nscript:alert(1)') // undefined
 */
export function toSafeImageSource(value: unknown): string | undefined {
  if (typeof value !== 'string')
    return undefined
  const src = trimC0(value).replace(TAB_OR_NEWLINE, '')
  if (src === '')
    return undefined
  const scheme = SCHEME.exec(src)?.[1]?.toLowerCase()
  if (scheme === undefined)
    return src
  if (scheme === 'data')
    return src.slice(0, INLINE_IMAGE_PREFIX.length).toLowerCase() === INLINE_IMAGE_PREFIX ? src : undefined
  return ADDRESS_SCHEMES.includes(scheme) ? src : undefined
}

/**
 * 把一个值收成可以当链接地址用的串：http(s)、`mailto:`、`tel:`，以及不带协议的相对地址（含 `#锚点` 与 `?查询`）。
 * 其余协议（如 `javascript:`、`data:`、`blob:`、`file:`）、非字符串与空串返回 undefined。
 *
 * 去掉首尾空白与控制字符、删去串中制表与换行的规则同 `toSafeImageSource`，返回的是处理后的串。
 *
 * @example
 * toSafeLinkHref('mailto:service@example.com') // 'mailto:service@example.com'
 * toSafeLinkHref('data:text/html,<script>alert(1)</script>') // undefined
 */
export function toSafeLinkHref(value: unknown): string | undefined {
  if (typeof value !== 'string')
    return undefined
  const href = trimC0(value).replace(TAB_OR_NEWLINE, '')
  if (href === '')
    return undefined
  const scheme = SCHEME.exec(href)?.[1]?.toLowerCase()
  if (scheme === undefined)
    return href
  return LINK_SCHEMES.includes(scheme) ? href : undefined
}
