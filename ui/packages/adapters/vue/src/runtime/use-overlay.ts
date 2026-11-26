/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 浮层族共用的接线：运行时配置、消隐层登记、退场闸门与落点解析，与 React 的 useOverlay 同一套。
//
// 服务端没有 DOM：不建配置、不登记层，闸门退化成「可见与否跟着展开态」，落点回到 body。

import type { Cleanup, IdGenerator, Layer, RuntimeConfig, Scope } from '@xihan-ui/core'
import type { PresenceHandle } from '@xihan-ui/core/presence'
import type { ComputedRef, Ref } from 'vue'
import { createRuntimeConfig } from '@xihan-ui/core'
import { computed } from 'vue'
import { useXhConfig } from '../config/config'
import { useOverlayExit } from './use-overlay-exit'

type RegisterLayer = () => { layer: Layer, dispose: Cleanup }

/** 接线往机器的 refs 里写的两样：各浮层组件的 refs 都声明了它们。 */
export interface OverlayLayerRefs {
  set: ((key: 'config', value: RuntimeConfig) => void) & ((key: 'registerLayer', value: RegisterLayer) => void)
}

/** 带退场的浮层还要交 presence。 */
export interface OverlayRefs {
  set: OverlayLayerRefs['set'] & ((key: 'presence', value: PresenceHandle | null) => void)
}

/** 消隐层的登记项：落点节点、种类、分支与模态判定等；点击即关闭本层的表面没有就不写。 */
export type OverlayLayerOptions = Omit<Layer, 'id' | 'surfaces'> & { surfaces?: () => Element[] }

export interface UseOverlayLayerOptions {
  scope: Scope
  idGenerator: IdGenerator
  /** 收 config 与 registerLayer 的那台机器；入栈出栈由机器的效应按展开态驱动。 */
  service: { refs: OverlayLayerRefs }
  /** 每次登记时现求：登记项里不是函数的值（如 opensOnHover）要跟着当下的 props 走。 */
  layer: () => OverlayLayerOptions
  /** 只在有 DOM 时交给机器的 refs：定位引擎、取节点的函数等。 */
  refs?: (config: RuntimeConfig) => void
  /** 作者写在实例上的浮层容器，排在全局配置之前。 */
  container?: () => string | Element | null | undefined
}

export interface OverlayLayerWiring {
  /** 运行时配置；服务端为 null。 */
  config: RuntimeConfig | null
  /** 浮层迁移到的位置：实例的容器 > 全局配置的容器 > 运行时的浮层落点 > body。 */
  portalTarget: ComputedRef<string | Element>
}

/** 只要配置、层登记与落点、不带退场的浮层（引用卡片、焦点陷阱、菜单栏的整组登记）用这一件。 */
export function useOverlayLayer(options: UseOverlayLayerOptions): OverlayLayerWiring {
  const { scope, idGenerator, service, layer } = options
  const xhConfig = useXhConfig()
  let config: RuntimeConfig | null = null

  if (typeof document !== 'undefined') {
    const created = createRuntimeConfig({
      scope,
      idGenerator,
      // 宿主把滚动搬进内容容器时 body 本身不滚，加锁会是空操作；这条把真正在滚的那层交给滚动锁
      scrollRoot: () => xhConfig.value.scrollRoot?.() ?? null,
    })
    config = created
    // 只交登记函数，入栈出栈由机器的效应按展开态驱动
    const registerLayer: RegisterLayer = () => created.layerRegistry.register({
      surfaces: () => [],
      ...layer(),
    })
    service.refs.set('config', created)
    service.refs.set('registerLayer', registerLayer)
    options.refs?.(created)
  }

  // 实例给的容器优先，其次全局配置，否则落到运行时那个单一浮层落点；没有 DOM 时才回到 body
  const portalTarget = computed<string | Element>(() => options.container?.() ?? xhConfig.value.portalContainer?.() ?? config?.portalContainer() ?? 'body')
  return { config, portalTarget }
}

export interface UseOverlayOptions extends UseOverlayLayerOptions {
  service: { refs: OverlayRefs }
  /** 当前逻辑上是否展开；闸门跟着它驱动 presence。 */
  isOpen: () => boolean
  /** 退场动画从它上面探测。 */
  contentRef: Ref<HTMLElement | null>
  /** 与 content 共同决定退出完成的其他真实视觉节点，如遮罩。 */
  additionalExitRefs?: Array<Ref<HTMLElement | null>>
  /** 不靠落位藏面板的浮层（对话框、抽屉、图片查看器、命令面板）展开后等浮层按需块到了才露出内容。 */
  awaitOverlayKit?: boolean
}

export interface OverlayWiring extends OverlayLayerWiring {
  /** 当前是否应当可见：展开即真，退场动画播完之前也是真。 */
  visible: Ref<boolean>
}

/**
 * 配置、层登记、退场闸门与落点一并接上，presence 交给同一台机器。
 * isOpen 在接线的最后才第一次读：取 connect 结果的 computed 可以先建好再传进来，refs 都已就位。
 */
export function useOverlay(options: UseOverlayOptions): OverlayWiring {
  const { config, portalTarget } = useOverlayLayer(options)
  const visible = useOverlayExit({
    config,
    isOpen: options.isOpen,
    contentRef: options.contentRef,
    additionalExitRefs: options.additionalExitRefs,
    onPresence: presence => options.service.refs.set('presence', presence),
    awaitOverlayKit: options.awaitOverlayKit,
  })
  return { config, portalTarget, visible }
}
