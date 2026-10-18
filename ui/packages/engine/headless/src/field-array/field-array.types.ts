/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 field array 类型契约。

import type { MachineSchema, PropTypes, Service } from '@xihan-ui/core'
import type { FormArrayMutation, FormPath } from '../form/form.path'
import type { FormSchema } from '../form/form.types'

export interface FieldArrayValueChangeDetails {
  /** 变化后的整份数据数组，顺序即界面上从上到下的顺序。 */
  value: unknown[]
  /**
   * 这次变化是哪一种行变更：增、删、移，或整份写值（replace）。值存在外部 store 的宿主据此迁移行级状态；
   * 受控值从外面换掉、表单重置这类不是本组发起的变化不带。
   */
  mutation?: FormArrayMutation
}

/**
 * 行内三个把手的读屏文案与新增把手的文字，默认英文。行号一律从 1 起，与用户看到的行序一致。
 * 新增把手的名字取自身内容：作者写了内容用作者的，标准结构铺它时填 addTrigger。
 */
export interface FieldArrayTranslations {
  deleteItem: (index: number, count: number) => string
  moveUpTrigger: (index: number, count: number) => string
  moveDownTrigger: (index: number, count: number) => string
  /** 标准结构铺新增把手时的文字。 */
  addTrigger: string
}

/**
 * 行的声明：行下标由作者在部件上声明，connect 据此产出属性。
 * connect 在 Vue 的 render 期求值，此时 DOM 尚不存在，不得反查 DOM。
 */
export interface FieldArrayItemProps {
  index: number
}

/** 排布：list 一行一条纵向堆叠（缺省）；table 是 role=table 的表格，表头与各行共用一套列宽。 */
export type FieldArrayLayout = 'list' | 'table'

/** 表格排布的一列：id 是行里 item-cell 与表头 column-header 的 value。 */
export interface FieldArrayColumn {
  id: string
  /** 列头文字；作者没给 column-header 写内容时显示它。 */
  label?: string
  /** 列宽：数字按 px，字符串原样作轨道宽（fr、%、rem…），不写按 1fr。 */
  width?: string | number
  /**
   * 列的最小宽度：数字按 px，字符串原样（rem、%…）。给了之后这一列不再随容器压窄到它以下，轨道写成
   * minmax(minWidth, width)，width 是一条 minmax 时把下限写进它里面、不写这一项。各列下限之和超过容器时，
   * 表格区横向滚动，表头与各行一起滚，行头与把手钉在两侧。
   */
  minWidth?: string | number
}

/** 表头的一格：value 是列 id。 */
export interface FieldArrayColumnProps {
  value: string
}

/** 行里的一格：index 是第几行，value 是列 id。 */
export interface FieldArrayItemCellProps {
  index: number
  value: string
}

/** 一行的完整读侧投影，作者用它铺设行。 */
export interface FieldArrayItem {
  index: number
  /** 渲染该行应使用的 key，由组件分配，见 keys 的说明。 */
  key: string
  /** 该行的数据，原样取自 value[index]。 */
  value: unknown
  /** 该行控件应使用的显式 FormPath；未提供 name 时为 undefined。 */
  name: FormPath | undefined
  first: boolean
  last: boolean
  canRemove: boolean
  canMoveUp: boolean
  canMoveDown: boolean
  /** 这一行能用拖动把手拖动换序：开了 movable、没禁用没只读。 */
  canDrag: boolean
}

/** 删除与换序之后焦点应落到的把手。 */
export interface FieldArrayFocusTarget {
  part: string
  index?: number
}

/**
 * 一次结构改动计算出的新值与新序号，暂存在 refs 中，等 value 实际变化后再落到 keys 上。
 * 受控宿主不写回时它一直搁置，不会污染当前序号。
 */
export interface FieldArrayPendingKeys {
  value: unknown[]
  keys: string[]
}

/**
 * 接了按压通道的把手，按 key 记住正被按住的那一个：新增把手只有一个，
 * 行内三个把手按行序号（机器分配的 `row-<流水号>`）区分，行换位或离场时随之松开。
 */
export type FieldArrayPressedKey = 'add' | `item-delete:${string}` | `move-up:${string}` | `move-down:${string}`

