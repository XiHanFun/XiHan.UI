/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 页面结构面板：把 <xh-designer-outline> 包成外框里的一块面板。各款只写一个适配器，给出树与选中的行，
// 把选中、标出、删除与挪动翻成自己的操作；面板的标题与帮助取零件文案，读的时候按全局配置现取。

import type { DesignerPanel, DesignerPanelInstance } from '../extensions/panels'
import type { DesignerFrameRegion } from '../frame/frame-element'
import type { DesignerOutlineTranslations } from '../translations'
import type { DesignerOutlineEventMap, DesignerOutlineMove, DesignerOutlineNode } from './outline-element'
import { resolveXhConfig } from '@xihan-ui/web-components'
import { defineDesignerShellElement } from '../define'
import { DESIGNER_OUTLINE_EN_US } from '../locale/en-US'
import { XhDesignerOutlineElement } from './outline-element'

/** 页面结构的适配器：各款写的唯一一块，把树上的操作翻成自己的。 */
export interface DesignerOutlineAdapter<Ctx> {
  /** 整棵树；面板每次刷新都会再取，同一份文档要给出稳定的 id。 */
  readonly nodes: (context: Ctx) => readonly DesignerOutlineNode[]
  /** 画布上当前选中的行 id。 */
  readonly selection: (context: Ctx) => readonly string[]
  /** 选中这些行，并把第一个滚进画布的可见区（必要时切页、切页签、展开折叠项）。 */
  readonly select: (context: Ctx, ids: readonly string[]) => void
  /** 在画布上标出这一行对应的东西，null 撤掉；不改选择、不滚动。 */
  readonly highlight: (context: Ctx, id: string | null) => void
  /** 删除这些行，通常是先选中再走设计器自己的删除。 */
  readonly remove: (context: Ctx, ids: readonly string[]) => void
  /** 这一次挪动许不许；不给即不能拖，也不能用 Alt + 方向键挪。 */
  readonly canMove?: (context: Ctx, move: DesignerOutlineMove) => boolean
  /** 执行一次挪动，记为一步撤销；与 canMove 要么都给，要么都不给。 */
  readonly move?: (context: Ctx, move: DesignerOutlineMove) => void
}

/** createOutlinePanel 的选项。 */
export interface DesignerOutlinePanelOptions<Ctx> {
  /**
   * 面板登记里要换的项，如缺省停的栏、图标与 defaultHidden；缺省区名 outline、停在左栏。
   * 标题与帮助取零件文案 xh-designer-outline 的 title、help，不在这里写。
   */
  readonly region?: Partial<Omit<DesignerFrameRegion, 'title' | 'help'>>
  /** 显示搜索框，缺省 true。 */
  readonly searchable?: boolean
  /** 返回 true 时只读：能选、能标出，不能删、不能挪。 */
  readonly readonly?: (context: Ctx) => boolean
  /**
   * 这块面板自己的文案，压在零件文案之上：标题、帮助与零件里的搜索框、空状态等都用它，没给的项照旧取零件文案。
   * 读的时候现取，按全局配置换语言；同一页面放几款设计器时，各款经它换掉自己那块的说法，不去改全局的那一桶。
   */
  readonly translations?: () => Partial<DesignerOutlineTranslations>
}

/** 零件文案：内置英文垫底，全局配置里 xh-designer-outline 那一桶压上去，面板自己的文案再压上去。 */
function outlineTexts(own?: Partial<DesignerOutlineTranslations>): DesignerOutlineTranslations {
  return { ...DESIGNER_OUTLINE_EN_US, ...resolveXhConfig(null).translations?.['xh-designer-outline'], ...own }
}

/**
 * 建一块页面结构面板，放进各款内置扩展的 panels。
 * 面板的区名缺省 outline、停在左栏；标题与帮助是读的时候现取的零件文案，设计器每次把区交给外框时跟着语言变。
 * 每次刷新重取树与选中的行，内容没变时不重设；树上的选中、标出、删除与挪动转给适配器，同一行不重复标出，
 * 面板撤掉时撤掉标出。一个面板对象可以在多个设计器实例上各建一份。
 * 适配器只给了 canMove、move 之一时抛 TypeError。
 */
export function createOutlinePanel<Ctx>(adapter: DesignerOutlineAdapter<Ctx>, options: DesignerOutlinePanelOptions<Ctx> = {}): DesignerPanel<Ctx> {
  if ((adapter.canMove === undefined) !== (adapter.move === undefined))
    throw new TypeError('[xh] createOutlinePanel: adapter.canMove and adapter.move must be given together')
  const region: DesignerFrameRegion = {
    name: 'outline',
    position: 'start',
    ...options.region,
    get title() {
      return outlineTexts(options.translations?.()).title
    },
    get help() {
      return outlineTexts(options.translations?.()).help
    },
  }
  const create = (context: Ctx): DesignerPanelInstance<Ctx> => {
    defineDesignerShellElement('xh-designer-outline', XhDesignerOutlineElement)
    const element = document.createElement('xh-designer-outline')
    element.headless = true
    element.searchable = options.searchable ?? true
    let current = context
    let highlighted: string | null = null
    let nodesKey: string | undefined
    let selectionKey: string | undefined
    let translationsKey: string | undefined
    const highlight = (id: string | null): void => {
      if (id === highlighted)
        return
      highlighted = id
      adapter.highlight(current, id)
    }
    const allowMove = (move: DesignerOutlineMove): boolean => adapter.canMove?.(current, move) ?? false
    element.addEventListener('node-select', event => adapter.select(current, (event as DesignerOutlineEventMap['node-select']).detail.ids))
    element.addEventListener('node-highlight', event => highlight((event as DesignerOutlineEventMap['node-highlight']).detail.id))
    element.addEventListener('node-delete', event => adapter.remove(current, (event as DesignerOutlineEventMap['node-delete']).detail.ids))
    element.addEventListener('node-move', event => adapter.move?.(current, (event as DesignerOutlineEventMap['node-move']).detail))
    const update = (next: Ctx): void => {
      current = next
      const own = options.translations?.()
      const nextTranslationsKey = JSON.stringify(own ?? null)
      if (nextTranslationsKey !== translationsKey) {
        translationsKey = nextTranslationsKey
        element.translations = own
      }
      const nodes = adapter.nodes(next)
      const nextNodesKey = JSON.stringify(nodes)
      if (nextNodesKey !== nodesKey) {
        nodesKey = nextNodesKey
        element.nodes = nodes
      }
      const selection = adapter.selection(next)
      const nextSelectionKey = JSON.stringify(selection)
      if (nextSelectionKey !== selectionKey) {
        selectionKey = nextSelectionKey
        element.selection = selection
      }
      const readonly = options.readonly?.(next) === true
      element.readonly = readonly
      element.allowMove = adapter.canMove === undefined || readonly ? undefined : allowMove
    }
    update(context)
    return {
      element,
      update,
      destroy: () => highlight(null),
    }
  }
  return { region, create }
}
