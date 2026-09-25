/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 导出 scene 模块的公共接口。

export { createScene, curveOf, diffScenes, LAYERS, markPath, sceneMarks } from './scene'
export type { SceneDiff, SceneEntry, SceneInput, ShapeMark } from './scene'
export type {
  ArcMark,
  AreaMark,
  CurveName,
  DatumRef,
  GroupMark,
  LineMark,
  Mark,
  MarkA11y,
  MarkPaint,
  PathMark,
  RectMark,
  Scene,
  SceneLayer,
  SceneLayers,
  SymbolMark,
  TextMark,
} from './types'
