/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use listbox 相关实现。

import type { PropTypes, Service } from '@xihan-ui/core'
import type { ListboxApi, ListboxSchema } from '@xihan-ui/headless'
import { connectListbox, listboxMachine } from '@xihan-ui/headless'
import { useCallback, useState } from 'react'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'

export interface ListboxContext {
  /**
   * label 部件挂载时登记、卸载时注销。可聚焦部件的 aria-labelledby 据此决定输不输出；
   * 首帧（含服务端直出）还没登记，不写这条引用。
   */
  registerLabel: () => () => void
  /** 状态机实例，供部件上报 DOM 侧的事实（如条目卸载带走了焦点）。 */
  service: Service<ListboxSchema>
  /** 值按 unknown 交：根组件按作者的值类型推断 V，部件之间只是转手。 */
  api: ListboxApi<PropTypes, unknown>
}

export function useListbox(props: ListboxSchema['props']): ListboxContext {
  const scope = useReactScope()
  // 连打检索缓冲存在机器的 refs 里，适配器不必注入 refs
  // 用状态而不是 ref：登记数要能把根重渲一次，connect 在渲染期求值
  const [labelCount, setLabelCount] = useState(0)
  const registerLabel = useCallback(() => {
    setLabelCount(n => n + 1)
    return () => setLabelCount(n => n - 1)
  }, [])
  const service = useMachine(listboxMachine, () => ({ ...props, labelled: labelCount > 0 }), { scope })
  return { registerLabel, service, api: connectListbox<PropTypes, unknown>(service, reactNormalize) }
}
