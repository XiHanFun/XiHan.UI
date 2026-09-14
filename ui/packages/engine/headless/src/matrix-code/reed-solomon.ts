/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

/**
 * GF(256) 上的里德-所罗门纠错码字，供各码制的编码器共用。
 *
 * 同一套算法，两处参数因码制而异：
 * · 本原多项式——QR 是 0x11D（x⁸ + x⁴ + x³ + x² + 1），Data Matrix 是 0x12D（x⁸ + x⁵ + x³ + x² + 1）；
 * · 生成多项式的首根——QR 从 α⁰ 起，Data Matrix 从 α¹ 起。
 * 两者都错一个就是另一套域，算出来的码字读码器一个都认不出。
 *
 * 纯函数：乘法查对数表，生成多项式按次数缓存。
 */

export interface ReedSolomon {
  /** GF(256) 上的乘法。 */
  readonly multiply: (x: number, y: number) => number
  /**
   * 数据码字除以 degree 次生成多项式的余式，即这一块的 degree 个纠错码字，高次在前。
   * degree 至少为 1。
   */
  readonly remainder: (data: readonly number[], degree: number) => number[]
}

/**
 * 建一套域。
 * @param primitive 本原多项式，含 x⁸ 那一位（如 0x11D）
 * @param firstRoot 生成多项式的首根指数：roots = α^firstRoot … α^(firstRoot + degree − 1)
 */
export function createReedSolomon(primitive: number, firstRoot: number): ReedSolomon {
  // 对数表与指数表：exp[i] = α^i，log[exp[i]] = i；exp 表铺两倍长省掉取模
  const exp = new Uint8Array(512)
  const log = new Uint8Array(256)
  let x = 1
  for (let i = 0; i < 255; i++) {
    exp[i] = x
    log[x] = i
    x <<= 1
    if (x & 0x100)
      x ^= primitive
  }
  for (let i = 255; i < 512; i++) exp[i] = exp[i - 255]!

  const multiply = (a: number, b: number): number => (a === 0 || b === 0 ? 0 : exp[log[a]! + log[b]!]!)

  /** 生成多项式的系数，首项常数 1 不入表；长度 = degree。 */
  const divisors = new Map<number, number[]>()
  function divisor(degree: number): number[] {
    const cached = divisors.get(degree)
    if (cached)
      return cached
    const result = Array.from<number>({ length: degree }).fill(0)
    result[degree - 1] = 1
    let root = exp[firstRoot]!
    for (let i = 0; i < degree; i++) {
      for (let j = 0; j < degree; j++) {
        result[j] = multiply(result[j]!, root)
        if (j + 1 < degree)
          result[j] = result[j]! ^ result[j + 1]!
      }
      root = multiply(root, 2)
    }
    divisors.set(degree, result)
    return result
  }

  function remainder(data: readonly number[], degree: number): number[] {
    const gen = divisor(degree)
    const result = Array.from<number>({ length: degree }).fill(0)
    for (const byte of data) {
      const factor = byte ^ result.shift()!
      result.push(0)
      for (let i = 0; i < degree; i++)
        result[i] = result[i]! ^ multiply(gen[i]!, factor)
    }
    return result
  }

  return { multiply, remainder }
}
