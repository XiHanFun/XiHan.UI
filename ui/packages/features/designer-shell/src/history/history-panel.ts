/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 历史记录面板：把 <xh-designer-history> 包成外框里的一块面板。各款只写一个适配器，给出快照、跳转与播报；
// 面板缺省停在右栏、缺省隐藏，面板头是清空历史，标题与帮助取零件文案，读的时候按全局配置现取。

import type { HistorySnapshot } from '@xihan-ui/designer-kit'
import type { DesignerPanel, DesignerPanelInstance } from '../extensions/panels'
import type { DesignerFrameRegion } from '../frame/frame-element'
import type { DesignerHistoryTranslations } from '../translations'
import type { DesignerHistoryEventMap } from './history-element'
import { resolveXhConfig } from '@xihan-ui/web-components'
import { defineDesignerShellElement } from '../define'
import { DESIGNER_HISTORY_EN_US } from '../locale/en-US'
import { DESIGNER_HISTORY_COMMANDS } from './history-commands'
import { XhDesignerHistoryElement } from './history-element'

/** 历史记录的适配器：各款写的唯一一块。 */
export interface DesignerHistoryAdapter<Ctx> {
  /** 此刻的快照，说明已按此刻的语言取成字符串（designer-kit 的 snapshotHistory）；面板每次刷新都会再取。 */
  readonly snapshot: (context: Ctx) => HistorySnapshot
  /** 跳到某一步或起点（快照里的位置号），一次跳到、记录不变；只读、预览这类不许改的状态下由各款自己挡住。 */
  readonly goTo: (context: Ctx, position: number) => void
  /** 读屏播报，通常交给外框的 announce；不给就不播。 */
  readonly announce?: (context: Ctx, message: string) => void
}

/** createHistoryPanel 的选项。 */
export interface DesignerHistoryPanelOptions<Ctx> {
  /**
   * 面板登记里要换的项，如图标、缺省停的栏与 defaultHidden；缺省区名 history、停在右栏、缺省隐藏。
   * 标题与帮助取零件文案 xh-designer-history 的 title、help，不在这里写。
   */
  readonly region?: Partial<Omit<DesignerFrameRegion, 'title' | 'help'>>
  /** 返回 true 时只读：只能看，不能跳。 */
  readonly readonly?: (context: Ctx) => boolean
}

/** 零件文案：内置英文垫底，全局配置里 xh-designer-history 那一桶压上去。 */
function historyTexts(): DesignerHistoryTranslations {
  return { ...DESIGNER_HISTORY_EN_US, ...resolveXhConfig(null).translations?.['xh-designer-history'] }
}

/**
 * 建一块历史记录面板，放进各款内置扩展的 panels。
 * 区名缺省 history、停在右栏、缺省隐藏：右栏的内置面板之后，打开后在属性下面。面板头是清空历史（clear-history），
 * 设计器的命令表里要有它（designerHistoryCommands），createPanelHost 要给 commands 才铺得出来。
 * 标题与帮助是读的时候现取的零件文案，设计器每次把区交给外框时跟着语言变。每次刷新重取快照，内容没变时不重设；
 * 选一行转给适配器的 goTo，到了以后零件经适配器的 announce 播报。一个面板对象可以在多个设计器实例上各建一份。
 */
export function createHistoryPanel<Ctx>(adapter: DesignerHistoryAdapter<Ctx>, options: DesignerHistoryPanelOptions<Ctx> = {}): DesignerPanel<Ctx> {
  const region: DesignerFrameRegion = {
    name: 'history',
    position: 'end',
    defaultHidden: true,
    ...options.region,
    get title() {
      return historyTexts().title
    },
    get help() {
      return historyTexts().help
    },
  }
  const create = (context: Ctx): DesignerPanelInstance<Ctx> => {
    defineDesignerShellElement('xh-designer-history', XhDesignerHistoryElement)
    const element = document.createElement('xh-designer-history')
    element.headless = true
    let current = context
    let snapshotKey: string | undefined
    element.announce = message => adapter.announce?.(current, message)
    element.addEventListener('history-go', event => adapter.goTo(current, (event as DesignerHistoryEventMap['history-go']).detail.position))
    const update = (next: Ctx): void => {
      current = next
      const snapshot = adapter.snapshot(next)
      const nextKey = JSON.stringify(snapshot)
      if (nextKey !== snapshotKey) {
        snapshotKey = nextKey
        element.snapshot = snapshot
      }
      element.readonly = options.readonly?.(next) === true
    }
    update(context)
    return { element, update }
  }
  return { region, create, headerCommands: [DESIGNER_HISTORY_COMMANDS.clearHistory] }
}
