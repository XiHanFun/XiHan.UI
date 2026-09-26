/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 anchor 类型契约。

import type { Direction, MachineSchema, Orientation, PropTypes, Size, Tone } from '@xihan-ui/core'
import type { LiquidIndicator } from '../shared/indicator'

/** 读屏文案，默认英文。 */
export interface AnchorTranslations {
  /** 根节点的 aria-label，用于区分页面上的多个 nav 地标。 */
  root: string
}

export interface AnchorValueChangeDetails {
  /** 当前激活的锚点 id；没有区块越过判定线时为 null。 */
  value: string | null
}

/**
 * 链接指向的区块，由作者在部件上声明。
 * connect 据此产出属性，不反查 DOM：它在 Vue 的 render 期求值，此时 DOM 尚不存在。
 */
export interface AnchorLinkProps {
  /** 目标区块的元素 id，href 由 connect 派生为 `#id`。 */
  value: string
}

/** 指示条相对 list 的位置与尺寸（px），起始缘按逻辑方向计算。 */
export interface AnchorIndicatorRect {
  blockStart: number
  blockSize: number
  inlineStart: number
  inlineSize: number
}

/** 结算当前区块的输入：一个目标区块测得的顶边位置。 */
export interface AnchorTargetOffset {
  /** 目标区块的元素 id。 */
  value: string
  /** 区块顶边相对判定原点（滚动容器视口顶边）的距离，可以为负。 */
  top: number
}

/** 适配器在挂载前填入的 DOM 取值器。 */
export interface AnchorRefs {
  /** 判定线所依附的滚动容器，返回 null 即挂在窗口上。 */
  getScrollEl: () => HTMLElement | null
  /** 链接集合的查询容器（list），同时是指示条定位的参照系。 */
  getListEl: () => HTMLElement | null
  /** 液态档的双沿指示器：由效应建好放进来，量到的落点交给它。 */
  liquidIndicator?: LiquidIndicator | null
}

export interface AnchorSchema extends MachineSchema {
  props: {
    /** 当前激活的锚点 id，给定即受控。 */
    value?: string | null
    defaultValue?: string | null
    /** 目标区块的 id 清单，按文档序提供；未提供时按渲染出的 link 查询。 */
    collection?: readonly string[]
    /** 判定线距滚动容器视口顶边的距离（px），默认 0。 */
    offset?: number
    /** 压线判定的容差（px），默认 1；区块顶边落在判定线下方该距离内仍视为越过。 */
    bounds?: number
    /** 点击链接时平滑滚动到目标，默认 false。 */
    smooth?: boolean
    /** 文字方向，作用于排版与指示条的起始缘。 */
    dir?: Direction
    /** 列表轴向，默认 vertical，只影响样式。 */
    orientation?: Orientation
    translations?: Partial<AnchorTranslations>
    /** 语气：brand / neutral / success / warning / danger / info，决定使用哪族颜色。 */
    tone?: Tone
    /** 尺寸：sm / md / lg。 */
    size?: Size
    /** value 变化意图回调。 */
    onValueChange?: (details: AnchorValueChangeDetails) => void
  }
  context: {
    /** 当前激活的锚点 id。 */
    value: string | null
    /** 指示条的测量结果；没有激活项或无法测量时为 null。 */
    indicator: AnchorIndicatorRect | null
    /** 液态档下指示器沿主轴比目标长出的比例，皮肤据它在另一个方向上压扁；标准档与停稳时为 0。 */
    indicatorStretch: number
    /** 按压通道：Space / Enter 或触屏按住的链接 value。抬起、失焦或指针取消即清空，与激活项互相独立。 */
    pressedValue: string | null
  }
  computed: Record<string, never>
  refs: AnchorRefs
  /** scrolling 是平滑滚动进行中的短暂锁定，其间不采信观察器结果。 */
  state: 'idle' | 'scrolling'
  event:
    /** 观察器结算的当前区块；null 表示没有区块越过判定线。 */
    | { type: 'SPY.RESOLVE', value: string | null }
    /** 用户点击了某条链接。 */
    | { type: 'LINK.CLICK', value: string }
    /** 程序化改写。 */
    | { type: 'VALUE.SET', value: string | null }
    /** 平滑滚动停稳：逐帧读到的滚动位置不再变。 */
    | { type: 'SCROLL.SETTLE' }
    /** 链接被 Space / Enter 或触屏按住。 */
    | { type: 'PRESS.START', value: string }
    /** 按住的链接抬起、失焦或指针取消；只松开 value 对应的那一条。 */
    | { type: 'PRESS.END', value: string }
  tag: never
  guard: 'isSmooth' | 'isTargetReached' | 'canPress'
  action: 'setValue' | 'scrollToTarget' | 'measureIndicator' | 'startPress' | 'endPress'
  effect: 'trackScroll' | 'trackIndicatorLayout' | 'waitForScrollSettle' | 'trackLiquidIndicator'
}

export interface AnchorApi<T extends PropTypes = PropTypes> {
  /** 当前激活的锚点 id；没有区块越过判定线时为 null。 */
  value: string | null
  isActive: (value: string) => boolean
  setValue: (next: string | null) => void
  getRootProps: () => T['element']
  getListProps: () => T['element']
  getItemProps: () => T['element']
  getLinkProps: (props: AnchorLinkProps) => T['element']
  getLinkTextProps: () => T['element']
  getIndicatorProps: () => T['element']
}
