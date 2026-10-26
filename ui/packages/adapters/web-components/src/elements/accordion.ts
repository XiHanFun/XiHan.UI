/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 accordion 相关实现。

import type { ControlVariant, Direction, Orientation, Size, Tone } from '@xihan-ui/core'
import type { AccordionItemProps, AccordionNode, AccordionSchema, AccordionValueChangeDetails } from '@xihan-ui/headless'
import type { ElementStructure } from '../element-base'
import type { OverlayExit } from '../overlay-exit'
import { isItemDisabled } from '@xihan-ui/core'
import { accordionAnatomy, accordionMachine, accordionMeta, accordionStructure, connectAccordion } from '@xihan-ui/headless'
import { BOOLEAN_CONVERTER } from '../dom/converters'
import { GEN_ATTR } from '../dom/generated-nodes'
import { wcNormalize } from '../dom/normalize'
import { STRUCTURE_MARK } from '../dom/structure'
import { XhElement } from '../element-base'
import { createOverlayExit } from '../overlay-exit'
import { LazyContent } from '../runtime/lazy-content'
import { MachineController } from '../runtime/machine-controller'

const ITEM_SELECTOR = '[data-xh-part="item"]'

/**
 * `<xh-accordion>`：手风琴行为宿主，条目身份写在 item 节点的 value 属性上。
 *
 * 不写部件时元素按标准结构生成：collection 里每条一个条目，标题里的按钮装标题文字与指示符，正文取 content；
 * 只写 root 时生成在它里面。某一条的正文可用宿主直接子节点 `slot="content:<值>"` 接管；要按 lazy-mount 第一次展开才实例化，
 * 写成 `<template slot="content:<值>">`。
 *
 * @customElement xh-accordion
 * @attr {'ltr'|'rtl'} dir - 文字方向，影响水平轴左右键语义
 * @attr {boolean} multiple - 允许多项同时展开
 * @attr {boolean} collapsible - 允许收起最后一个展开项
 * @attr {boolean} loop - 方向键到达末尾回绕，默认关闭
 * @attr {boolean} disabled - 整组禁用
 * @attr {'outline'|'subtle'|'ghost'} variant - 形态：ghost 条目直接相邻不画容器，outline 为单一连续表面，subtle 为淡底；默认 ghost
 * @attr {'horizontal'|'vertical'} orientation - 方向键轴向，默认 vertical
 * @attr {'brand'|'neutral'|'success'|'warning'|'danger'|'info'} tone - 语气
 * @attr {'sm'|'md'|'lg'} size - 尺寸
 * @attr {boolean} lazy-mount - 条目内容第一次展开时才挂载；内容写在面板里的一个 `<template>` 中时首次展开才实例化
 * @attr {boolean} unmount-on-exit - 收起动画播完后卸载条目内容，再展开时从 `<template>` 重新克隆（没写模板时原样放回）
 * @attr {'region'|'group'} content-role - 条目正文的角色：region 是以标题命名的地标（默认），group 不进地标导航
 * @fires value-change - 展开集合变化；detail 为 `{ value: string[] }`
 * @csspart root - 手风琴根容器
 * @csspart item - 单个条目容器，作者在此写 value 与可选 disabled
 * @csspart item-separator - 条目之间的细线，可省略
 * @csspart header - 条目标题
 * @csspart trigger - 展开 / 收起按钮
 * @csspart content - 条目面板，收起时带 hidden
 * @csspart indicator - 展开方向指示符
 */
export class XhAccordionElement extends XhElement {
  // 闸门按面板各持一个：手风琴模式下切换项时，一个进场一个退场是同时发生的
  private readonly exits = new Map<string, OverlayExit>()
  /** 每个面板里内容的挂卸落点，按面板节点各持一个。 */
  private readonly lazyContents = new WeakMap<HTMLElement, LazyContent>()

  static override partContract = { anatomy: accordionAnatomy, meta: accordionMeta }

  static override structure: ElementStructure<XhAccordionElement> = {
    build: (host) => {
      if (!host.ctrl.service)
        return undefined
      const api = connectAccordion(host.ctrl.service, wcNormalize)
      return accordionStructure(api, {
        slotted: (name, key) => host.slotted(name, key),
        // 正文挂不挂跟着各面板的退场闸门：这一轮要展开的面板闸门在接线时才打开，所以开着的按在场算
        mounted: node => api.isContentMounted({ value: node.value }, api.isOpen(node.value) || (host.exits.get(node.value)?.visible ?? false)),
      })
    },
  }

