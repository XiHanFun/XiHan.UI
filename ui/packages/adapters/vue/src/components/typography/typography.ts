/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 typography 相关实现。

import type { Size, Tone } from '@xihan-ui/core'
import type { TypographyAlign, TypographyLevel, TypographyProps, TypographyVariant, TypographyWeight } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import { connectTypography } from '@xihan-ui/headless'
import { computed, defineComponent, h } from 'vue'
import { withXhConfig } from '../../config/config'
import { vueNormalize } from '../../runtime/normalize-props'
import { provideTypography, useTypographyContext } from './context'

/** 正文块容器，管理段间距与最大行宽；默认值由 connect 给出；普通类型省略 default，Boolean 显式保留 undefined */
export const XhTypographyRoot = defineComponent({
  name: 'XhTypographyRoot',
  props: {
    size: { type: String as PropType<Size> },
    align: { type: String as PropType<TypographyAlign> },
    weight: { type: String as PropType<TypographyWeight> },
  },
  setup(props, { slots }) {
    // withXhConfig 只能在 setup 期调，连接层在渲染期读这份代理
    const configured = withXhConfig('typography', props)
    const api = computed(() => connectTypography(configured as TypographyProps, vueNormalize))
    provideTypography({ api })
    return () => h('div', api.value.getRootProps() as Record<string, unknown>, slots.default?.())
  },
})

/**
 * 标题：level 只切换字号档位，不决定标签。
 * as 决定渲染为哪个标签，默认 p；需要进入文档大纲时写 as="h2"。
 */
export const XhTypographyHeading = defineComponent({
  name: 'XhTypographyHeading',
  props: {
    level: { type: [Number, String] as PropType<TypographyLevel | string> },
    as: { type: String, default: 'p' },
  },
  setup(props, { slots }) {
    const ctx = useTypographyContext()
    return () => h(
      props.as,
      ctx.api.value.getHeadingProps({ level: props.level }) as Record<string, unknown>,
      slots.default?.(),
    )
  },
})

export const XhTypographyParagraph = defineComponent({
  name: 'XhTypographyParagraph',
  setup(_, { slots }) {
    const ctx = useTypographyContext()
    return () => h('p', ctx.api.value.getParagraphProps() as Record<string, unknown>, slots.default?.())
  },
})

/**
 * 行内文字：variant 切换形态，tone 切换语气色，weight 切换字重。
 * as 决定渲染为哪个标签，默认 span；需要 code / strong 的原生语义时自行写明。
 */
export const XhTypographyText = defineComponent({
  name: 'XhTypographyText',
  props: {
    tone: { type: String as PropType<Tone> },
    variant: { type: String as PropType<TypographyVariant> },
    weight: { type: String as PropType<TypographyWeight> },
    as: { type: String, default: 'span' },
  },
  setup(props, { slots }) {
    const ctx = useTypographyContext()
    return () => h(
      props.as,
      ctx.api.value.getTextProps({ tone: props.tone, variant: props.variant, weight: props.weight }) as Record<string, unknown>,
      slots.default?.(),
    )
  },
})

/**
 * 富文本容器：外来的 HTML（Markdown 渲染结果）铺入其中，样式按标签给出。
 * as 决定渲染为哪个标签，默认 div。
 */
export const XhTypographyProse = defineComponent({
  name: 'XhTypographyProse',
  props: {
    as: { type: String, default: 'div' },
  },
  setup(props, { slots }) {
    const ctx = useTypographyContext()
    return () => h(props.as, ctx.api.value.getProseProps() as Record<string, unknown>, slots.default?.())
  },
})

// href、target、rel 由作者写，这里只给身份
export const XhTypographyLink = defineComponent({
  name: 'XhTypographyLink',
  setup(_, { slots }) {
    const ctx = useTypographyContext()
    return () => h('a', ctx.api.value.getLinkProps() as Record<string, unknown>, slots.default?.())
  },
})
