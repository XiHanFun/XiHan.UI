/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use expression input 相关实现。

import type { Layer, Service } from '@xihan-ui/core'
import type { ExpressionInputApi, ExpressionInputEl, ExpressionInputSchema } from '@xihan-ui/headless'
import type { RefObject } from 'react'
import type { OverlayWiring } from '../../runtime/use-overlay'
import { connectExpressionInput, expressionInputMachine } from '@xihan-ui/headless'
import { createPositionEngine } from '@xihan-ui/position'
import { useCallback, useRef, useState } from 'react'
import { useFormReset } from '../../runtime/attach-form-reset'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactIdGenerator, useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'
import { useOverlay } from '../../runtime/use-overlay'

export interface ExpressionInputContext extends OverlayWiring {
  /** label 部件挂载时登记、卸载时注销；可聚焦部件的 aria-labelledby 据此决定输不输出。 */
  registerLabel: () => () => void
  /** issues 部件挂载时登记、卸载时注销；输入框的描述链据此决定引不引用它。 */
  registerIssues: () => () => void
  /** 输入框挂载时报告自己是不是多行宿主。 */
  setMultiline: (multiline: boolean) => void
  /** 根上的 multiline：XhExpressionInputInput 没写 as 时据此选标签。 */
  multiline: boolean
  service: Service<ExpressionInputSchema>
  api: ExpressionInputApi
  rootRef: RefObject<HTMLElement | null>
  inputRef: RefObject<ExpressionInputEl | null>
  highlightRef: RefObject<HTMLElement | null>
  positionerRef: RefObject<HTMLElement | null>
  contentRef: RefObject<HTMLElement | null>
}

export function useExpressionInput(props: ExpressionInputSchema['props']): ExpressionInputContext {
  const idGenerator = useReactIdGenerator()
  const scope = useReactScope()
  const rootRef = useRef<HTMLElement | null>(null)
  const inputRef = useRef<ExpressionInputEl | null>(null)
  const highlightRef = useRef<HTMLElement | null>(null)
  const positionerRef = useRef<HTMLElement | null>(null)
  const contentRef = useRef<HTMLElement | null>(null)
  const serviceRef = useRef<Service<ExpressionInputSchema> | null>(null)

  const layer = useCallback((): Omit<Layer, 'id' | 'node' | 'surfaces'> => ({
    kind: 'popover',
    // 输入框记为本层分支：在里面打字、点击都算层内交互，不该把补全点没
    branches: () => [inputRef.current, positionerRef.current].filter(Boolean) as Element[],
    isModal: () => false,
  }), [])

  const overlay = useOverlay({
    scope,
    idGenerator,
    initialOpen: false,
    isOpen: () => serviceRef.current?.state.get() === 'open',
    layer,
    node: () => contentRef.current,
    refs: (service) => {
      service.refs.set('position', createPositionEngine())
      service.refs.set('getFloatingEl', () => positionerRef.current)
      service.refs.set('getInputEl', () => inputRef.current)
      service.refs.set('getHighlightEl', () => highlightRef.current)
    },
  })

  // 用状态而不是 ref：登记数要能把根重渲一次，connect 在渲染期求值
  const [labelCount, setLabelCount] = useState(0)
  const registerLabel = useCallback(() => {
    setLabelCount(n => n + 1)
    return () => setLabelCount(n => n - 1)
  }, [])
  const [issuesCount, setIssuesCount] = useState(0)
  const registerIssues = useCallback(() => {
    setIssuesCount(n => n + 1)
    return () => setIssuesCount(n => n - 1)
  }, [])
  const [inputMultiline, setMultiline] = useState<boolean | null>(null)
  const multiline = inputMultiline ?? !!props.multiline
  const service = useMachine(expressionInputMachine, () => ({
    ...props,
    labelled: labelCount > 0,
    issuesRendered: issuesCount > 0,
    multiline,
  }), {
    scope,
    onCreate: overlay.onCreate as never,
  })
  serviceRef.current = service

  // 值攥在机器里，原生 reset 只还原原生控件——不接这条线，点重置什么都不会发生
  useFormReset(service, rootRef)

  return {
    registerLabel,
    registerIssues,
    setMultiline,
    multiline: !!props.multiline,
    ...overlay,
    service,
    api: connectExpressionInput(service, reactNormalize),
    rootRef,
    inputRef,
    highlightRef,
    positionerRef,
    contentRef,
  }
}
