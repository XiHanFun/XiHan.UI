/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use filter builder 相关实现。

import type { Service } from '@xihan-ui/core'
import type { FilterBuilderApi, FilterBuilderSchema, FilterBuilderTranslations } from '@xihan-ui/headless'
import { connectFilterBuilder, filterBuilderMachine, filterBuilderTranslations } from '@xihan-ui/headless'
import { useCallback, useState } from 'react'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'

export interface FilterBuilderContext {
  /** label 部件挂载时登记、卸载时注销；根的 aria-labelledby 据此决定输不输出。 */
  registerLabel: () => () => void
  api: FilterBuilderApi
  service: Service<FilterBuilderSchema>
  /** 解析后的文案，给标准结构里的文字用。 */
  translations: FilterBuilderTranslations
}

export function useFilterBuilder(props: FilterBuilderSchema['props']): FilterBuilderContext {
  // connect 按 scope 派生 label、条件与「加条件」钮的 id，同页多实例的 IDREF 与落焦才不相撞
  const scope = useReactScope()
  // 用状态而不是 ref：登记数要能把根重渲一次，connect 在渲染期求值
  const [labelCount, setLabelCount] = useState(0)
  const registerLabel = useCallback(() => {
    setLabelCount(n => n + 1)
    return () => setLabelCount(n => n - 1)
  }, [])
  const service = useMachine(filterBuilderMachine, () => ({ ...props, labelled: labelCount > 0 }), { scope })
  return { registerLabel, api: connectFilterBuilder(service, reactNormalize), service, translations: filterBuilderTranslations(service.prop) }
}
