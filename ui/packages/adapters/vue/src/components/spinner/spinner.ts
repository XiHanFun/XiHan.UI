/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 spinner 相关实现。

import type { Size, Tone } from '@xihan-ui/core'
import type { SpinnerProps, SpinnerTranslations, SpinnerVariant } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import { defineComponent, h } from 'vue'
import { withXhConfig } from '../../config/config'
import { provideSpinner, useSpinnerContext } from './context'
import { useSpinner } from './use-spinner'

/** 旋转图形由皮肤绘制在 root 的伪元素上，这里不生成任何子节点。 */
export const XhSpinner = defineComponent({
  name: 'XhSpinner',
  // 缺省值由 connect 给出；普通类型省略 default，Boolean 显式保留 undefined
  props: {
    label: { type: String },
    size: { type: String as PropType<Size> },
    variant: { type: String as PropType<SpinnerVariant> },
    tone: { type: String as PropType<Tone> },
    translations: { type: Object as PropType<Partial<SpinnerTranslations>> },
  },
  setup(props, { slots }) {
    const ctx = useSpinner(withXhConfig('spinner', props) as SpinnerProps)
    provideSpinner(ctx)
    return () => h('span', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.())
  },
})

/** 可见文案节点。作者未写内容时显示解析后的 label，屏幕上看到的与读屏朗读的因此是同一段文字。 */
export const XhSpinnerLabel = defineComponent({
  name: 'XhSpinnerLabel',
  setup(_, { slots }) {
    const ctx = useSpinnerContext()
    return () => h(
      'span',
      ctx.api.value.getLabelProps() as Record<string, unknown>,
      slots.default?.() ?? ctx.api.value.label,
    )
  },
})
