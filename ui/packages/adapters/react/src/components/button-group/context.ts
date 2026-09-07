import type { PropTypes } from '@xihan-ui/core'
import type { connectButtonGroup } from '@xihan-ui/headless'
import { createContext, useContext } from 'react'

/** 从实际调用推出 api 形状，免得再写一遍 normalize 的类型参数。 */
type ReactButtonGroupApi = ReturnType<typeof connectButtonGroup<PropTypes>>

const DisabledCtx = createContext<boolean | undefined>(undefined)
const ApiCtx = createContext<ReactButtonGroupApi | undefined>(undefined)

/** 把整组的禁用放进子树，组内的按钮据此把自己也禁用掉。 */
export const ButtonGroupDisabledProvider = DisabledCtx

/** 读外层按钮组的禁用；不在组里时是 undefined。 */
export function useButtonGroupDisabled(): boolean | undefined {
  return useContext(DisabledCtx)
}

/** 把整组的 api 放进子树，段间装饰线从这里取属性。 */
export const ButtonGroupApiProvider = ApiCtx

export function useButtonGroupApi(): ReactButtonGroupApi {
  const api = useContext(ApiCtx)
  if (!api)
    throw new Error('[xh] XhButtonGroup 的子部件必须放在 XhButtonGroup 里')
  return api
}
