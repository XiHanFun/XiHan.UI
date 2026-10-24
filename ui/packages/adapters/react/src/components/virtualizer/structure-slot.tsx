/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 标准结构里的虚拟化空位：集合组件开了 virtual 时，Virtualizer 由异步加载进来的视口自己跑，再把桥与窗口回报给宿主根组件。
// 宿主不静态引用 Virtualizer：没开 virtual 的组件不为它的内核付体积。选择器与表格共用这一份。

import type { CollectionVirtualizer, StructureVirtualItem } from '@xihan-ui/headless'
import type { ReactNode } from 'react'
import { createContext, useContext, useEffect, useState } from 'react'

/** 视口回报给宿主的东西：交给机器的桥，与当下该铺的窗口。 */
export interface StructureVirtualWindow {
  bridge: CollectionVirtualizer
  items: readonly StructureVirtualItem[]
}

export interface StructureVirtualSlot {
  /** 条数。不经宿主的 api 求值：api 要读桥，桥又要读 Virtualizer，两边互相取值会成环。 */
  count: number
  /** 每条的预估高度（px），条目渲出后按实测校正。 */
  estimateSize: number
  /** 谁滚：viewport 是视口自己滚（列表族的浮层），ancestor 是宿主根节点滚（表格，吸顶表头与冻结列在同一个滚动面里）。 */
  scrollContainer: 'viewport' | 'ancestor'
  /** 还没量到的条目按已量到的平均高度估：行高随密度、皮肤变的表格用它。 */
  estimateFromMeasured: boolean
  /** 视口把桥与窗口交回宿主；卸载时交 null。 */
  publish: (window: StructureVirtualWindow | null) => void
}

const StructureVirtualContext = createContext<StructureVirtualSlot | null>(null)

export const StructureVirtualProvider = StructureVirtualContext.Provider

export function useStructureVirtual(): StructureVirtualSlot | null {
  return useContext(StructureVirtualContext)
}

type StructureVirtualModule = typeof import('./structure-virtual')

/**
 * 虚拟化部件单独成块：开了 virtual 才加载。
 * 不用 React.lazy：内容层与条目外壳也是这一块里的，各自首次渲染都会让外层 Suspense 重新挂起，
 * 挂起时 React 藏起已显示的子树、跑布局副作用的清理，视口来回撤桥。这里手动加载，到了再换上真部件
 */
function useStructureVirtualModule(virtual: boolean | undefined): StructureVirtualModule | null {
  const [module, setModule] = useState<StructureVirtualModule | null>(null)
  useEffect(() => {
    if (!virtual || module)
      return
    let alive = true
    void import('./structure-virtual').then((loaded) => {
      if (alive)
        setModule(loaded)
    })
    return () => {
      alive = false
    }
  }, [virtual, module])
  return module
}

/** 这一块到之前三个委派部件先空着：窗口随视口一起晚一拍出现。 */
function StructureVirtualPending(): ReactNode {
  return null
}

/** 与 renderStructure 的部件表同一种形状。 */
type PartComponent = (props: never) => ReactNode

const PENDING_PARTS: Readonly<Record<string, PartComponent>> = {
  'virtualizer/virtual-viewport': StructureVirtualPending,
  'virtualizer/virtual-content': StructureVirtualPending,
  'virtualizer/virtual-item': StructureVirtualPending,
}

/** 标准结构里委派给 virtualizer 的三个部件，并进宿主的部件表：开了 virtual 才加载，到之前是空位。 */
export function useStructureVirtualParts(virtual: boolean | undefined): Readonly<Record<string, PartComponent>> {
  const module = useStructureVirtualModule(virtual)
  return module
    ? {
        'virtualizer/virtual-viewport': module.StructureVirtualViewport,
        'virtualizer/virtual-content': module.StructureVirtualContent,
        'virtualizer/virtual-item': module.StructureVirtualItem,
      }
    : PENDING_PARTS
}
