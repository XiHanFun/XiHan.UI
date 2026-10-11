/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 fieldset 相关实现。

import type { FieldsetProps, FieldsetTranslations } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import { computed, defineComponent, h } from 'vue'
import { provideXhConfig, useXhConfig, withXhConfig } from '../../config/config'
import { provideFieldset, provideFieldsetOuterDisabled, useFieldsetContext, useFieldsetOuterDisabled } from './context'
import { useFieldset } from './use-fieldset'

export const XhFieldsetRoot = defineComponent({
  name: 'XhFieldsetRoot',
  // 三个布尔缺省 undefined：缺省值的事实源在 connect，写死 false 会挡住将来从上下文取值
  props: {
    disabled: { type: Boolean, default: undefined },
    invalid: { type: Boolean, default: undefined },
    required: { type: Boolean, default: undefined },
    translations: { type: Object as PropType<Partial<FieldsetTranslations>> },
  },
  setup(props, { slots }) {
    const outer = useXhConfig()
    const ctx = useFieldset(withXhConfig('fieldset', props) as FieldsetProps)
    provideFieldset(ctx)
    // 整组禁用经作用域配置压进子树：组内组件库的控件各自拿到 disabled，行为与禁用面一起到位。
    // 原生 fieldset[disabled] 只管得住原生表单控件，滑块、取色区这类非原生交互节点与各家族的禁用面它够不着
    provideXhConfig(() => ({ disabled: ctx.api.value.disabled || undefined }))
    provideFieldsetOuterDisabled(computed(() => outer.value.disabled === true))
    // 必须是原生 <fieldset>：整组禁用连坐组内控件是浏览器给的，换成 div 就只剩一层灰样式
    return () => h('fieldset', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhFieldsetLegend = defineComponent({
  name: 'XhFieldsetLegend',
  setup(_, { slots }) {
    const ctx = useFieldsetContext()
    // legend 里的控件不吃本组的禁用（原生语义：首个 legend 内的控件不受所在 fieldset 禁用），恢复成外层的
    const outer = useFieldsetOuterDisabled()
    provideXhConfig(() => ({ disabled: outer?.value ?? false }))
    // 原生 <legend> 只有作为 <fieldset> 的首个子节点时才充当这一组的名字
    return () => h('legend', ctx.api.value.getLegendProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhFieldsetDescription = defineComponent({
  name: 'XhFieldsetDescription',
  setup(_, { slots }) {
    const ctx = useFieldsetContext()
    return () => h('p', ctx.api.value.getDescriptionProps() as Record<string, unknown>, slots.default?.())
  },
})

/** 把并排的几个字段圈为一段；纯排版。 */
export const XhFieldsetFieldGroup = defineComponent({
  name: 'XhFieldsetFieldGroup',
  setup(_, { slots }) {
    const ctx = useFieldsetContext()
    return () => h('div', ctx.api.value.getFieldGroupProps() as Record<string, unknown>, slots.default?.())
  },
})

/** 组末尾的按钮行；纯排版。 */
export const XhFieldsetActions = defineComponent({
  name: 'XhFieldsetActions',
  setup(_, { slots }) {
    const ctx = useFieldsetContext()
    return () => h('div', ctx.api.value.getActionsProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhFieldsetErrorText = defineComponent({
  name: 'XhFieldsetErrorText',
  setup(_, { slots }) {
    const ctx = useFieldsetContext()
    // 节点常挂，靠 hidden 显隐：活区要先在场才播报得出来，卸载重挂读屏读不到
    return () => h('p', ctx.api.value.getErrorTextProps() as Record<string, unknown>, slots.default?.())
  },
})
