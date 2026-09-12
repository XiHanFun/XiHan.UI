import type { ComputedRef, InjectionKey } from 'vue'
import { inject, provide } from 'vue'

const DISABLED_KEY: InjectionKey<ComputedRef<boolean>> = Symbol.for('xh-button-group-disabled')

/** 把整组的禁用放进子树，组内的按钮据此把自己也禁用掉。 */
export function provideButtonGroupDisabled(disabled: ComputedRef<boolean>): void {
  provide(DISABLED_KEY, disabled)
}

/** 读外层按钮组的禁用；不在组里时是 null。 */
export function useButtonGroupDisabled(): ComputedRef<boolean> | null {
  return inject(DISABLED_KEY, null)
}
