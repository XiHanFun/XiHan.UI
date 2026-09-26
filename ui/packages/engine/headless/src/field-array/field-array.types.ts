/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 field array 类型契约。

import type { MachineSchema, PropTypes, Service } from '@xihan-ui/core'
import type { FormPath, FormSchema } from '../form'

export interface FieldArrayValueChangeDetails {
  /** 变化后的整份数据数组，顺序即界面上从上到下的顺序。 */
  value: unknown[]
}

/**
 * 行内三个把手的读屏文案，默认英文。行号一律从 1 起，与用户看到的行序一致。
 * 新增把手不在此列：它没有行号，名字取自身内容。
 */
export interface FieldArrayTranslations {
  deleteItem: (index: number, count: number) => string
  moveUpTrigger: (index: number, count: number) => string
  moveDownTrigger: (index: number, count: number) => string
}

/**
 * 行的声明：行下标由作者在部件上声明，connect 据此产出属性。
 * connect 在 Vue 的 render 期求值，此时 DOM 尚不存在，不得反查 DOM。
 */
export interface FieldArrayItemProps {
  index: number
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
    /** 是否显示换序把手。关闭（默认）时两个换序把手一律收起。 */
    movable?: boolean
    /** 禁用：新增、删除、换序三路都不可按下。 */
    disabled?: boolean
    /** 只读：行数不可修改（新增、删除、换序都不可按下），行内的控件仍由作者自行设置只读。 */
    readOnly?: boolean
    /** 校验失败标注：写在根与每一行上。 */
    invalid?: boolean
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
  }
  state: 'idle'
  event:
    /** 整份替换（公开 API 与受控写回都经过它）。 */
    | { type: 'VALUE.SET', value: unknown[] }
    /** 在末尾追加一行。 */
    | { type: 'ITEM.ADD' }
    /** 删除某一行；restoreFocus 为真时把焦点移到接位的行上。 */
    | { type: 'ITEM.REMOVE', index: number, restoreFocus?: boolean }
    /** 把某一行移到另一个位置；restoreFocus 为真时焦点随该行移动。 */
    | { type: 'ITEM.MOVE', from: number, to: number, restoreFocus?: boolean }
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
  effect: 'trackListMotion'
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
  /** 已到下限：再删除会少于 min。 */
  atMin: boolean
  /** 已到上限：再新增会多于 max。 */
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
  getItemProps: (item: FieldArrayItemProps) => T['element']
  /** 行前的行号或名目：纯标注，不与行内的控件建立 for 关联。 */
  getItemLabelProps: (item: FieldArrayItemProps) => T['element']
  getItemContentProps: (item: FieldArrayItemProps) => T['element']
  getItemActionProps: (item: FieldArrayItemProps) => T['element']
  getAddTriggerProps: () => T['button']
  getItemDeleteTriggerProps: (item: FieldArrayItemProps) => T['button']
  getMoveUpTriggerProps: (item: FieldArrayItemProps) => T['button']
  getMoveDownTriggerProps: (item: FieldArrayItemProps) => T['button']
}
