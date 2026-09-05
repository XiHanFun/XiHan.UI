import type { Size, Tone } from '@xihan-ui/core'
import type { TagSchema, TagTranslations, TagVariant } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { defineComponent, h } from 'vue'
import { withXhConfig } from '../../config/config'
import { provideTag, useTagContext } from './context'
import { useTag } from './use-tag'

type TagProps = TagSchema['props']

export const XhTagRoot = defineComponent({
  name: 'XhTagRoot',
  props: {
    variant: String as PropType<TagVariant>,
    tone: String as PropType<Tone>,
    size: String as PropType<Size>,
    // 三态：不传即由 connect 决定缺省，传 false 才真的关掉
    closable: { type: Boolean, default: undefined },
    disabled: { type: Boolean, default: undefined },
    open: { type: Boolean, default: undefined },
    defaultOpen: { type: Boolean, default: undefined },
    translations: Object as PropType<Partial<TagTranslations>>,
  },
  // open-change 携带 { open }，update:open 携带裸布尔
  emits: {
    'open-change': (_details: PayloadOf<TagProps, 'onOpenChange'>) => true,
    'update:open': (_open: PayloadOf<TagProps, 'onOpenChange'>['open']) => true,
  },
  setup(props, { slots, emit }) {
    const notify: TagProps['onOpenChange'] = (details) => {
      emit('open-change', details)
      emit('update:open', details.open)
    }
    const ctx = useTag(withXhConfig('tag', props) as TagProps, notify)
    provideTag(ctx)
    // 标签随文排，根用 span 才能落在一行文字里
    return () => h('span', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhTagLabel = defineComponent({
  name: 'XhTagLabel',
  setup(_, { slots }) {
    const ctx = useTagContext()
    return () => h('span', ctx.api.value.getLabelProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhTagCloseTrigger = defineComponent({
  name: 'XhTagCloseTrigger',
  setup(_, { slots }) {
    const ctx = useTagContext()
    // 用原生 button，Enter/Space 的激活交给平台
    return () => h('button', ctx.api.value.getCloseTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})
