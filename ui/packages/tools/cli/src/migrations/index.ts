/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 各 major 的迁移规则与公开面差异，按 major 升序。

import type { MigrationRules, SurfaceDiff } from './types'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { V2 } from './v2'
import { V3 } from './v3'
import { V4 } from './v4'
import { V5 } from './v5'

export interface MajorMigration {
  readonly rules: MigrationRules
  readonly surface: SurfaceDiff
}

const RULES: readonly MigrationRules[] = [V2, V3, V4, V5]

/** 有迁移规则的最新 major。 */
export const LATEST_MAJOR = RULES.at(-1)!.major

/**
 * 公开面差异有一百多 kB，不打进包：源码里它与本文件同目录，构建时 tsdown 把它拷到 dist/，
 * 与打包后的本模块同目录。只在跑 migrate 时读一次。
 */
const SURFACE_FILE = 'surface.generated.json'
let diffs: readonly SurfaceDiff[] | undefined

function surfaceOf(major: number): SurfaceDiff {
  diffs ??= JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), SURFACE_FILE), 'utf8')) as readonly SurfaceDiff[]
  const surface = diffs.find(diff => diff.major === major)
  if (!surface)
    throw new Error(`${SURFACE_FILE} 里没有 ${major} 的差异，先跑 node build/gen-migrations.mjs`)
  return surface
}

/** 从 from 迁到 to 要依次套用的几套规则：from 之后、to 及之前的每个 major。 */
export function migrationsBetween(from: number, to: number): readonly MajorMigration[] {
  return RULES
    .filter(rules => rules.major > from && rules.major <= to)
    .map(rules => ({ rules, surface: surfaceOf(rules.major) }))
}

export type { MigrationRules, SurfaceDiff } from './types'
