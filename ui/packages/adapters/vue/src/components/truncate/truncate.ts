/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 truncate 相关实现。

import type { TruncateApi, TruncatePosition, TruncateSchema, TruncateTranslations } from '@xihan-ui/headless'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { defineComponent, h } from 'vue'
import { withXhConfig } from '../../config/config'
import { useTruncate } from './use-truncate'

type TruncateProps = TruncateSchema['props']

/** 默认插槽的载荷：展开态与测得的是否溢出，以及展开与重新测量的方法。 */
export type TruncateSlotProps = Pick<TruncateApi, 'open' | 'overflowing' | 'setOpen' | 'measure'>

/** trigger 插槽的载荷：展开态与按钮此刻的缺省文案。 */
export type TruncateTriggerSlotProps = Pick<TruncateApi, 'open' | 'triggerLabel'>

/**
 * 一段受限的文字：单行收为省略号，多行按行数裁剪。
 * 是否溢出由测量得出，写在 data-overflowing 上，也经默认插槽的 overflowing 交出：
 * 是否再附加提示由作者决定，这里不处理浮层。
 * 开了 expandable 时在文字盒子之后铺一颗展开按钮，两个节点并排交给外层排版，透传属性落在文字盒子上。
 */
export const XhTruncate = defineComponent({
  name: 'XhTruncate',
  inheritAttrs: false,
  // 缺省值由机器与 connect 决定；普通类型省略 default，Boolean 显式保留 undefined
  props: {
    lines: { type: Number },
    /** 省略号落在哪：end 末尾、middle 中间（只对单行生效），默认 end。 */
    position: { type: String as PropType<TruncatePosition> },
    expandable: Boolean,
    open: { type: Boolean, default: undefined },
    defaultOpen: Boolean,
    tooltip: Boolean,
    translations: { type: Object as PropType<Partial<TruncateTranslations>> },
  },
  // open-change 携带 { open }，update:open 携带裸布尔
  emits: {
    'open-change': (_details: PayloadOf<TruncateProps, 'onOpenChange'>) => true,
    'update:open': (_open: PayloadOf<TruncateProps, 'onOpenChange'>['open']) => true,
    'overflow-change': (_details: PayloadOf<TruncateProps, 'onOverflowChange'>) => true,
  },
  slots: Object as SlotsType<{
    default?: (props: TruncateSlotProps) => VNode[]
    /** 展开按钮里的内容，缺省是随展开态切换的那一句文案。 */
    trigger?: (props: TruncateTriggerSlotProps) => VNode[]
  }>,
  setup(props, { slots, emit, attrs }) {
    const ctx = useTruncate(withXhConfig('truncate', props) as TruncateProps, {
      onOpenChange: (details) => {
        emit('open-change', details)
        emit('update:open', details.open)
      },
      onOverflowChange: details => emit('overflow-change', details),
    })
    return () => {
      const api = ctx.api.value
      const text = h('div', {
        ...attrs,
        ...api.getRootProps() as Record<string, unknown>,
        ref: (el: unknown) => { ctx.rootRef.value = el as HTMLElement },
      }, slots.default?.({
        open: api.open,
        overflowing: api.overflowing,
        setOpen: api.setOpen,
        measure: api.measure,
      }))
      if (!props.expandable)
        return text
      const trigger = h(
        'button',
        api.getTriggerProps() as Record<string, unknown>,
        slots.trigger?.({ open: api.open, triggerLabel: api.triggerLabel }) ?? api.triggerLabel,
      )
      return [text, trigger]
    }
  },
})
