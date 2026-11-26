/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 alert 相关实现。

import type { Tone } from '@xihan-ui/core'
import type { AlertSchema, AlertStructureOptions, AlertTranslations } from '@xihan-ui/headless'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import type { PropsOf } from '../../runtime/props-of'
import { alertStructure } from '@xihan-ui/headless'
import { defineComponent, h } from 'vue'
import { withXhConfig } from '../../config/config'
import { renderStructure } from '../../runtime/structure'
import { useDescriptionPart, useTitleDescriptionPart } from '../../runtime/title-description'
import { provideAlert, useAlertContext } from './context'
import { useAlert } from './use-alert'

type AlertProps = AlertSchema['props']

export const XhAlertRoot = defineComponent({
  name: 'XhAlertRoot',
  props: {
    tone: String as PropType<Tone>,
    // 三态：不传即由 connect 决定缺省，传 false 才真的关掉
    closable: { type: Boolean, default: undefined },
    banner: { type: Boolean, default: undefined },
    open: { type: Boolean, default: undefined },
    defaultOpen: { type: Boolean, default: undefined },
    translations: Object as PropType<Partial<AlertTranslations>>,
    /** 标题文字。不写默认插槽时铺标题部件；需要放置其他内容时改用 title 插槽。 */
    title: { type: String },
    /** 说明文字。不写默认插槽时铺说明部件；需要放置其他内容时改用 description 插槽。 */
    description: { type: String },
  },
  // open-change 携带 { open }，update:open 携带裸布尔
  emits: {
    'open-change': (_details: PayloadOf<AlertProps, 'onOpenChange'>) => true,
    'update:open': (_open: PayloadOf<AlertProps, 'onOpenChange'>['open']) => true,
  },
  slots: Object as SlotsType<{
    default?: () => VNode[]
    /** 语气图标。 */
    indicator?: () => VNode[]
    /** 标题，压过 title。 */
    title?: () => VNode[]
    /** 说明，压过 description。 */
    description?: () => VNode[]
    /** 操作按钮。 */
    action?: () => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const notify: AlertProps['onOpenChange'] = (details) => {
      emit('open-change', details)
      emit('update:open', details.open)
    }
    // withXhConfig 只能在 setup 期调，机器与缺省树在渲染期读这份代理
    const configured = withXhConfig('alert', props)
    const ctx = useAlert(configured as AlertProps, notify)
    provideAlert(ctx)
    return () => h('div', ctx.api.value.getRootProps(), slots.default
      ? slots.default()
      : renderDefaultStructure(
          { title: props.title, description: props.description, closable: configured.closable },
          { indicator: slots.indicator, title: slots.title, description: slots.description, action: slots.action },
        ))
  },
})

export const XhAlertIndicator = defineComponent({
  name: 'XhAlertIndicator',
  setup(_, { slots }) {
    const ctx = useAlertContext()
    return () => h('span', ctx.api.value.getIndicatorProps(), slots.default?.())
  },
})

export const XhAlertContent = defineComponent({
  name: 'XhAlertContent',
  setup(_, { slots }) {
    const ctx = useAlertContext()
    return () => h('div', ctx.api.value.getContentProps(), slots.default?.())
  },
})

export const XhAlertTitle = defineComponent({
  name: 'XhAlertTitle',
  setup(_, { slots }) {
    const ctx = useAlertContext()
    useTitleDescriptionPart(ctx.presence, 'title')
    return () => h('div', ctx.api.value.getTitleProps(), slots.default?.())
  },
})

export const XhAlertDescription = defineComponent({
  name: 'XhAlertDescription',
  setup(_, { slots }) {
    const ctx = useAlertContext()
    // 读不出一句话的说明不进描述链
    const el = useDescriptionPart(ctx.presence)
    return () => h('div', { ...ctx.api.value.getDescriptionProps(), ref: el }, slots.default?.())
  },
})

export const XhAlertAction = defineComponent({
  name: 'XhAlertAction',
  setup(_, { slots }) {
    const ctx = useAlertContext()
    return () => h('div', ctx.api.value.getActionProps(), slots.default?.())
  },
})

export const XhAlertCloseTrigger = defineComponent({
  name: 'XhAlertCloseTrigger',
  setup(_, { slots }) {
    const ctx = useAlertContext()
    return () => h('button', ctx.api.value.getCloseTriggerProps(), slots.default?.())
  },
})

/** 标准结构里各部件对应的组件。 */
const ALERT_PARTS = {
  'indicator': XhAlertIndicator,
  'content': XhAlertContent,
  'title': XhAlertTitle,
  'description': XhAlertDescription,
  'action': XhAlertAction,
  'close-trigger': XhAlertCloseTrigger,
}

type AlertSectionSlots = Readonly<Partial<Record<'indicator' | 'title' | 'description' | 'action', () => VNode[]>>>

/**
 * 未写默认插槽时铺开的整套结构：照 headless 的 alertStructure 渲，与 Web Components 不写部件时元素生成的节点出自同一份。
 * 文本列恒铺，标题与说明取文字或同名插槽，图标与操作区取同名插槽，写了 closable 才铺关闭钮。
 */
function renderDefaultStructure(text: Omit<AlertStructureOptions, 'slotted'>, sections: AlertSectionSlots): VNode[] {
  const nodes = alertStructure({ ...text, slotted: name => sections[name as keyof AlertSectionSlots] != null })
  return renderStructure(nodes, ALERT_PARTS, node => (node.slot ? sections[node.slot.name as keyof AlertSectionSlots]?.() : undefined))
}

// 各组件接受的 props，与 React 同名
export type XhAlertActionProps = PropsOf<typeof XhAlertAction>
export type XhAlertCloseTriggerProps = PropsOf<typeof XhAlertCloseTrigger>
export type XhAlertContentProps = PropsOf<typeof XhAlertContent>
export type XhAlertDescriptionProps = PropsOf<typeof XhAlertDescription>
export type XhAlertIndicatorProps = PropsOf<typeof XhAlertIndicator>
export type XhAlertRootProps = PropsOf<typeof XhAlertRoot>
export type XhAlertTitleProps = PropsOf<typeof XhAlertTitle>
