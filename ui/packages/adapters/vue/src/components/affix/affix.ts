import type { AffixSchema } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { defineComponent, h } from 'vue'
import { provideAffix, useAffixContext } from './context'
import { useAffix } from './use-affix'

type AffixProps = AffixSchema['props']

/** 根节点是占位盒：content 吸住时脱流，它留在原位撑住那块空间。 */
export const XhAffixRoot = defineComponent({
  name: 'XhAffixRoot',
  // 缺省值由机器与 connect 决定，这里一律 default: undefined
  props: {
    offsetTop: { type: Number, default: undefined },
    offsetBottom: { type: Number, default: undefined },
    /** 滚动容器，缺省即整页滚动；经 refs 交给观察器。 */
    target: { type: Object as PropType<HTMLElement | null>, default: undefined },
  },
  emits: {
    'affix-change': (_details: PayloadOf<AffixProps, 'onAffixChange'>) => true,
  },
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

/** 吸住时脱离常规流钉在可视区边上，落位由机器量好写进内联样式。 */
export const XhAffixContent = defineComponent({
  name: 'XhAffixContent',
  setup(_, { slots }) {
    const ctx = useAffixContext()
    return () => h('div', ctx.api.value.getContentProps() as Record<string, unknown>, slots.default?.())
  },
})
