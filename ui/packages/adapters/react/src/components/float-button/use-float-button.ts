import type { Service } from '@xihan-ui/core'
import type { CollapsibleSchema, FloatButtonApi, FloatButtonNotifiers, FloatButtonProps } from '@xihan-ui/headless'
import { collapsibleMachine, connectFloatButton } from '@xihan-ui/headless'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'

export interface FloatButtonContext {
  api: FloatButtonApi
  service: Service<CollapsibleSchema>
}

/**
 * 开合、受控回写与通知全交给 collapsible 机器：一颗触发器管着一组内容的开合，正是那台机器的活儿。
 * 落位、外形与展开方式不入机器，直接进 connect——它们不改开合。
 */
export function useFloatButton(
  props: FloatButtonProps,
  notify?: FloatButtonNotifiers,
): FloatButtonContext {
  // connect 要派生 trigger 与 list 的 id，因此建 scope：同页多个悬浮钮的 IDREF 才不会相撞
  const scope = useReactScope()

  const service = useMachine(collapsibleMachine, (): CollapsibleSchema['props'] => ({
    open: props.open,
    defaultOpen: props.defaultOpen,
    disabled: props.disabled,
    onOpenChange: notify?.onOpenChange,
  }), { scope })

  return { api: connectFloatButton(service, props, reactNormalize), service }
}
