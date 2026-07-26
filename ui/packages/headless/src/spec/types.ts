// 组件规格的纯类型（零运行时）：键盘交互表与组件元数据。
// 一致性套件与文档从这里取"分母"，实现层无法自证完备。

/** 键盘交互表的一行：一组按键在某条件下的可达性与副作用。 */
export interface KeyboardRow {
  /** 稳定行 id，一致性用例用 covers 字段反查。 */
  readonly id: string
  /** 触发按键（'Enter' / 'Shift+Tab' 等书写形式）。 */
  readonly keys: readonly string[]
  /** 生效前置条件的自然语言描述。 */
  readonly when: string
  /** 按键的效果。 */
  readonly does: string
}

/** 组件键盘交互表：一份数据，被测试、文档、DoD 校验三处消费。 */
export interface KeyboardTable {
  readonly component: string
  /** 规格出处（APG 章节锚点）。 */
  readonly source: string
  readonly rows: readonly KeyboardRow[]
}

/** 组件元数据：必备 part 等结构约束的机读形式。 */
export interface ComponentMeta {
  readonly component: string
  /** 未渲染即视为契约违约的 part（子集须落在 anatomy.parts 内）。 */
  readonly requiredParts: readonly string[]
}
