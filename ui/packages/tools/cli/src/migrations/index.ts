/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 各 major 的迁移规则与公开面差异，按 major 升序。

import type { MigrationRules, SurfaceDiff } from './types'
import SURFACE from './surface.generated.json'
import { V2 } from './v2'
import { V3 } from './v3'
import { V4 } from './v4'
import { V5 } from './v5'

export interface MajorMigration {
  readonly rules: MigrationRules
  readonly surface: SurfaceDiff
}

const DIFFS = SURFACE as unknown as readonly SurfaceDiff[]

export const MIGRATIONS: readonly MajorMigration[] = [V2, V3, V4, V5].map((rules) => {
  const surface = DIFFS.find(diff => diff.major === rules.major)
  if (!surface)
    throw new Error(`surface.generated.json 里没有 ${rules.major} 的差异，先跑 node build/gen-migrations.mjs`)
  return { rules, surface }
})

/** 从 from 迁到 to 要依次套用的几套规则：from 之后、to 及之前的每个 major。 */
export function migrationsBetween(from: number, to: number): readonly MajorMigration[] {
  return MIGRATIONS.filter(({ rules }) => rules.major > from && rules.major <= to)
}

export type { MigrationRules, SurfaceDiff } from './types'