export interface FieldArraySchema extends MachineSchema {
  props: {
    /** 受控数据数组；提供后由宿主决定，状态机不自行修改，只发 onValueChange。 */
    value?: unknown[]
    /** 非受控初始数据数组。 */
    defaultValue?: unknown[]
    /** 最少行数。到达该数值时删除把手不可按下。默认 0。 */
    min?: number
    /** 最多行数。到达该数值时新增把手不可按下。默认不限。 */
    max?: number
    /** 新增一行时创建一个空项。未提供时插入 null。 */
    createItem?: () => unknown
    /**
     * 是否显示换序把手。关闭（默认）时上移、下移与拖动三个把手一律收起。
     * 拖动把手只接指针（键盘与读屏用上移、下移），由适配器接上 sortable 的机器（见 fieldArrayDragProps）。
     */
    movable?: boolean
    /**
     * 不显示出来的名字，写成 aria-label 落在与字段标签同一个部件上（表格本体）；只在表格排布下生效。
     * 放进字段（字段接线）或渲染了 label 部件时名字以它们为准，aria-labelledby 盖过它。
     */
    ariaLabel?: string
    /** 禁用：新增、删除、换序三路都不可按下。 */
    disabled?: boolean
    /** 只读：行数不可修改（新增、删除、换序都不可按下），行内的控件仍由作者自行设置只读。 */
    readOnly?: boolean
    /** 校验失败标注：写在根与每一行上。 */
    invalid?: boolean
    /**
     * 排布，缺省 list。table 时 table 部件是 role=table，header 与各行是 role=row，item-label 是 rowheader，
     * item-cell 与 item-action 是 cell；行里的字段一格一个 item-cell，item-content 在这种排布下不用。
     * 不带键盘模型：Tab 依次经过每格里的控件与把手，与普通表单一致。窄屏横向滚动交给外层容器。
     */
    layout?: FieldArrayLayout
    /** 表格排布的各列，只在 table 排布下生效；顺序即列序。 */
    columns?: FieldArrayColumn[]
    /**
     * 整份数组的表单字段名。嵌套在 Form 中时会自动接入其值、规则、错误与校验真源；
     * 每一行经 `item.name` 获得显式数组 FormPath，不拼接字符串下标。
     */
    name?: FormPath
    translations?: Partial<FieldArrayTranslations>
    onValueChange?: (details: FieldArrayValueChangeDetails) => void
  }
  context: {
    /** 数据数组。受控（value 提供）时 cell 直读 prop，写入只发 onValueChange 不修改内部值。 */
    value: unknown[]
    /**
     * 与 value 一一对应的行序号，只随增删换序变化，不随行内数据变化。
     * 宿主的行数据可能没有 id、可能重复、也可能每次改动都更换新对象，
     * 因此身份只能由组件自行分配，跟随增删换序这套动作。
     */
    keys: string[]
    /**
     * 按压通道：Space / Enter 或触屏手指按下到松开之间正被按住的那一个把手，该部件投影 data-pressed；
     * 没有按住时为 null。抬起、失焦、指针取消，或按住的把手随行换位 / 离场时即撤下。
     */
    pressed: FieldArrayPressedKey | null
    /** 列表动效已经接到根节点上；接上之前根节点带 data-instant，首帧的行一律不播进场。 */
    listTracked: boolean
    /**
     * 表格排布横向滚动离两端：atStart 贴着起始端、atEnd 贴着末端；不滚动或列表排布时两端都贴着。
     * 钉在两侧的行头与把手只在确有内容被压住时画分隔线。
     */
    scrollEdges: { atStart: boolean, atEnd: boolean }
  }
  computed: Record<string, never>
  refs: {
    /** 行所在的容器（root 部件），列表动效在它上面盯行的到达、离场与换位；由三端适配器接线。 */
    getRootEl: () => HTMLElement | null
    /** 下一个行序号的流水号。 */
    keySeq: number
    /** 已计算完成、等待 value 落地的序号。 */
    pending: FieldArrayPendingKeys | null
    /** 最近祖先 Form 的服务，仅由三端适配器接线，不是公开 prop。 */
    form: Service<FormSchema> | null
    /**
     * 最近一次结构改动是拖动放下的换序：放下后各行滑进新位置归拖动那一套（sortable 的归位与换位），
     * 列表动效这一批不再补偿换位，免得同一段位移播两遍。
     */
    dropped: boolean
  }
  state: 'idle'
  event:
    /** 整份替换（公开 API 与受控写回都经过它）。 */
    | { type: 'VALUE.SET', value: unknown[] }
    /**
     * 新增一行：index 缺省即追加在末尾，给了就插在那个位置（夹到 0 到行数之间）；
     * item 给了就用它的 value 作这一行的数据，缺省由 createItem 造（没给工厂即 null）。
     */
    | { type: 'ITEM.ADD', index?: number, item?: { value: unknown } }
    /** 删除某一行；restoreFocus 为真时把焦点移到接位的行上。 */
    | { type: 'ITEM.REMOVE', index: number, restoreFocus?: boolean }
    /**
     * 把某一行移到另一个位置；restoreFocus 为真时焦点随该行移动。drag 为真时是拖动放下：
     * 各行滑进新位置由拖动那一套负责，列表动效这一次不补偿换位。
     */
    | { type: 'ITEM.MOVE', from: number, to: number, restoreFocus?: boolean, drag?: boolean }
    | { type: 'FORM.RESET' }
    /**
     * 按压通道（shared/press）：某个把手被 Space / Enter 或触屏按住，key 说的是哪一个；
     * disabled 是该把手当下按不动（到上下限、首末行、整体禁用 / 只读），由 connect 随事件带来。
     */
    | { type: 'PRESS.START', key: FieldArrayPressedKey, disabled?: boolean }
    /** 按住的把手抬起、失焦或指针取消；只收自己那一下。 */
    | { type: 'PRESS.END', key: FieldArrayPressedKey }
    /** 列表动效接上了根节点（机器自己发）。 */
    | { type: 'LIST.TRACKED' }
  tag: never
  guard: 'canAdd' | 'canRemove' | 'canMove' | 'canPress'
  action: 'setValue' | 'addItem' | 'removeItem' | 'moveItem' | 'syncKeys' | 'resetToDefault' | 'startPress' | 'endPress' | 'releasePress' | 'releaseWhenInert' | 'markListTracked'
  effect: 'trackListMotion' | 'trackScrollEdges'
}

