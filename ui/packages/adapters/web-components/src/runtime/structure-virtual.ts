/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 标准结构的虚拟化绑定：开了 virtual 才动态加载这个模块，没开的元素不为 Virtualizer 的内核付体积。选择器与表格共用。
//
// 绑定在宿主元素上加一台 Virtualizer 的状态机，按 virtual- 前缀的作者名接视口、内容层与条目外壳；
// 桥与窗口由元素现读：桥交给宿主自己的机器，窗口交给标准结构铺条目。

import type { Service } from '@xihan-ui/core'
import type { CollectionVirtualizer, VirtualizerItemState, VirtualizerSchema } from '@xihan-ui/headless'
import type { Spreader } from '../dom/spread'
import type { ReactiveControllerHost } from '../reactive'
import { createCounterIdGenerator, createScope } from '@xihan-ui/core'
import { connectVirtualizer, forwardCollectionVirtualizer, virtualizerMachine } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { virtualItemInWindow, VirtualizerWiring } from '../dom/virtualizer-wiring'
import { MachineController } from './machine-controller'

/** 宿主元素交给绑定的东西：条数与预估高度现取，部件查找走元素自己的。 */
export interface StructureVirtualHost {
  readonly host: ReactiveControllerHost
  readonly spreader: Spreader
  readonly count: () => number
  readonly estimateSize: () => number
  /** 谁滚：viewport 是视口自己滚（列表族的浮层），ancestor 是宿主根节点滚（表格）。 */
  readonly scrollContainer: 'viewport' | 'ancestor'
  /** 还没量到的条目按已量到的平均高度估：行高随密度、皮肤变的表格用它。 */
  readonly estimateFromMeasured: boolean
  readonly getPart: (name: string) => HTMLElement | null
  readonly getParts: (name: string) => HTMLElement[]
}

export class StructureVirtualBinding {
  private readonly ctrl: MachineController<VirtualizerSchema>
  private readonly wiring: VirtualizerWiring
  /**
   * 交给宿主机器的转交桥：宿主每次求 props 都要带上桥，而条数又可能经宿主自己的 props 算（表格的数据管线），
   * 现算真桥会绕回自己无限递归；转交桥不变，只在被读、被调时才取真桥
   */
  private readonly forwarded = forwardCollectionVirtualizer(() => this.api()?.collectionVirtualizer)

  constructor(owner: StructureVirtualHost) {
    const scope = createScope(null, createCounterIdGenerator())
    this.ctrl = new MachineController<VirtualizerSchema>(
      owner.host,
      virtualizerMachine,
      () => ({
        count: owner.count(),
        estimateSize: owner.estimateSize(),
        scrollContainer: owner.scrollContainer,
        estimateFromMeasured: owner.estimateFromMeasured,
        viewportTabIndex: -1,
      }),
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

  /** 交给宿主机器的桥；状态机还没建起来时为 undefined。 */
  get bridge(): CollectionVirtualizer | undefined {
    return (this.ctrl.service as Service<VirtualizerSchema> | undefined) ? this.forwarded : undefined
  }

  /** 当下该铺的窗口。 */
  get virtualItems(): readonly VirtualizerItemState[] {
    return this.api()?.virtualItems ?? []
  }

  /** 这个条目外壳此刻在不在窗口里：窗口外的由宿主元素自己收起。 */
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
