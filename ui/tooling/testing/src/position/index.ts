/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 导出 position 模块的公共接口。

export { runPositionEngine } from './run'
export {
  attachProbe,
  createStage,
  expectAtLeast,
  expectClose,
  expectPlacedAt,
  expectSame,
  nextFrame,
  POSITION_TOLERANCE,
  viewportCenter,
} from './scene'
export type { PositionProbe, Stage } from './scene'
