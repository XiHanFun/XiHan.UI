import type { PropTypes } from '@xihan-ui/kernel'
import type { MachineSchema } from '@xihan-ui/machine'

export interface DynamicInputValueChangeDetails {
  /** 变化后的整份数据数组，顺序即界面上从上到下的顺序。 */
  value: unknown[]
}

/**
 * 行内三个把手的读屏文案，默认英文。行号一律从 1 数起，与用户看到的行序一致。
 * 新增把手不在此列：它没有行号可带，名字取它自己的内容。
 */
export interface DynamicInputTranslations {
  removeTrigger: (index: number, count: number) => string
  moveUpTrigger: (index: number, count: number) => string
  moveDownTrigger: (index: number, count: number) => string
}

/**
 * 行自报家门：行下标由作者在部件上声明，connect 据此产出属性。
 * connect 在 Vue 的 render 期求值，此时 DOM 尚不存在，不得反查 DOM。
 */
export interface DynamicInputItemProps {
  index: number
}

/** 一行的完整读侧投影，作者用它铺行。 */
export interface DynamicInputItem {
  index: number
  /** 渲染这一行该用的 key，由组件发号，见 keys 的说明。 */
  key: string
  /** 这一行的数据，原样取自 value[index]。 */
  value: unknown
  first: boolean
  last: boolean
  canRemove: boolean
  canMoveUp: boolean
  canMoveDown: boolean
}

/** 删除与换序之后焦点该落到哪个把手上。 */
export interface DynamicInputFocusTarget {
  part: string
  index?: number
}

/**
 * 一次结构改动算出来的新值与新号，暂存在 refs 里，等 value 真的变了再落到 keys 上。
 * 受控宿主不写回时它就一直搁着，不会污染当下的号。
 */
export interface DynamicInputPendingKeys {
  value: unknown[]
  keys: string[]
}

export interface DynamicInputSchema extends MachineSchema {
  props: {
    /** 受控数据数组；给了就由宿主说了算，机器不自改，只发 onValueChange。 */
    value?: unknown[]
    /** 非受控初始数据数组。 */
    defaultValue?: unknown[]
    /** 最少几行。到了这个数，删除把手就按不动了。缺省 0。 */
    min?: number
    /** 最多几行。到了这个数，新增把手就按不动了。缺省不限。 */
    max?: number
    /** 新增一行时造一个空项。不给就插一个 null。 */
    createItem?: () => unknown
    /** 出不出换序把手。关（默认）时两个换序把手一律收起。 */
    movable?: boolean
    /** 禁用：新增、删除、换序三路都按不动。 */
    disabled?: boolean
    translations?: Partial<DynamicInputTranslations>
    onValueChange?: (details: DynamicInputValueChangeDetails) => void
  }
  context: {
    /** 数据数组。受控（value 给定）时 cell 直读 prop，写只发 onValueChange 不改内部值。 */
    value: unknown[]
    /**
     * 与 value 一一对应的行号，只增删换序，不随行里的数据变。
     * 宿主的行数据可能没有 id、可能重复、也可能每次改动都换一个新对象，
     * 所以身份只能由组件自己发号，跟着增删换序这套动作走。
     */
    keys: string[]
  }
  computed: Record<string, never>
  refs: {
    /** 下一个行号的流水号。 */
    keySeq: number
    /** 已经算好、还等着 value 落地的号。 */
    pending: DynamicInputPendingKeys | null
  }
  state: 'idle'
  event:
    /** 整份替换（公开 API 与受控写回都走它）。 */
    | { type: 'VALUE.SET', value: unknown[] }
    /** 在末尾追加一行。 */
    | { type: 'ITEM.ADD' }
    /** 删掉某一行；restoreFocus 为真时把焦点接到接位的那一行上。 */
    | { type: 'ITEM.REMOVE', index: number, restoreFocus?: boolean }
    /** 把某一行挪到另一个位置；restoreFocus 为真时焦点跟着这一行走。 */
    | { type: 'ITEM.MOVE', from: number, to: number, restoreFocus?: boolean }
  tag: never
  guard: 'canAdd' | 'canRemove' | 'canMove'
  action: 'setValue' | 'addItem' | 'removeItem' | 'moveItem' | 'syncKeys'
  effect: never
}

export interface DynamicInputApi<T extends PropTypes = PropTypes> {
  value: unknown[]
  /** 逐行的读侧投影，含渲染用的 key。 */
  items: DynamicInputItem[]
  count: number
  empty: boolean
  disabled: boolean
  movable: boolean
  /** 已到下限：再删就少于 min 了。 */
  atMin: boolean
  /** 已到上限：再加就多于 max 了。 */
  atMax: boolean
  canAdd: boolean
  /** 整份替换，不受 min / max 约束。 */
  setValue: (next: unknown[]) => void
  add: () => void
  remove: (index: number) => void
  move: (from: number, to: number) => void
  moveUp: (index: number) => void
  moveDown: (index: number) => void
  getRootProps: () => T['element']
  getItemProps: (item: DynamicInputItemProps) => T['element']
  getItemContentProps: (item: DynamicInputItemProps) => T['element']
  getItemActionProps: (item: DynamicInputItemProps) => T['element']
  getAddTriggerProps: () => T['button']
  getRemoveTriggerProps: (item: DynamicInputItemProps) => T['button']
  getMoveUpTriggerProps: (item: DynamicInputItemProps) => T['button']
  getMoveDownTriggerProps: (item: DynamicInputItemProps) => T['button']
}
