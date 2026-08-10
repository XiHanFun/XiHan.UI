import type { ResultProps, ResultStatus } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import { connectResult } from '@xihan-ui/headless'
import { computed, defineComponent, h } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { provideResult, useResultContext } from './context'

/** 根节点渲染为 div，缺省值由 connect 给出，这里一律 default: undefined */
export const XhResultRoot = defineComponent({
  name: 'XhResultRoot',
  props: {
    status: { type: String as PropType<ResultStatus>, default: undefined },
    size: { type: String as PropType<'sm' | 'md' | 'lg'>, default: undefined },
  },
  setup(props, { slots }) {
    const api = computed(() => connectResult(props as ResultProps, vueNormalize))
    provideResult({ api })
    return () => h('div', api.value.getRootProps() as Record<string, unknown>, slots.default?.())
  },
})

// 装饰性图标容器，内容由作者塞（字形、内联 svg、XhIcon 都行）
export const XhResultIcon = defineComponent({
  name: 'XhResultIcon',
  setup(_, { slots }) {
    const ctx = useResultContext()
    return () => h('span', ctx.api.value.getIconProps() as Record<string, unknown>, slots.default?.())
  },
})

// 标题渲染为 p 而不是 hN：它只做视觉主次，不往文档大纲里插一级标题
export const XhResultTitle = defineComponent({
  name: 'XhResultTitle',
  setup(_, { slots }) {
    const ctx = useResultContext()
    return () => h('p', ctx.api.value.getTitleProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhResultDescription = defineComponent({
  name: 'XhResultDescription',
  setup(_, { slots }) {
    const ctx = useResultContext()
    return () => h('p', ctx.api.value.getDescriptionProps() as Record<string, unknown>, slots.default?.())
  },
})

// 操作槽只排版，按钮由作者放进插槽
export const XhResultAction = defineComponent({
  name: 'XhResultAction',
  setup(_, { slots }) {
    const ctx = useResultContext()
    return () => h('div', ctx.api.value.getActionProps() as Record<string, unknown>, slots.default?.())
  },
})
