/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 扩展的面板：登记到外框的命名区，在内置区之后追加，按扩展顺序创建、更新与撤掉。
// 面板头操作区里的命令按命令表铺成一小条只显示图标的工具栏，放进 slot="<面板 id>-actions"。

import type { DesignerExtensionBase } from '@xihan-ui/designer-kit'
import type { PropertyEditor } from '@xihan-ui/designer-kit/properties'
import type { DesignerFrameRegion, XhDesignerFrameElement } from '../frame/frame-element'
import type { DesignerSettingsSection } from '../settings/model'
import type { DesignerTourStep } from '../tour/tour'
import type { CommandToolbar, DesignerCommandTable } from './commands'
import { DesignerExtensionError } from '@xihan-ui/designer-kit'
import { DESIGNER_FRAME_REGIONS } from '../frame/frame-element'
import { createCommandToolbar } from './commands'

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
  /** 外框的命名区，即面板的登记：名字、缺省停的栏、标题、图标、能不能挪与浮出等；追加在内置区之后。 */
  readonly region: DesignerFrameRegion
  /** 面板装上时调用，建出面板实例；同一个面板对象只建一次。 */
  readonly create: (context: Ctx) => DesignerPanelInstance<Ctx>
  /** 面板头操作区里的命令（命令 id），按命令表铺成只显示图标的一小条工具栏；给函数时每轮刷新现取。 */
  readonly headerCommands?: readonly string[] | ((context: Ctx) => readonly string[])
}

/** 带面板的设计器层扩展；各款的设计器扩展在此之上加种类、渲染与物料。 */
export interface DesignerShellExtension<Ctx = unknown, Editor = PropertyEditor, Doc = unknown, RuleCtx = unknown> extends DesignerExtensionBase<Ctx, Editor, Doc, RuleCtx> {
  /** 面板：各占外框的一个命名区，同一栏按扩展顺序上下排。 */
  readonly panels?: readonly DesignerPanel<Ctx>[]
  /** 设置分区：放进设置对话框，分区 id 不能与内置的 general 或别的扩展的重名，见 collectSettingsSections。 */
  readonly settings?: readonly DesignerSettingsSection[]
  /** 新手引导的步骤：与 designer-shell 的通用步骤、各款的步骤一起按 order 排；id 不能重名，见 collectTourSteps。 */
  readonly tourSteps?: readonly DesignerTourStep<Ctx>[]
  /** 「关于」页里的几行，如附加包的版本与授权；各款把它们接在自己那几行后面。 */
  readonly about?: readonly { readonly label: string, readonly value: string }[]
}

/** 管一台外框上扩展登记的面板。 */
export interface DesignerPanelHost<Ctx> {
  /**
   * 换成这组扩展的面板：区名与内置区或彼此重名时抛 DesignerExtensionError、什么都不变；
   * 否则外框的区改成内置区加上各面板的区，新面板创建后以 slot 交给外框，去掉的面板撤掉。
   */
  assign: (extensions: readonly Pick<DesignerShellExtension<Ctx>, 'id' | 'panels'>[], context: Ctx) => void
  /** 设计器状态变化后刷新各面板与它们面板头里的命令。 */
  update: (context: Ctx) => void
  /** 撤掉全部面板，外框回到内置区。 */
  dispose: () => void
}

export interface DesignerPanelHostOptions<Ctx = unknown> {
  /** 内置区，缺省为 DESIGNER_FRAME_REGIONS。 */
  readonly regions?: readonly DesignerFrameRegion[]
  /** 设计器此刻的命令表；面板登记了 headerCommands 时按它铺面板头的命令。 */
  readonly commands?: (context: Ctx) => DesignerCommandTable<Ctx>
  /** 面板头命令条的无障碍名称，入参是面板标题。 */
  readonly actionsLabel?: (context: Ctx, title: string) => string
}

/** 面板头操作区里的一小条命令：只显示图标，放进 slot="<面板 id>-actions"。 */
export interface DesignerPanelActions<Ctx> {
  /** 放进外框的元素，已写好 slot。 */
  readonly element: HTMLElement
  /** 换上这几条命令与此刻的状态。 */
  readonly update: (ids: readonly string[], commands: DesignerCommandTable<Ctx>, context: Ctx, label: string) => void
}

/**
 * 建一条面板头命令条：内置面板（物料、属性、问题这类不是扩展登记的面板）由各款自己建好，放进外框；
 * 扩展登记的面板给 headerCommands，由面板宿主建。
 */
export function createPanelActions<Ctx>(doc: Document, panel: string): DesignerPanelActions<Ctx> {
  const toolbar: CommandToolbar<Ctx> = createCommandToolbar<Ctx>(doc, { display: 'icon' })
  toolbar.element.setAttribute('slot', `${panel}-actions`)
  return {
    element: toolbar.element,
    update: (ids, commands, context, label) => {
      toolbar.update(ids.length > 0 ? [ids.filter(id => commands.has(id))] : [], commands, context, label)
      toolbar.element.hidden = !ids.some(id => commands.has(id))
    },
  }
}

export function createPanelHost<Ctx>(frame: XhDesignerFrameElement, options: DesignerPanelHostOptions<Ctx> = {}): DesignerPanelHost<Ctx> {
  const builtins = options.regions ?? DESIGNER_FRAME_REGIONS
  const mounted = new Map<DesignerPanel<Ctx>, DesignerPanelInstance<Ctx>>()
  const actions = new Map<DesignerPanel<Ctx>, DesignerPanelActions<Ctx>>()
  const paintActions = (panel: DesignerPanel<Ctx>, context: Ctx): void => {
    if (panel.headerCommands === undefined || options.commands === undefined)
      return
    let bar = actions.get(panel)
    if (!bar) {
      bar = createPanelActions<Ctx>(frame.ownerDocument, panel.region.name)
      actions.set(panel, bar)
      frame.append(bar.element)
    }
    const ids = typeof panel.headerCommands === 'function' ? panel.headerCommands(context) : panel.headerCommands
    const title = panel.region.title ?? panel.region.name
    bar.update(ids, options.commands(context), context, options.actionsLabel?.(context, title) ?? title)
  }
  const unmount = (panel: DesignerPanel<Ctx>): void => {
    const instance = mounted.get(panel)
    mounted.delete(panel)
    instance?.destroy?.()
    instance?.element.remove()
    actions.get(panel)?.element.remove()
    actions.delete(panel)
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
        paintActions(panel, context)
      }
    },
    update(context) {
      for (const [panel, instance] of mounted) {
        instance.update?.(context)
        paintActions(panel, context)
      }
    },
    dispose() {
      for (const panel of [...mounted.keys()].reverse())
        unmount(panel)
      frame.regions = builtins
    },
  }
}
