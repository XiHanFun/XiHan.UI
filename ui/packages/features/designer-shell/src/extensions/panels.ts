/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 扩展的面板：登记到外框的命名区，在内置区之后追加，按扩展顺序创建、更新与撤掉。

import type { DesignerExtensionBase } from '@xihan-ui/designer-kit'
import type { PropertyEditor } from '@xihan-ui/designer-kit/properties'
import type { DesignerFrameRegion, XhDesignerFrameElement } from '../frame/frame-element'
import { DesignerExtensionError } from '@xihan-ui/designer-kit'
import { DESIGNER_FRAME_REGIONS } from '../frame/frame-element'

/** 面板实例：element 放进外框的区，设计器状态变化时调用 update，撤掉前调用 destroy。 */
export interface DesignerPanelInstance<Ctx = unknown> {
  /** 面板的根元素，以 slot 交给外框，放进登记的那个区。 */
  readonly element: HTMLElement
  /** 设计器状态变化后调用，面板按新状态刷新。 */
  readonly update?: (context: Ctx) => void
  /** 面板被撤掉前调用。 */
  readonly destroy?: () => void
}

/** 扩展登记的一个面板：占外框的一个命名区，区名不能与内置区或别的扩展的重名。 */
export interface DesignerPanel<Ctx = unknown> {
  /** 外框的命名区：名字、位置、缺省与最小大小、分隔条上的区名；追加在内置区之后。 */
  readonly region: DesignerFrameRegion
  /** 面板装上时调用，建出面板实例；同一个面板对象只建一次。 */
  readonly create: (context: Ctx) => DesignerPanelInstance<Ctx>
}

/** 带面板的设计器层扩展；各款的设计器扩展在此之上加种类、渲染与物料。 */
export interface DesignerShellExtension<Ctx = unknown, Editor = PropertyEditor, Doc = unknown, RuleCtx = unknown> extends DesignerExtensionBase<Ctx, Editor, Doc, RuleCtx> {
  /** 面板：各占外框的一个命名区，同一位置按扩展顺序上下排。 */
  readonly panels?: readonly DesignerPanel<Ctx>[]
}

/** 管一台外框上扩展登记的面板。 */
export interface DesignerPanelHost<Ctx> {
  /**
   * 换成这组扩展的面板：区名与内置区或彼此重名时抛 DesignerExtensionError、什么都不变；
   * 否则外框的区改成内置区加上各面板的区，新面板创建后以 slot 交给外框，去掉的面板撤掉。
   */
  assign: (extensions: readonly Pick<DesignerShellExtension<Ctx>, 'id' | 'panels'>[], context: Ctx) => void
  /** 设计器状态变化后刷新各面板。 */
  update: (context: Ctx) => void
  /** 撤掉全部面板，外框回到内置区。 */
  dispose: () => void
}

export interface DesignerPanelHostOptions {
  /** 内置区，缺省为 DESIGNER_FRAME_REGIONS。 */
  readonly regions?: readonly DesignerFrameRegion[]
}

export function createPanelHost<Ctx>(frame: XhDesignerFrameElement, options: DesignerPanelHostOptions = {}): DesignerPanelHost<Ctx> {
  const builtins = options.regions ?? DESIGNER_FRAME_REGIONS
  const mounted = new Map<DesignerPanel<Ctx>, DesignerPanelInstance<Ctx>>()
  const unmount = (panel: DesignerPanel<Ctx>): void => {
    const instance = mounted.get(panel)
    mounted.delete(panel)
    instance?.destroy?.()
    instance?.element.remove()
  }
  return {
    assign(extensions, context) {
      const owners = new Map<string, string>(builtins.map(region => [region.name, 'builtin']))
      const panels: DesignerPanel<Ctx>[] = []
      for (const extension of extensions) {
        for (const panel of extension.panels ?? []) {
          const previous = owners.get(panel.region.name)
          if (previous !== undefined)
            throw new DesignerExtensionError('panel', panel.region.name, [previous, extension.id])
          owners.set(panel.region.name, extension.id)
          panels.push(panel)
        }
      }
      const kept = new Set(panels)
      for (const panel of [...mounted.keys()]) {
        if (!kept.has(panel))
          unmount(panel)
      }
      frame.regions = [...builtins, ...panels.map(panel => panel.region)]
      for (const panel of panels) {
        if (mounted.has(panel))
          continue
        const instance = panel.create(context)
        instance.element.setAttribute('slot', panel.region.name)
        mounted.set(panel, instance)
        frame.append(instance.element)
      }
    },
    update(context) {
      for (const instance of mounted.values())
        instance.update?.(context)
    },
    dispose() {
      for (const panel of [...mounted.keys()].reverse())
        unmount(panel)
      frame.regions = builtins
    },
  }
}
