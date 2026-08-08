// 图标记录：框架无关的纯数据，渲染端逐节点建元素，运行期不经任何解析。

/**
 * 允许出现在记录里的标签。这是白名单的类型化形态：
 * 管线若产出 script / style / foreignObject / animate / use / image / text / filter，
 * 在编译期就通不过。
 */
export type IconTag
  = | 'path' | 'circle' | 'ellipse' | 'rect' | 'line' | 'polyline' | 'polygon'
    | 'g' | 'defs' | 'clipPath' | 'mask'
    | 'linearGradient' | 'radialGradient' | 'stop'

/**
 * 一个 SVG 图元。
 *
 * 没有文本节点变体：图标不携带任何能被读屏读到的文字，可及名字只从 IconProps.label 来。
 * `<title>` / `<desc>` 由管线丢弃——记录里留一个 title 会与 aria-label 同时命名，读屏念两遍。
 */
export interface IconNode {
  readonly tag: IconTag
  /** 属性名逐字保留连字符（stroke-linecap / stroke-width 等），值一律是串。 */
  readonly attrs?: Readonly<Record<string, string>>
  /** 任意深度递归：不允许递归就表达不了 clipPath / mask / 渐变。 */
  readonly children?: readonly IconNode[]
}

/** 一个图标。生成产物，不在运行期构造，也不做运行期冻结（readonly 只在编译期成立）。 */
export interface IconRecord {
  /** 规范化名，如 `check`。用于 root 上的 data-icon 与诊断，不参与渲染。 */
  readonly name: string
  /** 根 `<svg>` 的坐标系，首方集恒为 `0 0 24 24`。 */
  readonly viewBox: string
  /**
   * 打在根 `<svg>` 上的呈现属性（fill / stroke / stroke-width / stroke-linecap / stroke-linejoin 等）。
   * 呈现属性的层叠优先级低于任何 CSS 规则，皮肤的 data-weight 档位因此能直接盖掉 stroke-width。
   * 这里不重复 viewBox，也不出现 width / height —— 尺寸归皮肤。
   */
  readonly attrs?: Readonly<Record<string, string>>
  /** 图元树，非空。 */
  readonly nodes: readonly IconNode[]
}
