/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use expression input 相关实现。

import type { Cleanup, Layer, RuntimeConfig, Service } from '@xihan-ui/core'
import type { ExpressionInputApi, ExpressionInputEl, ExpressionInputSchema } from '@xihan-ui/headless'
import type { ComputedRef, Ref } from 'vue'
import { createRuntimeConfig, createScope } from '@xihan-ui/core'
import { connectExpressionInput, expressionInputMachine } from '@xihan-ui/headless'
import { createDeferredPositionEngine } from '@xihan-ui/position'
import { computed, ref } from 'vue'
import { useXhConfig } from '../../config/config'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { useOverlayExit } from '../../runtime/use-overlay-exit'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface ExpressionInputContext {
  /** 已渲染的 label 部件数量，由 XhExpressionInputLabel 在 setup 里同步登记、卸载时撤销。 */
  labelCount: Ref<number>
  /** 已渲染的 issues 部件数量，决定输入框的描述链引不引用它。 */
  issuesCount: Ref<number>
  /** 输入框是不是多行宿主，由 XhExpressionInputInput 按 as 登记。 */
  multiline: Ref<boolean>
  service: Service<ExpressionInputSchema>
  api: ComputedRef<ExpressionInputApi>
  inputRef: Ref<ExpressionInputEl | null>
  highlightRef: Ref<HTMLElement | null>
  positionerRef: Ref<HTMLElement | null>
  contentRef: Ref<HTMLElement | null>
  /** 当前是否应当渲染：退场动画播完之前仍为真。 */
  visible: Ref<boolean>
  /** 浮层迁移到的位置：全局配置的容器 > 运行时的浮层落点 > body。 */
  portalTarget: ComputedRef<string | Element>
}

export function useExpressionInput(
  props: ExpressionInputSchema['props'],
  handlers: Pick<ExpressionInputSchema['props'], 'onValueChange' | 'onIssuesChange' | 'onCompletionSelect' | 'onOpenChange'> = {},
): ExpressionInputContext {
  const xhConfig = useXhConfig()
  const inputRef = ref<ExpressionInputEl | null>(null)
  const highlightRef = ref<HTMLElement | null>(null)
  const positionerRef = ref<HTMLElement | null>(null)
  const contentRef = ref<HTMLElement | null>(null)

  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  const labelCount = ref(0)
  const issuesCount = ref(0)
  const multiline = ref(false)
  const service = useMachine(expressionInputMachine, () => ({
    ...props,
    labelled: labelCount.value > 0,
    issuesRendered: issuesCount.value > 0,
    multiline: multiline.value,
    ...handlers,
  }), scope)

  let config: RuntimeConfig | null = null

  if (typeof document !== 'undefined') {
    config = createRuntimeConfig({ scope, idGenerator: idGen })

    // 只提供注册函数，实际入栈出栈由机器的 trackLayer 效应按展开态驱动
    const registerLayer = (): { layer: Layer, dispose: Cleanup } => config!.layerRegistry.register({
      kind: 'popover',
      node: () => contentRef.value,
      // 输入框记为本层分支：在里面打字、点击都算层内交互，不该把补全点没
      branches: () => [inputRef.value, positionerRef.value].filter(Boolean) as Element[],
      isModal: () => false,
      surfaces: () => [],
    })

    service.refs.set('config', config!)
    service.refs.set('registerLayer', registerLayer)
    service.refs.set('position', createDeferredPositionEngine())
    service.refs.set('getFloatingEl', () => positionerRef.value)
    service.refs.set('getInputEl', () => inputRef.value)
    service.refs.set('getHighlightEl', () => highlightRef.value)
  }

  const api = computed(() => connectExpressionInput(service, vueNormalize))
  const visible = useOverlayExit({
    config,
    isOpen: () => api.value.open,
    contentRef,
    onPresence: presence => service.refs.set('presence', presence),
  })
  const portalTarget = computed<string | Element>(() => xhConfig.value.portalContainer?.() ?? config?.portalContainer() ?? 'body')

  return { labelCount, issuesCount, multiline, visible, service, api, inputRef, highlightRef, positionerRef, contentRef, portalTarget }
}
