/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 「更多」菜单：作者写的一颗钮，加上元素自建的一张 Menu（定位层、列表、条目与分隔线）。
//
// Toolbar 与 Tabs 共用：宿主交出钮节点、喂给菜单机器的 props 与自己那份钮的属性，
// 本件管菜单机器、浮层节点、Portal、退场闸门与自绘滚动条。钮上的菜单接线按 asChild 的规则合进
// 宿主那份属性（菜单的解剖标记让位、宿主的处理器先跑），与 Vue / React 落到节点上的逐字一样。
// 建出来的节点归 menu 的 scope，不写 data-xh-part（与每页条数下拉、自绘滚动条同一条路）。

import type { Cleanup, IdGenerator, Layer, RuntimeConfig, Scope, Service } from '@xihan-ui/core'
import type { MenuAnyItemProps, MenuApi, MenuSchema } from '@xihan-ui/headless'
import type { Spreader } from '../dom/spread'
import type { OverlayExit } from '../overlay-exit'
import type { ReactiveControllerHost } from '../reactive'
import type { AnchoredPortalController, AnchoredPortalControllerOptions } from './anchored-portal-controller'
import { createCounterIdGenerator, createRuntimeConfig, createScope } from '@xihan-ui/core'
import { connectMenu, menuMachine } from '@xihan-ui/headless'
import { createPositionEngine } from '@xihan-ui/position'
import { mergeAsChildProps } from '../dom/as-child'
import { wcNormalize } from '../dom/normalize'
import { createOverlayExit } from '../overlay-exit'
import { MachineController } from './machine-controller'
import { ScrollbarsController } from './scrollbars-controller'

export interface OverflowMenuControllerOptions {
  /** Portal 诊断里的名字。 */
  name: string
  /** 宿主的 spreader：钮是宿主的角色节点，自建的节点也由它铺、由它交还。 */
  spreader: Spreader
  /** 作者写的钮；缺席时不建菜单。 */
  trigger: () => HTMLElement | null
  /** 菜单机器的 props，从宿主的机器现读。 */
  props: () => MenuSchema['props']
  /** 建 Portal 控制器：XhPortalHostElement 的受保护方法由宿主转交，Portal 目标随宿主的 portalContainer。 */
  createPortal: (options: Omit<AnchoredPortalControllerOptions, 'portalContainer'>) => AnchoredPortalController
}

/** 菜单里的一条：条目节点、勾选项的标记位与文字载体。 */
interface OverflowEntry {
  item: HTMLElement
  indicator: HTMLElement | null
  text: HTMLElement
  /** 这一条之前的分隔线；没有时为 null。 */
  separator: HTMLElement | null
}

/** 菜单那一套节点。作者只写钮，这些由本件建。 */
interface OverflowMenuNodes {
  positioner: HTMLElement
  content: HTMLElement
  /** 按条目值索引：条目变了只补差额，不整套重建。 */
  entries: Map<string, OverflowEntry>
}

export class OverflowMenuController {
  private readonly idGen: IdGenerator = createCounterIdGenerator()
  /** 菜单的 id 由它派生：钮与列表靠 aria-controls / aria-labelledby 互相认领。 */
  private readonly scope: Scope
  private config: RuntimeConfig | null = null
  /** 菜单那一套节点；钮缺席时不建。 */
  private nodes: OverflowMenuNodes | null = null
  /** 退场闸门：收起从跟着展开态走改成跟着 presence 走，退场动画播完才真收。 */
  private exit: OverlayExit | null = null
  private readonly menuCtrl: MachineController<MenuSchema>
  private readonly portal: AnchoredPortalController
  /** 条目列表的自绘条：与 content 同级挂在已经 fixed 的 positioner 上；浮层里的条子走 4px 档。 */
  private readonly bars: ScrollbarsController

  /**
   * 须在宿主自己的机器控制器之后建：菜单的 props 从宿主的机器现读。
   */
  constructor(
    private readonly host: ReactiveControllerHost & HTMLElement,
    private readonly options: OverflowMenuControllerOptions,
  ) {
    this.scope = createScope(host, this.idGen)
    this.menuCtrl = new MachineController<MenuSchema>(host, menuMachine, options.props, {
      scope: this.scope,
      onBuilt: svc => this.injectRefs(svc),
    })
    this.portal = options.createPortal({
      name: options.name,
      config: () => this.config,
      source: options.trigger,
      root: () => this.nodes?.positioner ?? null,
      onChange: () => host.requestUpdate(),
    })
    this.bars = new ScrollbarsController(host, {
      shell: () => this.nodes?.positioner ?? null,
      scrollable: () => this.nodes?.content ?? null,
      props: () => ({ size: 'sm' }),
    })
  }

