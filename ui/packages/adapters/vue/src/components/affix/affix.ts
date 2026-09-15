/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 affix 相关实现。

import type { AffixApi, AffixSchema } from '@xihan-ui/headless'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { defineComponent, h } from 'vue'
import { provideAffix, useAffixContext } from './context'
import { useAffix } from './use-affix'

type AffixProps = AffixSchema['props']

/** 默认插槽的载荷：当前是否处于吸附状态。 */
export type AffixRootSlotProps = Pick<AffixApi, 'affixed'>

/** 根节点是占位盒：content 吸附时脱离文档流，它留在原位撑住该空间。 */
export const XhAffixRoot = defineComponent({
  name: 'XhAffixRoot',
  // 缺省值由机器与 connect 决定；普通类型省略 default，Boolean 显式保留 undefined
  props: {
    offsetTop: { type: Number },
    offsetBottom: { type: Number },
    /** 滚动容器，默认即整页滚动；经 refs 交给观察器。 */
    target: { type: Object as PropType<HTMLElement | null> },
  },
  emits: {
    'affix-change': (_details: PayloadOf<AffixProps, 'onAffixChange'>) => true,
  },
  slots: Object as SlotsType<{
    default?: (props: AffixRootSlotProps) => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const notify: AffixProps['onAffixChange'] = details => emit('affix-change', details)
    // 传响应式 props 对象本身而非快照，供机器每次读时重新展开
    const ctx = useAffix(props as AffixProps, notify, () => props.target ?? null)
    provideAffix(ctx)
    return () => h('div', {
      ...ctx.api.value.getRootProps() as Record<string, unknown>,
      ref: (el: unknown) => { ctx.rootRef.value = el as HTMLElement },
    }, slots.default?.({ affixed: ctx.api.value.affixed }))
  },
})

/** 吸附时脱离常规流固定在可视区边缘，位置由状态机测量后写入内联样式。 */
export const XhAffixContent = defineComponent({
  name: 'XhAffixContent',
  setup(_, { slots }) {
    const ctx = useAffixContext()
    return () => h('div', ctx.api.value.getContentProps() as Record<string, unknown>, slots.default?.())
  },
})
