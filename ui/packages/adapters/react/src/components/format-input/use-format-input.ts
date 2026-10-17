/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use format input 相关实现。

import type { Service } from '@xihan-ui/core'
import type { FormatInputApi, FormatInputSchema, FormatInputTranslations } from '@xihan-ui/headless'
import { connectFormatInput, formatInputMachine, formatInputTranslations } from '@xihan-ui/headless'
import { useCallback, useState } from 'react'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'

export interface FormatInputContext {
  /** label 部件挂载时登记、卸载时注销；根的 aria-labelledby 据此决定输不输出。 */
  registerLabel: () => () => void
  api: FormatInputApi
  service: Service<FormatInputSchema>
  /** 解析后的文案，给标准结构里的名字与说明用。 */
  translations: FormatInputTranslations
}

export function useFormatInput(props: FormatInputSchema['props']): FormatInputContext {
  // connect 按 scope 派生 label、样例与说明的 id，同页多实例的 IDREF 才不相撞
  const scope = useReactScope()
  // 用状态而不是 ref：登记数要能把根重渲一次，connect 在渲染期求值
  const [labelCount, setLabelCount] = useState(0)
  const registerLabel = useCallback(() => {
    setLabelCount(n => n + 1)
    return () => setLabelCount(n => n - 1)
  }, [])
  const service = useMachine(formatInputMachine, () => ({ ...props, labelled: labelCount > 0 }), { scope })
  return { registerLabel, api: connectFormatInput(service, reactNormalize), service, translations: formatInputTranslations(service.prop) }
}
