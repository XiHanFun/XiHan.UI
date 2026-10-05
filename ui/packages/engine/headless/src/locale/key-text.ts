/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 各语言包写键名与键帽字共用的查表：表里只写有专名的键，字母、数字、标点照大写形式写。

import type { KbdResolvedPlatform } from '../kbd/kbd.types'

/** 一张键名表：同一枚键在两个平台上叫法不同时写成 { mac, other }。 */
export type KeyTextTable = Readonly<Record<string, string | { readonly mac: string, readonly other: string }>>

/** 按归一化键名查表；表里没有的键（字母、数字、标点）用大写形式，单个字母正好读成字母本身。 */
export function keyText(table: KeyTextTable, key: string, platform: KbdResolvedPlatform): string {
  const hit = Object.hasOwn(table, key) ? table[key] : undefined
  if (hit === undefined)
    return key.toUpperCase()
  return typeof hit === 'string' ? hit : hit[platform]
}
