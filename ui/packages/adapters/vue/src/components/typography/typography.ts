import type { Size, Tone } from '@xihan-ui/core'
import type { TypographyLevel, TypographyProps, TypographyVariant } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import { connectTypography } from '@xihan-ui/headless'
import { computed, defineComponent, h } from 'vue'
import { withXhConfig } from '../../config/config'
import { vueNormalize } from '../../runtime/normalize-props'
import { provideTypography, useTypographyContext } from './context'

/** 正文块容器，管段间距与最大行宽；缺省值由 connect 给出，这里一律 default: undefined */
export const XhTypographyRoot = defineComponent({
  name: 'XhTypographyRoot',
  props: {
    size: { type: String as PropType<Size>, default: undefined },
  },
  setup(props, { slots }) {
    const api = computed(() => connectTypography(withXhConfig('typography', props) as TypographyProps, vueNormalize))
    provideTypography({ api })
    return () => h('div', api.value.getRootProps() as Record<string, unknown>, slots.default?.())
  },
})

/**
 * 标题：level 只换字号档位，不决定标签。
 * as 决定渲染成哪个标签，默认 p；要进文档大纲就写 as="h2"。
 */
export const XhTypographyHeading = defineComponent({
  name: 'XhTypographyHeading',
  props: {
    level: { type: [Number, String] as PropType<TypographyLevel | string>, default: undefined },
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
 * 行内文字：variant 换形态，tone 换语气色。
 * as 决定渲染成哪个标签，默认 span；要 code / strong 的原生语义就自己写上去。
 */
export const XhTypographyText = defineComponent({
  name: 'XhTypographyText',
  props: {
    tone: { type: String as PropType<Tone>, default: undefined },
    variant: { type: String as PropType<TypographyVariant>, default: undefined },
    as: { type: String, default: 'span' },
  },
  setup(props, { slots }) {
    const ctx = useTypographyContext()
    return () => h(
      props.as,
      ctx.api.value.getTextProps({ tone: props.tone, variant: props.variant }) as Record<string, unknown>,
      slots.default?.(),
    )
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
