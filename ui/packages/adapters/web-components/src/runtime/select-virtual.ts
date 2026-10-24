/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 选择器标准结构的虚拟化绑定：开了 virtual 才动态加载这个模块，没开的选择器不为 Virtualizer 的内核付体积。
//
// 绑定在选择器元素上加一台 Virtualizer 的状态机，按 virtual- 前缀的作者名接视口、内容层与条目外壳；
// 桥与窗口由元素现读：桥交给选择器的机器，窗口交给标准结构铺条目。

import type { Service } from '@xihan-ui/core'
import type { CollectionVirtualizer, VirtualizerItemState, VirtualizerSchema } from '@xihan-ui/headless'
import type { Spreader } from '../dom/spread'
import type { ReactiveControllerHost } from '../reactive'
import { createCounterIdGenerator, createScope } from '@xihan-ui/core'
import { connectVirtualizer, virtualizerMachine } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { virtualItemInWindow, VirtualizerWiring } from '../dom/virtualizer-wiring'
import { MachineController } from './machine-controller'

/** 选择器元素交给绑定的东西：条数与预估高度现取，部件查找与可见性开关走元素自己的。 */
export interface SelectVirtualHost {
  readonly host: ReactiveControllerHost
  readonly spreader: Spreader
  readonly count: () => number
  readonly estimateSize: () => number
  readonly getPart: (name: string) => HTMLElement | null
  readonly getParts: (name: string) => HTMLElement[]
}

export class SelectVirtualBinding {
  private readonly ctrl: MachineController<VirtualizerSchema>
  private readonly wiring: VirtualizerWiring

  constructor(owner: SelectVirtualHost) {
    const scope = createScope(null, createCounterIdGenerator())
    this.ctrl = new MachineController<VirtualizerSchema>(
      owner.host,
      virtualizerMachine,
      () => ({ count: owner.count(), estimateSize: owner.estimateSize(), viewportTabIndex: -1 }),
      {
        scope,
        // 两个 getter 都懒读：生成的部件要等结构同步完才查得到
        onBuilt: (svc: Service<VirtualizerSchema>) => {
          svc.refs.set('getViewportEl', () => owner.getPart('virtual-viewport'))
          svc.refs.set('getContentEl', () => owner.getPart('virtual-content'))
        },
      },
    )
    this.wiring = new VirtualizerWiring(owner.spreader, {
      viewport: () => owner.getPart('virtual-viewport'),
      content: () => owner.getPart('virtual-content'),
      items: () => owner.getParts('virtual-item'),
    })
  }

  private api(): ReturnType<typeof connectVirtualizer> | null {
    const service = this.ctrl.service as Service<VirtualizerSchema> | undefined
    return service ? connectVirtualizer(service, wcNormalize) : null
  }

  /** 交给选择器机器的桥；状态机还没建起来时为 undefined。 */
  get bridge(): CollectionVirtualizer | undefined {
    return this.api()?.collectionVirtualizer
  }

  /** 当下该铺的窗口。 */
  get virtualItems(): readonly VirtualizerItemState[] {
    return this.api()?.virtualItems ?? []
  }

  /** 这个条目外壳此刻在不在窗口里：窗口外的由选择器元素自己收起。 */
  inWindow(el: HTMLElement): boolean {
    const api = this.api()
    return api ? virtualItemInWindow(api, el) : false
  }

  wire(): void {
    const api = this.api()
    if (api)
      this.wiring.wire(api)
  }
}
