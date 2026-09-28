/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 truncate 类型契约。

import type { MachineSchema, PropTypes } from '@xihan-ui/core'

export interface TruncateOpenChangeDetails {
  /** 当前是否已展开全文。 */
  open: boolean
}

/** 省略号落在哪：end 收在末尾，middle 收在中间、首尾两段都留着。 */
export type TruncatePosition = 'end' | 'middle'

export interface TruncateOverflowChangeDetails {
  /** 截断版本是否裁掉了内容。 */
  overflowing: boolean
}

/** 判定溢出所需的四个实测量，单位 px。 */
export interface TruncateMetrics {
  /** 内容在行内轴上的完整长度。 */
  scrollWidth: number
  /** 盒子在行内轴上可见的部分。 */
  clientWidth: number
  /** 内容在块轴上的完整长度。 */
  scrollHeight: number
  /** 盒子在块轴上可见的部分。 */
  clientHeight: number
}

/** 适配器在挂载前填入的 DOM 取值器。 */
export interface TruncateRefs {
  /** 截断文字的盒子：溢出与文字都由它测量。 */
  getRootEl: () => HTMLElement | null
}

export interface TruncateSchema extends MachineSchema {
  props: {
    /** 截断行数，1 为单行，默认 1。 */
    lines?: number
    /**
     * 省略号落在哪，默认 end。middle 只对单行生效：首尾两段各占一半宽度，中间收一个省略号，
     * 适合文件名、路径这类两头都要看得见的文字；多行时按 end 处理。
     * 中间省略按整段纯文字排，盒内带标记的内容会被当成它的文字。
     */
    position?: TruncatePosition
    /** 旁边放一颗展开 / 收起全文的按钮（trigger 部件），真被裁了才出现。 */
    expandable?: boolean
    /** 受控展开；未提供时非受控。 */
    open?: boolean
    /** 非受控时的初始展开态。 */
    defaultOpen?: boolean
    /** 实际裁掉内容时才把整段文字交给平台的原生提示。 */
    tooltip?: boolean
    /** open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 */
    onOpenChange?: (details: TruncateOpenChangeDetails) => void
    /** 测得的溢出结论翻转时回调。 */
    onOverflowChange?: (details: TruncateOverflowChangeDetails) => void
    translations?: Partial<TruncateTranslations>
  }
  context: {
    /** 截断版本是否裁掉了内容；尚未测量时为 false。 */
    overflowing: boolean
    /** 盒子中的文字，连续空白已压缩为一个空格。 */
    text: string
  }
  computed: Record<string, never>
  refs: TruncateRefs
  /** closed 截断；open 展开全文。 */
  state: 'closed' | 'open'
  event:
    /** 重新测量一次。观察器与作者共用该入口。 */
    | { type: 'MEASURE' }
    /** 切换展开。 */
    | { type: 'TOGGLE' }
    // 受控回写：宿主改 open 后由 watch 派发，无条件跳转、不再通知
    | { type: 'CONTROLLED.OPEN' }
    | { type: 'CONTROLLED.CLOSE' }
  tag: never
  guard: 'isOpenControlled'
  action: 'measure' | 'measureSoon' | 'invokeOnOpen' | 'invokeOnClose' | 'syncOpen'
  effect: 'trackOverflow'
}

export interface TruncateApi<T extends PropTypes = PropTypes> {
  /** 当前是否已展开全文。 */
  open: boolean
  /** 截断版本是否裁掉了内容。作者据此决定是否附加提示。 */
  overflowing: boolean
  /** 程序化展开 / 收起，与点击走同一路径。 */
  setOpen: (next: boolean) => void
  /** 手动测量一次，用于观察器无法感知的布局变化。 */
  measure: () => void
  /** 展开按钮此刻该显示的文字：收着时是展开那一句，铺开时是收起那一句。 */
  triggerLabel: string
  getRootProps: () => T['element']
  /** 展开 / 收起全文的按钮：没开 expandable 或没东西可展开时收起不占位。 */
  getTriggerProps: () => T['button']
}

/** 展开按钮的文案，默认英文。 */
export interface TruncateTranslations {
  /** 收着时按钮上的字。 */
  expand: string
  /** 铺开时按钮上的字。 */
  collapse: string
}
