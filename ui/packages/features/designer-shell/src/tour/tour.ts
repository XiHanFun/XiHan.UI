/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 新手引导的步骤：各款与扩展登记，按 order 排；目标是外框的一块面板、一个区、工具栏上的一条命令、菜单栏上的一张菜单或任意选择器。
// 设计器每轮按上下文用 resolveTourSteps 取好文字、过一遍 when，交给 <xh-designer-tour>。

import type { Placement } from '@xihan-ui/core'
import type { DesignerSettings } from '../settings/model'
import { DesignerExtensionError } from '@xihan-ui/designer-kit'

/** 一步要高亮的目标。 */
export type DesignerTourTarget
  /** 面板卡片；给了 part 就是面板里 data-part 为它的节点。 */
  = | { readonly panel: string, readonly part?: string }
    /** 工具栏上的这条命令；收在「更多」里时指向「更多」钮。 */
    | { readonly command: string }
    /** 外框的区（menubar、toolbar、canvas、status）。 */
    | { readonly region: string }
    /** 菜单栏上这张菜单的入口（菜单 id，如 file、各款自己的菜单）；窄屏收成「菜单」钮时指向那颗钮。菜单栏上没有这张菜单或菜单栏没显示时跳过。 */
    | { readonly menubar: string }
    /** 设计器里的任意节点，各款的专属部件用。 */
    | { readonly selector: string }

/** 引导的一步。 */
export interface DesignerTourStep<Ctx = unknown> {
  /** 全局唯一：designer-shell 的写 shell.<名>，各款写 <产品>.<名>，扩展写扩展 id 加点。 */
  readonly id: string
  /** 不给就不锚定，浮层居中。 */
  readonly target?: DesignerTourTarget
  readonly title: string | ((context: Ctx) => string)
  readonly description: string | ((context: Ctx) => string)
  /** 浮层相对目标的首选位置。 */
  readonly placement?: Placement
  /** 排序：designer-shell 的通用步骤 0–90，各款 100 起，扩展 200 起；同值按登记顺序。 */
  readonly order?: number
  /** 返回 false 时跳过，如只读模式下的编辑步骤。目标面板隐藏时零件自己跳过，不用写在这里。 */
  readonly when?: (context: Ctx) => boolean
}

/** 交给 <xh-designer-tour> 的一步：文字已按上下文取好，when 已经过了。 */
export interface DesignerTourStepView {
  readonly id: string
  readonly target?: DesignerTourTarget
  readonly title: string
  readonly description: string
  readonly placement?: Placement
  readonly order?: number
}

/** 设置里记着引导已经完成或跳过的键；不对应设置对话框里的条目。 */
export const DESIGNER_TOUR_DONE_KEY = 'help.tourDone'

/** 引导是否已经完成或跳过（设置里 help.tourDone 为 true）。 */
export function tourDoneOf(settings: DesignerSettings | undefined): boolean {
  return settings?.[DESIGNER_TOUR_DONE_KEY] === true
}

/** 按上下文取好文字、过一遍 when；顺序不变，排序由零件做。 */
export function resolveTourSteps<Ctx>(steps: readonly DesignerTourStep<Ctx>[], context: Ctx): DesignerTourStepView[] {
  return steps.filter(step => step.when?.(context) ?? true).map(step => ({
    id: step.id,
    ...(step.target ? { target: step.target } : {}),
    title: typeof step.title === 'function' ? step.title(context) : step.title,
    description: typeof step.description === 'function' ? step.description(context) : step.description,
    ...(step.placement ? { placement: step.placement } : {}),
    ...(step.order === undefined ? {} : { order: step.order }),
  }))
}

/** 带引导步骤的一个来源：扩展 id 与它登记的步骤（扩展的 tourSteps 字段就是这个形状）。 */
export interface DesignerTourStepSource<Ctx = unknown> {
  readonly id: string
  readonly tourSteps?: readonly DesignerTourStep<Ctx>[]
}

/**
 * 合起各来源的步骤，保持登记顺序。步骤 id 重名，或用了留给 designer-shell 的 shell. 前缀时抛 DesignerExtensionError，
 * 名字空间是 tour-step。
 */
export function collectTourSteps<Ctx>(sources: readonly DesignerTourStepSource<Ctx>[]): DesignerTourStep<Ctx>[] {
  const owners = new Map<string, string>()
  const steps: DesignerTourStep<Ctx>[] = []
  for (const source of sources) {
    for (const step of source.tourSteps ?? []) {
      const owner = step.id.startsWith('shell.') ? '@xihan-ui/designer-shell' : owners.get(step.id)
      if (owner !== undefined)
        throw new DesignerExtensionError('tour-step', step.id, [owner, source.id])
      owners.set(step.id, source.id)
      steps.push(step)
    }
  }
  return steps
}
