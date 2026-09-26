/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 种子随机：同一个种子永远给出同一串数，服务端与客户端、每次重渲染的结果都一样。
// 抖动以数据的身份为种子：点的位置只由它是谁决定，数据顺序变了、重渲染了，点都不跳。

/** 一个随机数源：每调用一次给出 [0, 1) 里的下一个数。 */
export type RandomSource = () => number

/** mulberry32：32 位状态、周期 2^32，快且分布足够均匀，适合抖动这类视觉用途（不用于任何安全场景）。 */
export function createRandom(seed: number): RandomSource {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6D2B79F5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** 把一个字符串散成 32 位种子（FNV-1a）：数据的身份串直接当种子用。 */
export function hashSeed(text: string): number {
  let hash = 0x811C9DC5
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return hash >>> 0
}

/**
 * 以身份为种子的抖动：返回 [−amount / 2, amount / 2) 里的一个偏移。
 * 同一个身份永远落在同一处，数据换了次序、图重渲染了，点都不会跳。
 */
export function jitter(identity: string, amount: number): number {
  if (!(amount > 0))
    return 0
  return (createRandom(hashSeed(identity))() - 0.5) * amount
}
