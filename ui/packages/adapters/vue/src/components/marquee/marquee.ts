/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 marquee 相关实现。

import type { MarqueeDirection, MarqueeSchema, MarqueeTranslations } from '@xihan-ui/headless'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { createScope } from '@xihan-ui/core'
import { connectMarquee, marqueeMachine } from '@xihan-ui/headless'
import { computed, defineComponent, h } from 'vue'
import { withXhConfig } from '../../config/config'
import { vueNormalize } from '../../runtime/normalize-props'
import { slotPaints } from '../../runtime/slot-content'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'
import { provideMarquee, useMarqueeContext } from './context'

type MarqueeProps = MarqueeSchema['props']

export const XhMarqueeRoot = defineComponent({
  name: 'XhMarqueeRoot',
  // 缺省值由机器与 connect 决定；普通类型省略 default，Boolean 显式保留 undefined
  props: {
    direction: { type: String as PropType<MarqueeDirection> },
    speed: { type: Number },
    pauseOnHover: { type: Boolean, default: undefined },
    // 缺席值 undefined 表示非受控
    paused: { type: Boolean, default: undefined },
    defaultPaused: { type: Boolean, default: undefined },
    autoFill: { type: Boolean, default: undefined },
    translations: { type: Object as PropType<Partial<MarqueeTranslations>> },
  },
  // paused-change 携带 { paused }，update:paused 携带裸布尔
  emits: {
    'paused-change': (_details: PayloadOf<MarqueeProps, 'onPausedChange'>) => true,
    'update:paused': (_paused: PayloadOf<MarqueeProps, 'onPausedChange'>['paused']) => true,
  },
  slots: Object as SlotsType<{
    default?: () => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const onPausedChange: MarqueeProps['onPausedChange'] = (details) => {
      emit('paused-change', details)
      emit('update:paused', details.paused)
    }
    // scope id 走 Vue 的 useId：服务端与水合两侧同号，暂停开关的 aria-controls 才对得上
    const scope = createScope(null, createVueIdGenerator())
    const config = withXhConfig('marquee', props) as MarqueeProps
    const service = useMachine(marqueeMachine, () => ({ ...config, onPausedChange }), scope)
    const api = computed(() => connectMarquee(service, vueNormalize))
    provideMarquee({ api })
    return () => h('div', api.value.getRootProps() as Record<string, unknown>, slots.default?.())
  },
})

/**
 * 轨道：滚动的是这一层。默认插槽中的内容按 api.copies 铺设若干份，每份包一层壳。
 *
 * 包壳是为了让每份等长：接缝能否对齐，取决于滚动完成的距离恰好等于一份的长度。
 * 第一份之后的都是副本，同时标 aria-hidden 与 inert：读屏不朗读第二遍，Tab 也不会停在副本上：
 * 只标 aria-hidden 而保留可聚焦的副本，焦点会落进一个读屏看不见的位置。
 * 插槽中只剩注释或空白时一份都不铺设：铺设只会让轨道多出一段空白滚动。
 */
export const XhMarqueeContent = defineComponent({
  name: 'XhMarqueeContent',
  setup(_, { slots }) {
    const ctx = useMarqueeContext()
    return () => {
      const copies: VNode[] = []
      if (slotPaints(slots.default?.())) {
        for (let i = 0; i < ctx.api.value.copies; i++) {
          const copy = i > 0
          copies.push(h(
            'div',
            {
              'data-xh-copy': String(i),
              'aria-hidden': copy ? 'true' : undefined,
              'inert': copy ? true : undefined,
            },
            slots.default?.(),
          ))
        }
      }
      return h('div', ctx.api.value.getContentProps() as Record<string, unknown>, copies)
    }
  },
})

/** 暂停开关：原生 button，Enter / Space 的激活与 Tab 停靠由平台提供；不给内容时皮肤画暂停 / 播放图标。 */
export const XhMarqueeAutoplayTrigger = defineComponent({
  name: 'XhMarqueeAutoplayTrigger',
  setup(_, { slots }) {
    const ctx = useMarqueeContext()
    return () => h('button', ctx.api.value.getAutoplayTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})
