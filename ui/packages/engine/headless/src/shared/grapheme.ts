/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 按用户看到的"一个字"切分文本：组合 emoji、国旗、带变音符的字母都算一个。

let segmenter: Intl.Segmenter | null | undefined

/**
 * 字素切分器，头一次用到时才建。
 * 引擎没有 Intl.Segmenter（Firefox 125 之前）时退到按码点切：代理对仍算一个，组合序列会拆成几个。
 */
function graphemeSegmenter(): Intl.Segmenter | null {
  if (segmenter === undefined)
    segmenter = typeof Intl === 'object' && typeof Intl.Segmenter === 'function' ? new Intl.Segmenter(undefined, { granularity: 'grapheme' }) : null
  return segmenter
}

/** 把文本切成一个个字素。 */
export function graphemes(text: string): string[] {
  const seg = graphemeSegmenter()
  if (!seg)
    return [...text]
  return [...seg.segment(text)].map(item => item.segment)
}

/** 文本有几个字素，即用户数得出来的字数。 */
export function graphemeLength(text: string): number {
  const seg = graphemeSegmenter()
  if (!seg)
    return [...text].length
  return [...seg.segment(text)].length
}
