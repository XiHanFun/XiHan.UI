/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 多选控件的已选标签：Select、Combobox、TreeSelect、Cascader 共用同一套取数与套 tag 的做法。
// 这里只算值、给 tag 的连接层；data-value / data-count 这类身份属性由各组件在自己的 connect 里写。

import type { ControlVariant, NormalizeProps, PropTypes, Size, Tone } from '@xihan-ui/core'
import type { TagApi } from '../tag'
import { trackListMotion } from '@xihan-ui/core'
import { connectStaticTag, tagVariantForControl } from '../tag'

/** 未指定 maxTagCount 时最多摆几枚标签，其余折进 +N 那一枚。 */
export const SELECTION_TAG_DEFAULT_MAX = 3

/**
 * 标签行里的一枚已选值标签（tag 的 root，带 data-value；+N 那一枚带 data-count 不算），
 * 外加 Web Components 作者刚放进来、尚未接线的标签节点。列表动效只在标签行里认它们。
 * 不带组合子：刚被移除的节点已经脱离文档，带父级约束的选择器匹配不上它，离场就认不出来。
 */
export const SELECTION_TAG_SELECTOR = '[data-scope="tag"][data-part="root"][data-value], [data-xh-part="tag"]'

/**
 * 标签行的到达、离场与换位：首帧就在的标签直接呈现，之后新选的播进场，取消选中的在原处播完退场，
 * 其余标签滑到新位置。没有标签行（单选或作者没写）就不接。
 * React 的祖先 ref 在子组件 layout effect 之后才附着，延到提交后的微任务再取，仍在首帧绘制之前。
 */
export function trackSelectionTagMotion(options: {
  flush: (fn: () => void) => void
  /** 取标签行；纯逻辑环境（无 DOM）取不到，也就不接。 */
  list: () => HTMLElement | null | undefined
  /** 接上之后调用：机器据此撤掉标签行上的 data-instant，之后到达的标签才播进场。 */
  onTracked?: () => void
}): () => void {
  let disposed = false
  let stop: (() => void) | undefined
  options.flush(() => {
    queueMicrotask(() => {
      const list = options.list()
      if (disposed || !list)
        return
      stop = trackListMotion(list, { item: SELECTION_TAG_SELECTOR })
      options.onTracked?.()
    })
  })
  return () => {
    disposed = true
    stop?.()
  }
}

/** 一枚已选标签：key 是它代表的选中值（级联是整条路径编码后的键），label 是显示文本。 */
export interface SelectionTagEntry {
  key: string
  label: string
}

export interface SelectionTagsOptions {
  /** 全部选中项，按选中先后排列；截断只看个数。 */
  entries: readonly SelectionTagEntry[]
  /** 最多显示几枚；未提供时取 SELECTION_TAG_DEFAULT_MAX，负数按 0 处理。 */
  maxTagCount: number | undefined
  /** +N 那一枚的文字，接收折起的个数；未提供时写 `+N`。 */
  overflowTag: ((count: number) => string) | undefined
  /** 删除钮的可及名，接收标签文字；未提供时写 `Delete <label>`。 */
  deleteItem: ((label: string) => string) | undefined
  /** 控件的面：标签的形态由它派生（淡底面里摆描边标签，其余摆淡底标签）。 */
  variant: ControlVariant
  tone: Tone | undefined
  size: Size | undefined
  disabled: boolean
  readOnly: boolean
  /** 删除钮按下：摘掉 key 对应的选中项。只读与禁用由 tag 自己挡在钮上。 */
  onDelete: (key: string) => void
}

export interface SelectionTags<T extends PropTypes> {
  /** 可见的那几枚，与 entries 同序。 */
  visible: SelectionTagEntry[]
  /** 被折起的个数。 */
  overflowCount: number
  /** +N 那一枚显示的文字；没有折起时为空串。 */
  overflowText: string
  /** 代表 key 的那一枚：tag 的连接层，root 是标签本体，close-trigger 是删除钮。 */
  tag: (key: string) => TagApi<T>
  /** +N 那一枚：不可关闭，没有折起时是收起态。 */
  overflow: TagApi<T>
}

/**
 * 标签与 +N 套的是库里的 tag：语气、尺寸、禁用与只读从控件传下去，形态按控件的面派。
 * 显隐受控在这里——标签在不在只看选中值在不在，不建机器；+N 没有折起时就是收起态，hidden 由 tag 给。
 */
export function connectSelectionTags<T extends PropTypes>(
  options: SelectionTagsOptions,
  normalize: NormalizeProps<T>,
): SelectionTags<T> {
  const max = Math.max(0, options.maxTagCount ?? SELECTION_TAG_DEFAULT_MAX)
  const visible = options.entries.slice(0, max)
  const overflowCount = options.entries.length - visible.length
  const overflowText = overflowCount > 0
    ? (options.overflowTag ?? ((count: number) => `+${count}`))(overflowCount)
    : ''
  const axes = {
    variant: tagVariantForControl(options.variant),
    tone: options.tone,
    size: options.size,
    disabled: options.disabled,
    readOnly: options.readOnly,
  }
  const labelOf = (key: string): string => options.entries.find(entry => entry.key === key)?.label ?? key
  const deleteLabel = options.deleteItem ?? ((label: string) => `Delete ${label}`)

  return {
    visible,
    overflowCount,
    overflowText,
    // 值标签一枚一份，关闭钮即删除钮：受控 open 下按它只发 onOpenChange，摘值交回宿主；
    // 摆在按钮里时宿主不渲那颗钮（按钮不能套按钮），root 的产出不看 closable
    tag: key => connectStaticTag(
      {
        ...axes,
        closable: true,
        open: true,
        translations: { close: deleteLabel(labelOf(key)) },
        onOpenChange: ({ open }) => {
          if (!open)
            options.onDelete(key)
        },
      },
      { get: () => true, set: () => {} },
      normalize,
    ),
    overflow: connectStaticTag(
      { ...axes, closable: false, open: overflowCount > 0 },
      { get: () => overflowCount > 0, set: () => {} },
      normalize,
    ),
  }
}
