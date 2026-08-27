// 选中的类型契约。这一层只算集合，不碰 DOM，也不认识状态机。

export type SelectionMode = 'none' | 'single' | 'multiple'

export interface SelectionState {
  /** 选中的值。顺序按加入的先后，去重。 */
  selected: readonly string[]
  /**
   * 范围选的起点。
   *
   * 按住 Shift 点某一项，选的是「锚点到这一项」那一段。裸点击与 Ctrl+点击会把锚点
   * 挪到刚点的那一项上，Shift+点击则不挪——连着按 Shift 能从同一个起点反复改选区大小。
   */
  anchor: string | null
}

export interface SelectionOrder {
  /**
   * 可选项的全序，通常就是 DOM 顺序。
   * 范围选靠它算「这两项之间有谁」，顺序不对选出来的就是错的一段。
   */
  items: readonly string[]
  /** 这一项能不能选。禁用的项占着顺序位置，但范围选不会把它收进去。 */
  isDisabled?: (value: string) => boolean
}

export interface SelectionInput extends SelectionOrder {
  state: SelectionState
  mode: SelectionMode
  value: string
  /** 按住了 Shift：从锚点选到这一项。 */
  extend?: boolean
  /** 按住了 Ctrl / Cmd：在现有选中集上增删，而不是整份替换。 */
  additive?: boolean
}
