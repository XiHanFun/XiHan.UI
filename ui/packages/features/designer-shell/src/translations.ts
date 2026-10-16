/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 零件的文案键：键是零件的标签名，类型补进 UI 的 XhTranslationOverrides。

/** 属性面板的文案。 */
export interface DesignerPropertiesTranslations {
  /** 面板标题。 */
  readonly title: string
  /** 没有可编辑的属性时的提示。 */
  readonly empty: string
  /** 多个对象取值不同时的占位。 */
  readonly mixed: string
  /** JSON 编辑框里的文字不是合法 JSON。 */
  readonly invalidJson: string
}

/** 问题列表的文案。 */
export interface DesignerIssuesTranslations {
  /** 列表标题。 */
  readonly title: string
  /** 没有问题时的提示。 */
  readonly empty: string
  /** 错误过滤开关的文字，带条数。 */
  readonly errors: (count: number) => string
  /** 警告过滤开关的文字，带条数。 */
  readonly warnings: (count: number) => string
  /** 条目前的严重程度：错误。 */
  readonly severityError: string
  /** 条目前的严重程度：警告。 */
  readonly severityWarning: string
  /** 过滤开关组的无障碍名称。 */
  readonly filter: string
}

/** 物料面板的文案。 */
export interface DesignerPaletteTranslations {
  /** 面板标题。 */
  readonly title: string
  /** 搜索框的名称与占位。 */
  readonly search: string
  /** 搜索没有结果时的提示。 */
  readonly noMatches: string
  /** 没有物料时的提示。 */
  readonly empty: string
}

/** 标尺框的文案。 */
export interface DesignerRulerTranslations {
  /** 横向参考线的无障碍名称，入参是格式化后的数值。 */
  readonly horizontalGuide: (value: string) => string
  /** 竖向参考线的无障碍名称，入参是格式化后的数值。 */
  readonly verticalGuide: (value: string) => string
}

declare module '@xihan-ui/web-components' {
  interface XhTranslationOverrides {
    'xh-designer-properties'?: Partial<DesignerPropertiesTranslations>
    'xh-designer-issues'?: Partial<DesignerIssuesTranslations>
    'xh-designer-palette'?: Partial<DesignerPaletteTranslations>
    'xh-designer-ruler'?: Partial<DesignerRulerTranslations>
  }
}
