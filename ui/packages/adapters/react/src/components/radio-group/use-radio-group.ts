/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use radio group 相关实现。

import type { Service } from '@xihan-ui/core'
import type { RadioGroupApi, RadioGroupSchema } from '@xihan-ui/headless'
import type { RefObject } from 'react'
import { connectRadioGroup, radioGroupMachine } from '@xihan-ui/headless'
import { useCallback, useRef, useState } from 'react'
import { useFormReset } from '../../runtime/attach-form-reset'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'

export interface RadioGroupContext {
  api: RadioGroupApi
  /** 状态机实例，供条目上报 DOM 侧的事实（如条目卸载带走了焦点）。 */
  service: Service<RadioGroupSchema>
  /** root 节点：条目集合的查询容器，segmented 形态滑块测量的参照系，也是表单重置的锚点。 */
  rootRef: RefObject<HTMLElement | null>
  /**
   * label 部件挂载时登记、卸载时注销。根的 aria-labelledby 据此决定输不输出：
   * 只看 label 属性有没有值不够，手写选项时标题可能根本没渲染。
   */
  registerLabel: () => () => void
}

export function useRadioGroup(props: RadioGroupSchema['props']): RadioGroupContext {
  // connect 要按 scope 派生 label 的 id，同页多实例的 IDREF 才不相撞
  const scope = useReactScope()
  const rootRef = useRef<HTMLElement | null>(null)
  // 用状态而不是 ref：登记数要能把根重渲一次，connect 在渲染期求值
  const [labelCount, setLabelCount] = useState(0)
  const registerLabel = useCallback(() => {
    setLabelCount(n => n + 1)
    return () => setLabelCount(n => n - 1)
  }, [])
  const service = useMachine(radioGroupMachine, () => ({ ...props, labelled: labelCount > 0 }), {
    scope,
    // 滑块的量测在机器的挂载效应里跑，DOM 侧的取值口要赶在那之前交出去
    onCreate: (svc: Service<RadioGroupSchema>) => {
      svc.refs.set('getRootEl', () => rootRef.current)
    },
  })

  // 选中值攥在机器里，原生 reset 只还原原生控件——不接这条线，点重置什么都不会发生
  useFormReset(service, rootRef)

  return { api: connectRadioGroup(service, reactNormalize), service, rootRef, registerLabel }
}
