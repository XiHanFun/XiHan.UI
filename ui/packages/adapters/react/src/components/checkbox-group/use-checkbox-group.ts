/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use checkbox group 相关实现。

import type { Service } from '@xihan-ui/core'
import type { CheckboxGroupApi, CheckboxGroupSchema } from '@xihan-ui/headless'
import type { RefObject } from 'react'
import { checkboxGroupMachine, connectCheckboxGroup } from '@xihan-ui/headless'
import { useCallback, useRef, useState } from 'react'
import { useFormReset } from '../../runtime/attach-form-reset'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'

export interface CheckboxGroupContext {
  api: CheckboxGroupApi
  service: Service<CheckboxGroupSchema>
  /** 表单重置的锚点：接在根节点上。 */
  rootRef: RefObject<HTMLElement | null>
  /**
   * label 部件挂载时登记、卸载时注销。根的 aria-labelledby 据此决定输不输出：
   * 只看 label 属性有没有值不够，手写选项时标题可能根本没渲染。
   */
  registerLabel: () => () => void
}

export function useCheckboxGroup(props: CheckboxGroupSchema['props']): CheckboxGroupContext {
  // connect 要按 scope 派生 label 与全选格的 id，同页多实例的 IDREF 才不相撞
  const scope = useReactScope()
  const rootRef = useRef<HTMLElement | null>(null)
  // 用状态而不是 ref：登记数要能把根重渲一次，connect 在渲染期求值
  const [labelCount, setLabelCount] = useState(0)
  const registerLabel = useCallback(() => {
    setLabelCount(n => n + 1)
    return () => setLabelCount(n => n - 1)
  }, [])
  const service = useMachine(checkboxGroupMachine, () => ({ ...props, labelled: labelCount > 0 }), { scope })

  // 选中集合攥在机器里，原生 reset 只还原原生控件——不接这条线，点重置什么都不会发生
  useFormReset(service, rootRef)

  return { api: connectCheckboxGroup(service, reactNormalize), service, rootRef, registerLabel }
}
