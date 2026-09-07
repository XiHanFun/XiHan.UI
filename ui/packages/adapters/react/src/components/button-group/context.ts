import { createContext, useContext } from 'react'

const DisabledCtx = createContext<boolean | undefined>(undefined)

/** 把整组的禁用放进子树，组内的按钮据此把自己也禁用掉。 */
export const ButtonGroupDisabledProvider = DisabledCtx

/** 读外层按钮组的禁用；不在组里时是 undefined。 */
export function useButtonGroupDisabled(): boolean | undefined {
  return useContext(DisabledCtx)
}
