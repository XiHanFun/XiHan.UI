import type { Layer, RuntimeConfig, Service } from '@xihan-ui/core'
import type { FloatButtonApi, FloatButtonNotifiers, FloatButtonProps, FloatButtonSchema } from '@xihan-ui/headless'
import type { RefObject } from 'react'
import { createRuntimeConfig } from '@xihan-ui/core'
import { connectFloatButton, floatButtonMachine } from '@xihan-ui/headless'
import { useCallback, useMemo, useRef } from 'react'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'

export interface FloatButtonContext {
  api: FloatButtonApi
  service: Service<FloatButtonSchema>
  rootRef: RefObject<HTMLElement | null>
}

/**
 * 专用机器持有开合与逻辑层生命周期；React 只桥接所属 Document 的配置、登记函数与 root ref。
 */
export function useFloatButton(
  props: FloatButtonProps,
  notify?: FloatButtonNotifiers,
): FloatButtonContext {
  // connect 要派生 trigger 与 list 的 id，因此建 scope：同页多个悬浮钮的 IDREF 才不会相撞
  const scope = useReactScope()
  const rootRef = useRef<HTMLElement | null>(null)
  const config = useMemo<RuntimeConfig | null>(
    () => typeof document === 'undefined' ? null : createRuntimeConfig({ scope }),
    [scope],
  )
  const registerLayer = useCallback((layer: Omit<Layer, 'id'>) => {
    if (!config)
      throw new Error('[xh] FloatButton 在无 DOM 环境不能登记逻辑层')
    return config.layerRegistry.register(layer)
  }, [config])

  const service = useMachine(floatButtonMachine, (): FloatButtonSchema['props'] => ({
    open: props.open,
    defaultOpen: props.defaultOpen,
    disabled: props.disabled,
    expandTrigger: props.expandTrigger,
    onOpenChange: notify?.onOpenChange,
  }), {
    scope,
    onCreate: (svc) => {
      svc.refs.set('config', config)
      svc.refs.set('registerLayer', config ? registerLayer : null)
      svc.refs.set('getRootEl', () => rootRef.current)
    },
  })

  return { api: connectFloatButton(service, props, reactNormalize), service, rootRef }
}
