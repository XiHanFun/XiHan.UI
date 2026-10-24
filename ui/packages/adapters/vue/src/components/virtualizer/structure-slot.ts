/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 标准结构里的虚拟化空位：集合组件开了 virtual 时，Virtualizer 由异步加载进来的视口自己跑，宿主根组件只留这个空位等它登记。
// 宿主不静态引用 Virtualizer：没开 virtual 的组件不为它的内核付体积。选择器与表格共用这一份。

import type { Component, InjectionKey, ShallowRef } from 'vue'
import type { VirtualizerContext } from './use-virtualizer'
import { defineAsyncComponent, inject, provide } from 'vue'

export interface StructureVirtualSlot {
  /**
   * 条数。不经宿主的 api 求值：api 要读 virtualizer 这条桥，桥又要读 Virtualizer 的 api，两边互相取值会成环。
   */
  count: () => number
  /** 每条的预估高度（px），条目渲出后按实测校正。 */
  estimateSize: () => number
  /** 谁滚：viewport 是视口自己滚（列表族的浮层），ancestor 是宿主根节点滚（表格，吸顶表头与冻结列在同一个滚动面里）。 */
  scrollContainer: 'viewport' | 'ancestor'
  /** 还没量到的条目按已量到的平均高度估：行高随密度、皮肤变的表格用它。 */
  estimateFromMeasured: boolean
  /** 视口挂上来之前为 null：此时宿主不带虚拟化桥，窗口里也还没有条目。 */
  view: ShallowRef<VirtualizerContext | null>
}

const STRUCTURE_VIRTUAL: InjectionKey<StructureVirtualSlot> = Symbol.for('xh-structure-virtual')

export function provideStructureVirtual(slot: StructureVirtualSlot): void {
  provide(STRUCTURE_VIRTUAL, slot)
}

export function useStructureVirtual(): StructureVirtualSlot | undefined {
  return inject(STRUCTURE_VIRTUAL, undefined)
}

/** 虚拟化部件单独成块：开了 virtual 才加载。 */
const load = (): Promise<typeof import('./structure-virtual')> => import('./structure-virtual')

/** 标准结构里委派给 virtualizer 的三个部件，并进宿主的部件表。 */
export const STRUCTURE_VIRTUAL_PARTS: Readonly<Record<string, Component>> = {
  'virtualizer/virtual-viewport': /* @__PURE__ */ defineAsyncComponent(() => load().then(m => m.StructureVirtualViewport)),
  'virtualizer/virtual-content': /* @__PURE__ */ defineAsyncComponent(() => load().then(m => m.StructureVirtualContent)),
  'virtualizer/virtual-item': /* @__PURE__ */ defineAsyncComponent(() => load().then(m => m.StructureVirtualItem)),
}
