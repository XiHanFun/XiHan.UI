/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 presence 相关实现。

import type { RuntimeConfig } from '@xihan-ui/core'
import type { PresenceProps } from '@xihan-ui/headless'
import type { PropsOf } from '../../runtime/props-of'
import { createRuntimeConfig } from '@xihan-ui/core'
import { connectPresence } from '@xihan-ui/headless'
import { computed, defineComponent, h, ref, watch } from 'vue'
import { withXhConfig } from '../../config/config'
import { vueNormalize } from '../../runtime/normalize-props'
import { useOverlayExit } from '../../runtime/use-overlay-exit'

/**
 * 让默认插槽里的内容按 present 进场与退场：退场动画播完才撤下，撤下之后通知 exit-complete。
 *
 * 只管「在不在」与等动画，不带角色、不接按键；里面是什么、怎么读，由内容自己决定。
 */
export const XhPresence = defineComponent({
  name: 'XhPresence',
  // 缺省值由 connect 给出；缺省为真的两个布尔显式保留 undefined，没写时才落到 connect 的缺省
  props: {
    present: Boolean,
    lazyMount: { type: Boolean, default: undefined },
    unmountOnExit: { type: Boolean, default: undefined },
  },
  emits: {
    'exit-complete': () => true,
  },
  setup(props, { slots, emit }) {
    // 没有状态机，全局配置（组件级缺省）在这里并进来
    const configured = withXhConfig('presence', props)
    const api = computed(() => connectPresence({
      present: configured.present,
      lazyMount: configured.lazyMount,
      unmountOnExit: configured.unmountOnExit,
    } satisfies PresenceProps, vueNormalize))

    // 服务端没有 DOM、也就没有退场：config 传 null 时闸门退化成「跟着 present」
    const config: RuntimeConfig | null = typeof document === 'undefined' ? null : createRuntimeConfig()
    const rootRef = ref<HTMLElement | null>(null)
    // 退场播完之前保持为真：hidden、内联 display 与内容的卸载都跟着它落
    const visible = useOverlayExit({ config, isOpen: () => api.value.present, contentRef: rootRef })

    // 在场过一次：lazyMount 只拦第一次在场之前那一段
    const mountedOnce = ref(api.value.present)
    // present 变过没有：交给 connect 判首帧就在场的那一段直接呈现
    const moved = ref(false)
    watch(() => api.value.present, (present) => {
      moved.value = true
      if (present)
        mountedOnce.value = true
    })

    // 退场播完、这一帧把内容撤下之后才通知：等渲染提交再发
    watch(visible, (now, before) => {
      if (before && !now)
        emit('exit-complete')
    }, { flush: 'post' })

    return () => {
      const current = api.value
      const shown = visible.value
      return h('div', {
        ...current.getRootProps(shown, moved.value),
        // 宿主的 [hidden]{display:none!important} 之外再写一道内联 display：作者给根声明过 display 时，hidden 压不住
        style: shown ? undefined : { display: 'none' },
        ref: (el: unknown) => { rootRef.value = el as HTMLElement | null },
      }, current.isContentMounted(shown, mountedOnce.value) ? slots.default?.() : undefined)
    }
  },
})

// 各组件接受的 props，与 React 同名
export type XhPresenceProps = PropsOf<typeof XhPresence>
