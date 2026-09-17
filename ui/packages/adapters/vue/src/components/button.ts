/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 button 相关实现。

import type { PropTypes } from '@xihan-ui/core'
import type { ButtonProps } from '@xihan-ui/headless'
import type { InjectionKey, PropType, Ref } from 'vue'
import { buttonMachine, connectButton } from '@xihan-ui/headless'
import { computed, defineComponent, h, inject, provide, useAttrs } from 'vue'
import { vueNormalize } from '../runtime/normalize-props'
import { useMachine } from '../runtime/use-machine'
import { useButtonGroupContext } from './button-group/context'

/** 从实际调用推导 api 形状，避免再写一遍 normalize 的类型参数。 */
type VueButtonApi = ReturnType<typeof connectButton<PropTypes>>

const ButtonKey: InjectionKey<Ref<VueButtonApi>> = Symbol('XhButton')

function useButtonApi(): Ref<VueButtonApi> {
  const api = inject(ButtonKey, null)
  if (!api)
    throw new Error('[xh] XhButton 的子部件必须放在 XhButton 里')
  return api
}

export const XhButton = defineComponent({
  name: 'XhButton',
  props: {
    type: { type: String as PropType<'button' | 'submit' | 'reset'>, default: 'button' },
    disabled: Boolean,
    loading: Boolean,
    iconOnly: Boolean,
    fullWidth: Boolean,
    variant: String as PropType<ButtonProps['variant']>,
    tone: String as PropType<ButtonProps['tone']>,
    size: String as PropType<ButtonProps['size']>,
    /** 渲染为哪个标签，默认 button；写为 a 时作者自行提供 href。 */
    as: { type: String as PropType<ButtonProps['as']>, default: 'button' },
  },
  setup(props, { slots }) {
    const attrs = useAttrs()
    // 外层按钮组禁用时整组一起禁用；段自己写了禁用的仍然禁用。
    // 组的 variant / tone / size 走同一条路下来，段自己写了的优先，组值再压过全局配置的 size
    const group = useButtonGroupContext()
    // 机器只承载按压通道；全局配置（size）由 useMachine 那一处并入。
    // 作者写在根节点上的可及名转告连接层，图标按钮缺名时由它提醒
    const service = useMachine(buttonMachine, () => ({
      ...props,
      disabled: props.disabled || !!group?.value.disabled,
      variant: props.variant ?? group?.value.variant,
      tone: props.tone ?? group?.value.tone,
      size: props.size ?? group?.value.size,
      ariaLabel: attrs['aria-label'] as string | undefined,
      ariaLabelledby: attrs['aria-labelledby'] as string | undefined,
    } as ButtonProps))
    const api = computed(() => connectButton(service, vueNormalize))
    provide(ButtonKey, api)
    return () => h(props.as, api.value.getRootProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhButtonLabel = defineComponent({
  name: 'XhButtonLabel',
  setup(_, { slots }) {
    const api = useButtonApi()
    return () => h('span', api.value.getLabelProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhButtonPrefix = defineComponent({
  name: 'XhButtonPrefix',
  setup(_, { slots }) {
    const api = useButtonApi()
    return () => h('span', api.value.getPrefixProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhButtonSuffix = defineComponent({
  name: 'XhButtonSuffix',
  setup(_, { slots }) {
    const api = useButtonApi()
    return () => h('span', api.value.getSuffixProps() as Record<string, unknown>, slots.default?.())
  },
})

/** 载入态的旋转标记；皮肤为它挂载旋转动画，作者只需放置位置。 */
export const XhButtonIndicator = defineComponent({
  name: 'XhButtonIndicator',
  setup(_, { slots }) {
    const api = useButtonApi()
    return () => h('span', api.value.getIndicatorProps() as Record<string, unknown>, slots.default?.())
  },
})
