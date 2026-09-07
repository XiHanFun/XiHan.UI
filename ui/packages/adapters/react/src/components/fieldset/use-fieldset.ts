import type { FieldsetApi, FieldsetProps } from '@xihan-ui/headless'
import { connectFieldset } from '@xihan-ui/headless'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactScope } from '../../runtime/react-id'

export interface FieldsetContext {
  api: FieldsetApi
}

// Fieldset 无状态机：只用一份实例级 scope 派生 part id，props 变了这一帧重算属性
export function useFieldset(props: FieldsetProps): FieldsetContext {
  const scope = useReactScope()
  return { api: connectFieldset(props, scope, reactNormalize) }
}
