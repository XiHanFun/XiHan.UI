import type { connectButtonGroup } from '@xihan-ui/headless'
import type { ComputedRef, InjectionKey } from 'vue'
import { inject, provide } from 'vue'

/** 从实际调用推出 api 形状，免得再写一遍 normalize 的类型参数。 */
type VueButtonGroupApi = ReturnType<typeof connectButtonGroup>

const DISABLED_KEY: InjectionKey<ComputedRef<boolean>> = Symbol.for('xh-button-group-disabled')
const API_KEY: InjectionKey<ComputedRef<VueButtonGroupApi>> = Symbol.for('xh-button-group')

/** 把整组的禁用放进子树，组内的按钮据此把自己也禁用掉。 */
export function provideButtonGroupDisabled(disabled: ComputedRef<boolean>): void {
  provide(DISABLED_KEY, disabled)
}

/** 读外层按钮组的禁用；不在组里时是 null。 */
export function useButtonGroupDisabled(): ComputedRef<boolean> | null {
  return inject(DISABLED_KEY, null)
}

export function provideButtonGroupApi(api: ComputedRef<VueButtonGroupApi>): void {
  provide(API_KEY, api)
}

export function useButtonGroupApi(): ComputedRef<VueButtonGroupApi> {
  const api = inject(API_KEY, null)
  if (!api)
    throw new Error('[xh] XhButtonGroup 的子部件必须放在 XhButtonGroup 里')
  return api
}
