/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 portal 相关实现。

import type { PortalVisualBridge } from '@xihan-ui/core'
import type { PropType, Ref, VNode } from 'vue'
import { createPortalVisualBridge } from '@xihan-ui/core'
import { defineComponent, h, onBeforeUnmount, ref, Teleport, watch } from 'vue'
import { clearFieldContext } from '../components/field/context'

/**
 * Vue 内部 Portal：Teleport 只负责物理搬运，本层为每个实例增加无盒壳并桥接逻辑来源的视觉轴。
 * 不公开成组件家族；所有浮层部件统一经这里走。
 */
export const XhPortal = defineComponent({
  name: 'XhPortal',
  props: {
    to: { type: [String, Object] as PropType<string | Element>, required: true },
    /** 客户端来源节点尚未落定时先原地渲染，绑定所属 Document 后再迁移到正式目标。 */
    disabled: Boolean,
    /** 已有锚点时直接作为逻辑来源，避免在结构敏感的 ButtonGroup/Toolbar 里增加元素标记。 */
    source: { type: Object as PropType<Readonly<Ref<HTMLElement | null>>>, default: undefined },
  },
  setup(props, { slots }) {
    // 浮层内容搬到落点后不再是外层字段的控件：放在里面的输入框不被外层字段命名、描述，也不拿同一个 id。
    // 与 Web Components 一致：那边的 Portal 把节点物理搬走，字段按 DOM 祖先链找控件，本来就够不着
    clearFieldContext()
    const sourceRef = ref<HTMLTemplateElement | null>(null)
    const shellRef = ref<HTMLElement | null>(null)
    let bridge: PortalVisualBridge | null = null

    const connect = (): void => {
      bridge?.dispose()
      bridge = null
      const source = props.source?.value ?? sourceRef.value
      const shell = shellRef.value
      if (!source || !shell)
        return
      bridge = createPortalVisualBridge({ source, shell })
    }

    watch([sourceRef, shellRef, () => props.source?.value, () => props.to, () => props.disabled], connect, { flush: 'post' })
    onBeforeUnmount(() => {
      bridge?.dispose()
      bridge = null
    })

    return (): VNode | VNode[] => [
      ...(props.source ? [] : [h('template', { 'ref': sourceRef, 'data-xh-portal-source': '' })]),
      h(Teleport, { to: props.to, disabled: props.disabled }, [
        h('div', {
          'ref': shellRef,
          'data-xh-portal-shell': '',
          'style': { display: 'contents' },
        }, slots.default?.()),
      ]),
    ]
  },
})