export interface FieldArrayApi<T extends PropTypes = PropTypes> {
  value: unknown[]
  /** 逐行的读侧投影，含渲染用的 key。 */
  items: FieldArrayItem[]
  count: number
  empty: boolean
  disabled: boolean
  readOnly: boolean
  invalid: boolean
  movable: boolean
  /** 正有一行被拖动把手拖着（接了拖动时才可能为真）。 */
  dragging: boolean
  layout: FieldArrayLayout
  /** 表格排布的各列，原样取自 columns；没给时为空数组。 */
  columns: FieldArrayColumn[]
  /** 已到下限：再删除会少于 min。 */
  atMin: boolean
  /** 已到上限：再新增会多于 max。 */
  atMax: boolean
  canAdd: boolean
  /** 解析后的文案：作者给的 translations 盖在当前语言包上。 */
  translations: FieldArrayTranslations
  /** 整份替换，不受 min / max 约束。 */
  setValue: (next: unknown[]) => void
  /** 在末尾追加一行，数据由 createItem 造；受 max 约束。 */
  add: () => void
  /**
   * 在 index 处插入一行（夹到 0 到行数之间，等于行数即追加），原来在这个位置及之后的行往后挪；受 max 约束。
   * 给了 item 就用它作这一行的数据，缺省（undefined）由 createItem 造。嵌在 Form 里时，后面各行的值、规则与错误随之后移。
   */
  insert: (index: number, item?: unknown) => void
  remove: (index: number) => void
  move: (from: number, to: number) => void
  moveUp: (index: number) => void
  moveDown: (index: number) => void
  getRootProps: () => T['element']
  /**
   * 表格排布的表格本体：role=table，表头与各行放在它里面，新增把手仍在 root 里、排在它之后。
   * 名字来自外层字段的标签（经字段接线），不在字段里时由作者在它上面写 aria-label。列表排布下不带角色。
   */
  getTableProps: () => T['element']
  /** 表头行：role=row，第 1 行。列表排布下收起。 */
  getHeaderProps: () => T['element']
  /** 列头：role=columnheader，value 是列 id。列表排布下收起。 */
  getColumnHeaderProps: (column: FieldArrayColumnProps) => T['element']
  getItemProps: (item: FieldArrayItemProps) => T['element']
  /** 行里的一格：role=cell，value 是列 id，落在这一列的轨道上。只在表格排布下使用。 */
  getItemCellProps: (cell: FieldArrayItemCellProps) => T['element']
  /** 行前的行号或名目：纯标注，不与行内的控件建立 for 关联。 */
  getItemLabelProps: (item: FieldArrayItemProps) => T['element']
  getItemContentProps: (item: FieldArrayItemProps) => T['element']
  getItemActionProps: (item: FieldArrayItemProps) => T['element']
  getAddTriggerProps: () => T['button']
  getItemDeleteTriggerProps: (item: FieldArrayItemProps) => T['button']
  getMoveUpTriggerProps: (item: FieldArrayItemProps) => T['button']
  getMoveDownTriggerProps: (item: FieldArrayItemProps) => T['button']
  /**
   * 拖动把手：按住拖这一行换位，只接指针，不占 Tab 位、对读屏隐藏（键盘与读屏用上移、下移）。
   * 不换序时与上移、下移一起收起。适配器没接拖动时它只是一颗收起的空把手。
   */
  getItemDragTriggerProps: (item: FieldArrayItemProps) => T['button']
}
