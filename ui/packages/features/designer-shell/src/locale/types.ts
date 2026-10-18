/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 一份完整语言包的文案：每个零件的每个键都得给。零件新增文案键后，各语言包在类型检查里一并报缺。

import type {
  DesignerFrameTranslations,
  DesignerIssuesTranslations,
  DesignerPaletteTranslations,
  DesignerPropertiesTranslations,
  DesignerRulerTranslations,
} from '../translations'

/** 设计器零件一种语言的全部文案，键是零件的标签名。 */
export interface DesignerShellLocaleTranslations {
  readonly 'xh-designer-properties': DesignerPropertiesTranslations
  readonly 'xh-designer-issues': DesignerIssuesTranslations
  readonly 'xh-designer-palette': DesignerPaletteTranslations
  readonly 'xh-designer-ruler': DesignerRulerTranslations
  readonly 'xh-designer-frame': DesignerFrameTranslations
}
