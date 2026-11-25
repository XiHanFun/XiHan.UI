/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 focus trap 相关实现。

import type { Cleanup, Layer, RuntimeConfig, Service } from '@xihan-ui/core'
import type { FocusTrapSchema } from '@xihan-ui/headless'
import { createCounterIdGenerator, createRuntimeConfig, createScope } from '@xihan-ui/core'
import { connectFocusTrap, focusTrapAnatomy, focusTrapMachine, focusTrapMeta } from '@xihan-ui/headless'
import { BOOLEAN_CONVERTER } from '../dom/converters'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

/**
 * `<xh-focus-trap>` —— Light-DOM 行为宿主：激活期间焦点陷在 root 角色节点里，Tab 在里面回绕，停用时把焦点还回去。
 *
 * @customElement xh-focus-trap
 * @attr {boolean} active - 是否陷住焦点，默认 true；写 `active="false"` 停用
 * @attr {boolean} loop - Tab 走到两端时回绕，默认 true
 * @attr {boolean} auto-focus - 激活时把焦点移进来，默认 true
 * @attr {boolean} restore-focus - 停用或移除时把焦点还给激活前的持有者，默认 true
 * @csspart root - 焦点陷在里面的容器（激活时带 tabindex=-1 与 data-state=active）
 */
export class XhFocusTrapElement extends XhElement {
  static override partContract = { anatomy: focusTrapAnatomy, meta: focusTrapMeta }

  static override properties = {
    active: { converter: BOOLEAN_CONVERTER },
    loop: { converter: BOOLEAN_CONVERTER },
    autoFocus: { converter: BOOLEAN_CONVERTER, attribute: 'auto-focus' },
    restoreFocus: { converter: BOOLEAN_CONVERTER, attribute: 'restore-focus' },
  }

  declare active?: boolean
  declare loop?: boolean
  declare autoFocus?: boolean
  declare restoreFocus?: boolean

  private readonly idGen = createCounterIdGenerator()
  private readonly trapScope = createScope(() => this, this.idGen)
  private config: RuntimeConfig | null = null

  private readonly ctrl = new MachineController<FocusTrapSchema>(
    this,
    focusTrapMachine,
    () => this.machineProps(),
    { scope: this.trapScope, onBuilt: svc => this.injectRefs(svc) },
  )

  private machineProps(): Partial<FocusTrapSchema['props']> {
    return {
      active: this.active,
      loop: this.loop,
      autoFocus: this.autoFocus,
      restoreFocus: this.restoreFocus,
    }
  }

  // 只交登记函数：激活期间由机器入栈，停用即出栈；连接期就登记会让停用的陷阱也占着栈顶
  private readonly registerLayer = (): { layer: Layer, dispose: Cleanup } => {
    this.config ??= createRuntimeConfig({ scope: this.trapScope, idGenerator: this.idGen })
    return this.config.layerRegistry.register({
      // 节点就在文档流里，不锁滚动、没有遮罩；只为让开在里面的浮层、压在上面的对话框暂停它
      kind: 'inline',
      node: () => this.getPart('root'),
      branches: () => [],
      isModal: () => false,
      surfaces: () => [],
      // 自己不消解：Escape 越过它交给下面的层
      passesEscape: true,
    })
  }

  // 每次（重）建机器后都要重注：refs 属于机器实例，重连时的新机器不会继承旧的
  private injectRefs(svc: Service<FocusTrapSchema>): void {
    svc.refs.set('getRootEl', () => this.getPart('root'))
    if (typeof document === 'undefined')
      return
    this.config ??= createRuntimeConfig({ scope: this.trapScope, idGenerator: this.idGen })
    svc.refs.set('config', this.config)
    svc.refs.set('registerLayer', this.registerLayer)
  }

  protected wire(): void {
    const api = connectFocusTrap(this.ctrl.service, wcNormalize)
    const root = this.getPart('root')
    if (root)
      this.spreader.spread(root, api.getRootProps())
  }
}