  static override properties = {
    // 数组只走 property，属性表达不了；给了它条目的标题文本与禁用即以数据为准
    collection: { attribute: false },
    // 展开集合是字符串数组，只走 property
    value: { attribute: false },
    defaultValue: { attribute: false },
    multiple: { converter: BOOLEAN_CONVERTER },
    collapsible: { converter: BOOLEAN_CONVERTER },
    loop: { converter: BOOLEAN_CONVERTER },
    disabled: { converter: BOOLEAN_CONVERTER },
    variant: {},
    orientation: {},
    // property 另起名字，避开 HTMLElement 自带的 dir 存取器
    textDir: { attribute: 'dir' },
    tone: {},
    size: {},
    lazyMount: { converter: BOOLEAN_CONVERTER, attribute: 'lazy-mount' },
    unmountOnExit: { converter: BOOLEAN_CONVERTER, attribute: 'unmount-on-exit' },
    contentRole: { attribute: 'content-role' },
  }

  declare collection?: AccordionNode[]
  declare value?: string[]
  declare defaultValue?: string[]
  declare multiple?: boolean
  declare collapsible?: boolean
  declare loop?: boolean
  declare disabled?: boolean
  declare variant?: ControlVariant
  declare orientation?: Orientation
  declare textDir?: Direction
  declare tone?: Tone
  declare size?: Size
  declare lazyMount?: boolean
  declare unmountOnExit?: boolean
  declare contentRole?: AccordionSchema['props']['contentRole']

  private readonly notify = (details: AccordionValueChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('value-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly ctrl = new MachineController<AccordionSchema>(
    this,
    accordionMachine,
    () => this.machineProps(),
  )

  private machineProps(): Partial<AccordionSchema['props']> {
    return {
      collection: this.collection,
      value: this.value,
      defaultValue: this.defaultValue,
      multiple: this.multiple ?? false,
      collapsible: this.collapsible ?? false,
      loop: this.loop ?? false,
      disabled: this.disabled ?? false,
      variant: this.variant,
      orientation: this.orientation,
      dir: this.textDir,
      tone: this.tone,
      size: this.size,
      lazyMount: this.lazyMount ?? false,
      unmountOnExit: this.unmountOnExit ?? false,
      contentRole: this.contentRole,
      onValueChange: this.notify,
    }
  }

  /** 取角色节点所属条目的 value 与 disabled，向上找本宿主内的 item，没有则读节点自身。 */
  private itemProps(el: HTMLElement): AccordionItemProps {
    const owner = el.closest<HTMLElement>(ITEM_SELECTOR)
    const source = owner && owner !== this && this.contains(owner) ? owner : el
    // 节点上没写禁用就报 undefined，交给 connect 回 collection 里查
    return { value: source.getAttribute('value') ?? '', disabled: isItemDisabled(source) || undefined }
  }

  protected wire(): void {
    const api = connectAccordion(this.ctrl.service, wcNormalize)

    const root = this.getPart('root')
    if (root)
      this.spreader.spread(root, api.getRootProps())

    // 集合类 part 逐个 spread，身份由节点自报，不依赖下标。
    const putAll = (name: string, get: (item: AccordionItemProps) => unknown): void => {
      for (const el of this.getParts(name))
        this.spreader.spread(el, get(this.itemProps(el)) as Record<string, unknown>)
    }
    putAll('item', item => api.getItemProps(item))
    for (const el of this.getParts('item-separator'))
      this.spreader.spread(el, api.getItemSeparatorProps())
    putAll('header', item => api.getHeaderProps(item))
    putAll('trigger', item => api.getTriggerProps(item))
    // 收起跟着退场闸门走：皮肤刻意没给 content 补 [hidden]{display:none}（补了退场
    // 就一帧都播不出来），真正的收起在动画结束后落成内联 display
    for (const el of this.getParts('content')) {
      const item = this.itemProps(el)
      this.spreader.spread(el, api.getContentProps(item))
      const open = api.isOpen(item.value)
      let exit = this.exits.get(item.value)
      if (!exit) {
        exit = createOverlayExit({
          open,
          onExitComplete: () => this.requestUpdate(),
        })
        this.exits.set(item.value, exit)
      }
      exit.track(el)
      exit.update(open)
      this.setPartHidden(el, !exit.visible)
      let lazy = this.lazyContents.get(el)
      if (!lazy) {
        // 标准结构生成的面板：照数据铺的正文由结构按挂载判定填空，slot 搬进来的作者节点不暂存（暂存了就认不出插槽），
        // 只有写成模板的才按判定挂卸
        lazy = new LazyContent({ stash: el.getAttribute(GEN_ATTR) !== STRUCTURE_MARK })
        this.lazyContents.set(el, lazy)
      }
      lazy.sync(el, api.isContentMounted(item, exit.visible))
    }
    putAll('indicator', item => api.getIndicatorProps(item))
  }
}
