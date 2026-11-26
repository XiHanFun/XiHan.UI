/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 浮层元素共用的接线：运行时配置、消隐层登记、退场闸门与它们的生命周期，与 Vue / React 的 useOverlay 同一套。
//
// 配置与闸门都懒建：第一次要用时按当下的宿主建，元素离场时一并结清，重连时重建。

import type { Cleanup, IdGenerator, Layer, RuntimeConfig, Scope } from '@xihan-ui/core'
import type { ExitGate, PresenceHandle } from '@xihan-ui/core/presence'
import { createRuntimeConfig } from '@xihan-ui/core'
import { createExitGate } from '@xihan-ui/core/presence'
import { resolveXhConfig } from '../config'

type RegisterLayer = () => { layer: Layer, dispose: Cleanup }

/** 消隐层的登记项：落点节点、种类、分支与模态判定等；点击即关闭本层的表面没有就不写。 */
export type OverlayLayerOptions = Omit<Layer, 'id' | 'surfaces'> & { surfaces?: () => Element[] }

/** 接线往机器的 refs 里写的两样：各浮层组件的 refs 都声明了它们。 */
export interface OverlayLayerRefs {
  set: ((key: 'config', value: RuntimeConfig) => void) & ((key: 'registerLayer', value: RegisterLayer) => void)
}

/** 带退场的浮层还要交 presence。 */
export interface OverlayRefs {
  set: OverlayLayerRefs['set'] & ((key: 'presence', value: PresenceHandle | null) => void)
}

export interface OverlayControllerOptions {
  scope: Scope
  idGenerator: IdGenerator
  /** 每次登记时现求：登记项里不是函数的值（如 opensOnHover）要跟着当下的属性走。 */
  layer: () => OverlayLayerOptions
  /** 不靠落位藏面板的浮层（对话框、抽屉、图片查看器、命令面板）展开后等浮层按需块到了才露出内容。 */
  awaitOverlayKit?: boolean
}

export class OverlayController {
  private configValue: RuntimeConfig | null = null
  private gate: ExitGate | null = null

  constructor(
    private readonly host: HTMLElement & { requestUpdate: () => void },
    private readonly options: OverlayControllerOptions,
  ) {}

  /** 运行时配置：第一次读时建。scrollRoot 每次现读：配置沿祖先链解析，元素搬家或 <xh-config> 改了都要跟上。 */
  get config(): RuntimeConfig {
    this.configValue ??= createRuntimeConfig({
      scope: this.options.scope,
      idGenerator: this.options.idGenerator,
      scrollRoot: () => resolveXhConfig(this.host).scrollRoot?.() ?? null,
    })
    return this.configValue
  }

  /** 已经建好的配置；还没用到时为 null，给只在配置存在时才工作的零件（Portal 控制器）现读。 */
  get currentConfig(): RuntimeConfig | null {
    return this.configValue
  }

  /** 退场闸门；还没建时为 null。 */
  get exit(): ExitGate | null {
    return this.gate
  }

  /** 内容此刻是否应当可见：展开即真，退场动画播完之前也是真；闸门还没建时为假。 */
  get visible(): boolean {
    return this.gate?.visible ?? false
  }

  /**
   * 只交登记函数、不在连接期登记：层的入栈出栈跟着展开态走（机器的效应负责）。
   * 连接期就登记会让层与开合无关地常驻栈里，把同页其它层的 Escape 堵死。
   */
  readonly registerLayer: RegisterLayer = () => this.config.layerRegistry.register({
    surfaces: () => [],
    ...this.options.layer(),
  })

  /** 状态机挂载前建立闸门，让行为资源与视觉退场从第一轮展开起共用生命周期。 */
  ensureExit(open: boolean): ExitGate {
    this.gate ??= createExitGate({
      open,
      onExitComplete: () => this.host.requestUpdate(),
      onOverlayKitReady: this.options.awaitOverlayKit ? () => this.host.requestUpdate() : undefined,
    })
    return this.gate
  }

  /** 把配置与登记函数交给机器；没有退场的浮层（引用卡片、悬浮按钮的拖动层）用它。 */
  injectLayer(refs: OverlayLayerRefs): void {
    refs.set('config', this.config)
    refs.set('registerLayer', this.registerLayer)
  }

  /** 配置、登记函数与 presence 一并交给机器；open 是建闸门那一刻的展开态。 */
  inject(refs: OverlayRefs, open: boolean): void {
    this.injectLayer(refs)
    refs.set('presence', this.ensureExit(open).presence)
  }

  /** data-state 写进 DOM 之后调：接上参与退场的节点并按展开态驱动闸门，返回此刻是否可见。 */
  sync(open: boolean, ...nodes: Array<HTMLElement | null>): boolean {
    const exit = this.ensureExit(open)
    exit.track(...nodes)
    exit.update(open)
    return exit.visible
  }

  /** 元素离场：退场没播完就立刻结清，配置在重连时重建。 */
  dispose(): void {
    this.gate?.dispose()
    this.gate = null
    this.configValue = null
  }
}
