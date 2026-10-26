/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use editable 相关实现。

import type { Service } from '@xihan-ui/core'
import type { EditableApi, EditableSchema } from '@xihan-ui/headless'
import type { RefObject } from 'react'
import { connectEditable, editableMachine } from '@xihan-ui/headless'
import { useCallback, useRef, useState } from 'react'
import { useFormReset } from '../../runtime/attach-form-reset'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'

export interface EditableContext {
  /**
   * label 部件挂载时登记、卸载时注销。可聚焦部件的 aria-labelledby 据此决定输不输出；
   * 首帧（含服务端直出）还没登记，不写这条引用。
   */
  registerLabel: () => () => void
  api: EditableApi
  /** 状态机实例，供部件上报 DOM 侧的事实。 */
  service: Service<EditableSchema>
  /** 表单重置的锚点：接在根节点上。 */
  rootRef: RefObject<HTMLElement | null>
  /** 输入框节点，进入编辑态后焦点移入它。 */
  inputRef: RefObject<HTMLElement | null>
  /** 预览区节点，退出编辑态后焦点交还给它。 */
  previewRef: RefObject<HTMLElement | null>
}

export function useEditable(props: EditableSchema['props']): EditableContext {
  // 两态各自的 id 由 scope 派生，label 的 for 指向输入框
  const scope = useReactScope()
  const rootRef = useRef<HTMLElement | null>(null)
  const inputRef = useRef<HTMLElement | null>(null)
  const previewRef = useRef<HTMLElement | null>(null)

  // 机器的挂载效应会立刻读 refs，交在 onCreate 里才赶得上；传取值器而非节点，进出编辑态时现取
  const onCreate = useCallback((service: Service<EditableSchema>) => {
    service.refs.set('getInputEl', () => inputRef.current)
    service.refs.set('getPreviewEl', () => previewRef.current)
  }, [])

  // 用状态而不是 ref：登记数要能把根重渲一次，connect 在渲染期求值
  const [labelCount, setLabelCount] = useState(0)
  const registerLabel = useCallback(() => {
    setLabelCount(n => n + 1)
    return () => setLabelCount(n => n - 1)
  }, [])
  const service = useMachine(editableMachine, () => ({ ...props, labelled: labelCount > 0 }), { scope, onCreate })

  // 值攥在机器里，原生 reset 只还原原生控件——不接这条线，点重置什么都不会发生
  useFormReset(service, rootRef)

  return { registerLabel, api: connectEditable(service, reactNormalize), service, rootRef, inputRef, previewRef }
}
