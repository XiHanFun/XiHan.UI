/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 spinner 相关实现。

import type { Orientation, Size, Tone } from '@xihan-ui/core'
import type { SpinnerProps, SpinnerTranslations, SpinnerVariant } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import type { PropsOf } from '../../runtime/props-of'
import { defineComponent, h } from 'vue'
import { withXhConfig } from '../../config/config'
import { provideSpinner, useSpinnerContext } from './context'
import { useSpinner } from './use-spinner'

/**
 * 旋转图形由皮肤绘制在 root 的伪元素上，单独使用时不生成任何子节点。
 * overlay 时铺成遮罩形态：container 包住 content（默认插槽）与 mask，root 放在 mask 里居中；
 * 写了 label 就在转圈下方显示这段文案。
 */
export const XhSpinner = defineComponent({
  name: 'XhSpinner',
  // 缺省值由 connect 给出；普通类型省略 default，Boolean 显式保留 undefined
  props: {
    label: { type: String },
    size: { type: String as PropType<Size> },
    variant: { type: String as PropType<SpinnerVariant> },
    tone: { type: String as PropType<Tone> },
    /** 转圈与配文的排布：horizontal 并排 / vertical 转圈在上、配文在下；缺省单独使用并排、遮罩形态竖排。 */
    orientation: { type: String as PropType<Orientation> },
    /** 挂载后等多少毫秒才露面，默认 0；加载在这之前结束时转圈从头到尾不出现。 */
    delay: { type: Number },
    /** 是否在等待，缺省 true；false 时转圈藏起，遮罩形态下撤掉遮罩。 */
    loading: { type: Boolean, default: undefined },
    /** 遮罩形态：包住默认插槽里的内容，等待时盖一层遮罩。 */
    overlay: Boolean,
    /** 遮罩形态下盖住整个视口。 */
    fullscreen: Boolean,
    translations: { type: Object as PropType<Partial<SpinnerTranslations>> },
  },
  setup(props, { slots }) {
    const ctx = useSpinner(withXhConfig('spinner', props) as SpinnerProps)
    provideSpinner(ctx)
    return () => {
      const api = ctx.api.value
      if (!props.overlay)
        return h('span', api.getRootProps(), slots.default?.())
      return h('div', api.getContainerProps(), [
        h('div', api.getContentProps(), slots.default?.()),
        h('div', api.getMaskProps(), [
          h('span', api.getRootProps(), props.label ? [h('span', api.getLabelProps(), api.label)] : undefined),
        ]),
      ])
    }
  },
})

/** 可见文案节点。作者未写内容时显示解析后的 label，屏幕上看到的与读屏朗读的因此是同一段文字。 */
export const XhSpinnerLabel = defineComponent({
  name: 'XhSpinnerLabel',
  setup(_, { slots }) {
    const ctx = useSpinnerContext()
    return () => h(
      'span',
      ctx.api.value.getLabelProps(),
      slots.default?.() ?? ctx.api.value.label,
    )
  },
})

// 各组件接受的 props，与 React 同名
export type XhSpinnerProps = PropsOf<typeof XhSpinner>
export type XhSpinnerLabelProps = PropsOf<typeof XhSpinnerLabel>
