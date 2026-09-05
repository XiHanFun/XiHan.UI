import type { Service } from '@xihan-ui/core'
import type { CollapsibleSchema, FloatButtonApi, FloatButtonNotifiers, FloatButtonProps } from '@xihan-ui/headless'
import type { ComputedRef } from 'vue'
import { createScope } from '@xihan-ui/core'
import { collapsibleMachine, connectFloatButton } from '@xihan-ui/headless'
import { computed } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface FloatButtonContext {
  api: ComputedRef<FloatButtonApi>
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
  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)

  const service = useMachine(collapsibleMachine, (): CollapsibleSchema['props'] => ({
    open: props.open,
    defaultOpen: props.defaultOpen,
    disabled: props.disabled,
    onOpenChange: notify?.onOpenChange,
  }), scope)

  const api = computed(() => connectFloatButton(service, props, vueNormalize))
  return { api, service }
}