  private ensureConfig(): RuntimeConfig {
    this.config ??= createRuntimeConfig({ scope: this.scope, idGenerator: this.idGen })
    return this.config
  }

  private ensureExit(open: boolean): OverlayExit {
    this.ensureConfig()
    this.exit ??= createOverlayExit({
      open,
      onExitComplete: () => this.host.requestUpdate(),
    })
    return this.exit
  }

  // 只交注册函数、不在连接期注册：层的入栈出栈跟着展开态走（机器的 trackLayer 效应负责）。
  // 连接期就注册会让层与开合无关地常驻栈里，把同页其它层的 Escape 堵死。
  private readonly registerLayer = (): { layer: Layer, dispose: Cleanup } => {
    return this.ensureConfig().layerRegistry.register({
      kind: 'popover',
      node: () => this.nodes?.content ?? null,
      // 钮记为本层分支：点它算层内交互，开合交给它自己切换；
      // 浮层壳一并记上：条目列表之外还浮着自绘滚动条，按住它拖动不该把菜单消解掉
      branches: () => [this.options.trigger(), this.nodes?.positioner].filter(Boolean) as Element[],
      isModal: () => false,
      surfaces: () => [],
    })
  }

  // onBuilt 可能在 menuCtrl 赋值之前就跑，故 service 由参数传入。
  // 每次(重)建机器后都要重注：refs 属于机器实例，重连时的新机器不会继承旧的。
  private injectRefs(svc: Service<MenuSchema>): void {
    svc.refs.set('config', this.ensureConfig())
    svc.refs.set('registerLayer', this.registerLayer)
    svc.refs.set('presence', this.ensureExit(svc.state.get() === 'open').presence)
    svc.refs.set('position', createPositionEngine())
    svc.refs.set('getAnchorEl', this.options.trigger)
    svc.refs.set('getFloatingEl', () => this.nodes?.positioner ?? null)
    svc.refs.set('getContentEl', () => this.nodes?.content ?? null)
  }

  /**
   * 宿主在自己的 wire() 里调用：钮的菜单接线按 asChild 的规则合进宿主那份属性一次铺上，
   * 菜单的定位层、列表与条目按菜单的 connect 产出铺好。钮缺席时拆掉整套浮层。
   */
  wire(triggerProps: Record<string, unknown>): void {
    const trigger = this.options.trigger()
    if (!trigger) {
      this.releaseNodes()
      return
    }
    const menu = connectMenu(this.menuCtrl.service as Service<MenuSchema>, wcNormalize)
    this.options.spreader.spread(trigger, mergeAsChildProps(menu.getTriggerProps() as Record<string, unknown>, triggerProps))

    const nodes = this.ensureNodes()
    this.options.spreader.spread(nodes.positioner, menu.getPositionerProps() as Record<string, unknown>)
    this.options.spreader.spread(nodes.content, menu.getContentProps() as Record<string, unknown>)
    this.wireEntries(menu, nodes)

    // Light DOM 的 content 常驻，可见性由宿主自管：皮肤给 content 设了 display，会盖过 UA 的
    // [hidden]{display:none}。必须排在 content 的属性之后——data-state 得先落进 DOM，探测器才读得到退场那支动画
    const exit = this.ensureExit(menu.open)
    exit.track(nodes.content)
    exit.update(menu.open)
    // 直接写而不走 setPartHidden：那条路是为作者写的角色节点留的，要护住作者自己的内联
    // display；这层是自建的，没有作者的那一份
    nodes.content.style.display = exit.visible ? '' : 'none'

    this.bars.wire()
    this.portal.sync(exit.visible)
  }

  /** 定位层与列表：建一次，挂在宿主的末尾；展开时由 Portal 搬到落点。 */
  private ensureNodes(): OverflowMenuNodes {
    const current = this.nodes
    if (current?.positioner.isConnected)
      return current
    if (current)
      this.releaseNodes()
    const doc = this.host.ownerDocument
    const positioner = doc.createElement('div')
    const content = doc.createElement('div')
    positioner.append(content)
    // 定位层是 fixed，坐标由引擎给，摆在哪一层都不影响落位；放在宿主的角色子树之外，不进它们的排布与量测
    this.host.append(positioner)
    this.nodes = { positioner, content, entries: new Map() }
    return this.nodes
  }

