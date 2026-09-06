import type { FieldApi, FieldProps } from '@xihan-ui/headless'
import { connectField } from '@xihan-ui/headless'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactScope } from '../../runtime/react-id'

export interface FieldContext {
  api: FieldApi
}

/** Field 没有状态机：一份实例级 scope 派生部件 id，属性每帧由 connect 现算。 */
export function useField(props: FieldProps): FieldContext {
  const scope = useReactScope()
  return { api: connectField(props, scope, reactNormalize) }
}