  /** 按菜单的条目元信息铺条目：已有的复用、缺的新建、多的移除，次序与菜单一致。 */
  private wireEntries(menu: MenuApi, nodes: OverflowMenuNodes): void {
    const doc = this.host.ownerDocument
    const { spreader } = this.options
    const alive = new Set<string>()
    let cursor: ChildNode | null = nodes.content.firstChild
    const place = (node: HTMLElement): void => {
      if (node === cursor)
        cursor = node.nextSibling
      else
        nodes.content.insertBefore(node, cursor)
    }
    menu.collection.forEach((meta, index) => {
      alive.add(meta.value)
      let entry = nodes.entries.get(meta.value)
      const wantsIndicator = meta.kind !== 'item'
      if (!entry || (entry.indicator != null) !== wantsIndicator) {
        if (entry)
          this.removeEntry(entry)
        const item = doc.createElement('div')
        const indicator = wantsIndicator ? doc.createElement('span') : null
        const text = doc.createElement('span')
        if (indicator)
          item.append(indicator)
        item.append(text)
        entry = { item, indicator, text, separator: null }
        nodes.entries.set(meta.value, entry)
      }
      // 首条上的分隔线标记不产出分隔线：菜单开头不留一道空隔
      const wantsSeparator = index > 0 && meta.separatorBefore
      if (wantsSeparator && !entry.separator)
        entry.separator = doc.createElement('div')
      if (!wantsSeparator && entry.separator) {
        spreader.release(entry.separator)
        entry.separator.remove()
        entry.separator = null
      }
      if (entry.separator) {
        spreader.spread(entry.separator, menu.getSeparatorProps() as Record<string, unknown>)
        place(entry.separator)
      }
      // 禁用与选完收起都由 collection 定案，条目只报身份
      const declaration: MenuAnyItemProps = meta.kind === 'checkbox'
        ? { value: meta.value, kind: 'checkbox' }
        : { value: meta.value, kind: 'item' }
      const itemProps = declaration.kind === 'checkbox' ? menu.getCheckboxItemProps(declaration) : menu.getItemProps(declaration)
      spreader.spread(entry.item, itemProps as Record<string, unknown>)
      if (entry.indicator)
        spreader.spread(entry.indicator, menu.getItemIndicatorProps(declaration) as Record<string, unknown>)
      spreader.spread(entry.text, menu.getItemTextProps(declaration) as Record<string, unknown>)
      if (entry.text.textContent !== meta.label)
        entry.text.textContent = meta.label
      place(entry.item)
    })
    for (const [value, entry] of nodes.entries) {
      if (alive.has(value))
        continue
      // 焦点正在这一条上：它一走，菜单得就地另挑锚点，否则整张菜单没有 Tab 停靠点
      const svc = this.menuCtrl.service as Service<MenuSchema>
      if (svc.getStatus() === 'Started' && svc.context.get('focusedValue') === value)
        svc.send({ type: 'ITEM.LOST' })
      this.removeEntry(entry)
      nodes.entries.delete(value)
    }
  }

  private removeEntry(entry: OverflowEntry): void {
    for (const node of [entry.separator, entry.item, entry.indicator, entry.text]) {
      if (node)
        this.options.spreader.release(node)
    }
    entry.separator?.remove()
    entry.item.remove()
  }

  private releaseNodes(): void {
    const nodes = this.nodes
    if (!nodes)
      return
    this.portal.dispose()
    for (const entry of nodes.entries.values())
      this.removeEntry(entry)
    this.options.spreader.release(nodes.positioner)
    this.options.spreader.release(nodes.content)
    nodes.positioner.remove()
    this.nodes = null
  }

  /** 宿主断开、交给基类之前：Portal 先归位。 */
  disposePortal(): void {
    this.portal.dispose()
  }

  /** 宿主断开、基类收尾之后：退场没播完就立刻结清，拆掉整套浮层；重连时按需重建。 */
  release(): void {
    this.exit?.dispose()
    this.exit = null
    this.releaseNodes()
    // 层由展开态的效应自己入栈出栈，断开时机器停机会一并撤掉，这里无需再管
    this.config = null
  }
}
