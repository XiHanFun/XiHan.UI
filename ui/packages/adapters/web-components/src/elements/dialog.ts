/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 dialog 相关实现。

import type { Cleanup, IdGenerator, Layer, OverlayBackdropVariant, RuntimeConfig, Service, Size } from '@xihan-ui/core'
import type { DialogActionIntents, DialogConfirmErrorDetails, DialogOpenChangeDetails, DialogSchema, DialogStructureActions } from '@xihan-ui/headless'
import type { ElementStructure } from '../element-base'
import type { OverlayExit } from '../overlay-exit'
import { createCounterIdGenerator, createRuntimeConfig, createScope } from '@xihan-ui/core'
import { connectDialog, dialogAnatomy, dialogMachine, dialogMeta, dialogStructure } from '@xihan-ui/headless'
import { resolveXhConfig } from '../config'
import { BOOLEAN_CONVERTER } from '../dom/converters'
import { createNamingContentWatch } from '../dom/naming-watch'
import { wcNormalize } from '../dom/normalize'
import { renderedTitleDescription } from '../dom/title-description'
import { createOverlayExit } from '../overlay-exit'
import { LazyContent } from '../runtime/lazy-content'
import { MachineController } from '../runtime/machine-controller'
import { XhPortalHostElement } from '../runtime/portal-host'

// 属性缺席翻成 undefined，缺省值由皮肤的缺省档决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }

/**
 * `<xh-dialog>`：Light-DOM 行为宿主，运行 dialog 状态机并把 connect 产出接到角色节点上，
 * 关闭时用内联 style.display 隐藏浮层子树。
 *
 * 不写部件时元素按标准结构生成：trigger-text、title-text、description 几个属性（或宿主直接子节点上写
 * `slot="trigger"`、`slot="title"`、`slot="description"`、`slot="body"`、`slot="footer"` 的节点）给出各段内容，
 * 页脚按 actions 铺取消与确定两颗钮。确定钮发 confirm；要等异步动作落定再收起，给元素赋
 * `confirmAction = () => thenable`：面板等兑现才收、确定钮转圈，拒绝留在原地并发 confirm-error。
 *
 * @customElement xh-dialog
 * @attr {boolean} open - 受控开合；未提供该属性即非受控
 * @attr {boolean} default-open - 非受控初始为打开
 * @attr {boolean} modal - 模态（陷入焦点、锁定滚动、遮罩交互外关闭），默认 true
 * @attr {'dialog'|'alertdialog'} dialog-role - 语义角色，写在 content 上，默认 dialog。不命名为 role：那是 HTML 全局属性，写在宿主上宿主自己就成了对话框，连同里面的触发钮
 * @attr {boolean} close-on-escape - Esc 关闭，默认 true
 * @attr {boolean} restore-focus - 关闭后把焦点归还触发元素，默认 true
 * @attr {string} initial-focus - 展开后先聚焦到 content 内匹配此选择器的元素
 * @attr {'sm'|'md'|'lg'} size - 尺寸：只影响 content 的最大宽度，写在 content 上
 * @attr {'opaque'|'blur'|'transparent'} variant - 遮罩形态：只影响 backdrop 的底色与模糊
 * @attr {boolean} panel-draggable - 可拖动：按住标题栏或拖动把手挪走面板，方向键在把手上挪一步；面板始终夹在视口内。不命名为 draggable：那是 HTML 全局属性，写上后宿主会变成原生拖放源
 * @attr {boolean} unmount-on-exit - 收起动画播完后卸掉 content 里 `<template>` 克隆出的内容，默认 true；写 "false" 时第一次打开克隆、此后常驻。没写模板的作者节点始终常驻
 * @attr {string} trigger-text - 标准结构里触发按钮的文字；没有它也没有 slot="trigger" 时不生成触发器
 * @attr {string} title-text - 标准结构里的标题文字。不用 HTML 全局属性 title：写在宿主上会出浏览器原生提示
 * @attr {string} description - 标准结构里的说明文字
 * @attr {'confirm'|'alert'|'none'} actions - 标准结构的页脚：confirm 为取消 + 确定（缺省），alert 只有确定，none 不铺；slot="footer" 整段接管
 * @attr {string} confirm-text - 确定钮的文字，缺省取语言包
 * @attr {string} cancel-text - 取消钮的文字，缺省取语言包
 * @fires open-change - open 状态变化；detail 为 `{ open: boolean }`
 * @fires confirm - 点了确定钮；随后收起。异步门经 confirmAction 属性：事件拿不到监听函数的返回值，
 *   给元素赋 `confirmAction = () => thenable` 即挂起确认门，confirm 事件照发只作通知
 * @fires confirm-error - 确认动作同步抛出或 thenable 拒绝；detail 为 `{ cause }`，保留原始原因
 * @fires cancel-press - 点了取消钮；随后收起。Escape、层外交互与关闭钮只发 open-change
 * @fires exit-complete - 退出完成且本层资源已释放
 * @csspart trigger - 触发按钮
 * @csspart backdrop - 遮罩层
 * @csspart positioner - 浮层定位容器
 * @csspart content - 对话框内容（role / aria-modal / 焦点陷阱所在）
 * @csspart header - 面板头：标题与说明所在的段，不随正文滚动；可拖动时是拖动区
 * @csspart drag-trigger - 拖动把手：键盘挪动面板的入口，放在 header 里时铺满标题栏
 * @csspart indicator - 语气徽记：未提供内容时由皮肤按节点上的 data-tone 绘制兜底字形
 * @csspart title - 标题（aria-labelledby 目标）
 * @csspart description - 描述（aria-describedby 目标）
 * @csspart body - 正文：面板中唯一会滚动的段
 * @csspart footer - 面板尾：动作按钮所在的段，不随正文滚动
 * @csspart confirm-trigger - 确定钮：页脚的主动作，异步确认挂起时转圈
 * @csspart cancel-trigger - 取消钮：页脚的次要出口
 * @csspart close-trigger - 关闭按钮
 */
export class XhDialogElement extends XhPortalHostElement {
  /** 本实例的 Portal 容器；显式解析失败不回退配置默认。 */
  declare portalContainer?: () => Element | null

  static override partContract = { anatomy: dialogAnatomy, meta: dialogMeta }

  static override structure: ElementStructure<XhDialogElement> = {
    rootless: true,
    build: host => dialogStructure({
      ...(host.triggerText === undefined ? {} : { triggerText: host.triggerText }),
      ...(host.titleText === undefined ? {} : { title: host.titleText }),
      ...(host.description === undefined ? {} : { description: host.description }),
      ...(host.actions === undefined ? {} : { actions: host.actions }),
      ...(host.confirmText === undefined ? {} : { confirmText: host.confirmText }),
      ...(host.cancelText === undefined ? {} : { cancelText: host.cancelText }),
      translations: host.translations,
      slotted: (name, key) => host.slotted(name, key),
    }),
  }

  static override properties = {
    open: { converter: BOOLEAN_CONVERTER },
    defaultOpen: { converter: BOOLEAN_CONVERTER, attribute: 'default-open' },
    dialogRole: { converter: STRING_CONVERTER, attribute: 'dialog-role' },
    modal: { converter: BOOLEAN_CONVERTER },
    closeOnEscape: { converter: BOOLEAN_CONVERTER, attribute: 'close-on-escape' },
    restoreFocus: { converter: BOOLEAN_CONVERTER, attribute: 'restore-focus' },
    initialFocus: { converter: STRING_CONVERTER, attribute: 'initial-focus' },
    size: { converter: STRING_CONVERTER },
    variant: { converter: STRING_CONVERTER },
    // 与浮动面板同一个名字：避开原生的 draggable，那是 HTML 全局枚举属性，同名的响应式字段还会与 HTMLElement.draggable 访问器打架
    panelDraggable: { converter: BOOLEAN_CONVERTER, attribute: 'panel-draggable' },
    unmountOnExit: { converter: BOOLEAN_CONVERTER, attribute: 'unmount-on-exit' },
    // 对象进不了属性，只作为 property 暴露
    translations: { attribute: false },
    // —— 标准结构 ——
    triggerText: { converter: STRING_CONVERTER, attribute: 'trigger-text' },
    titleText: { converter: STRING_CONVERTER, attribute: 'title-text' },
    description: { converter: STRING_CONVERTER },
    actions: { converter: STRING_CONVERTER },
    confirmText: { converter: STRING_CONVERTER, attribute: 'confirm-text' },
    cancelText: { converter: STRING_CONVERTER, attribute: 'cancel-text' },
  }

  declare open?: boolean
  declare defaultOpen?: boolean
  declare dialogRole?: DialogSchema['props']['role']
  declare modal?: boolean
  declare closeOnEscape?: boolean
  declare restoreFocus?: boolean
  declare initialFocus?: string
  declare size?: Size
  declare variant?: OverlayBackdropVariant
  declare panelDraggable?: boolean
  declare unmountOnExit?: boolean
  /** 关闭按钮的无障碍名；connect 每帧重写 aria-label，作者写在节点上的值会被覆盖，只能从此处提供。 */
  declare translations?: DialogSchema['props']['translations']
  declare triggerText?: string
  declare titleText?: string
  declare description?: string
  declare actions?: DialogStructureActions
  declare confirmText?: string
  declare cancelText?: string

  /**
   * 确定钮的异步门：返回 thenable 即挂起，等兑现才收起、确定钮转圈；拒绝留在原地并发 confirm-error。
   * confirm 事件照常触发，仅作通知。
   */
  declare confirmAction?: () => void | PromiseLike<unknown>

  /** 异步确认进行中；Escape 与层外交互此时不收起。 */
  private pendingState = false
  /** 最近一次确认动作的错误。 */
  private actionErrorState: DialogConfirmErrorDetails | null = null

  get pending(): boolean {
    return this.pendingState
  }

  get actionError(): DialogConfirmErrorDetails | null {
    return this.actionErrorState
  }

  private actionIntents(): DialogActionIntents {
    return {
      onConfirm: () => {
        this.dispatchEvent(new CustomEvent('confirm', { bubbles: true, composed: true }))
        return this.confirmAction?.()
      },
      onConfirmError: (details) => {
        this.dispatchEvent(new CustomEvent<DialogConfirmErrorDetails>('confirm-error', { detail: details, bubbles: true, composed: true }))
      },
      onCancelPress: () => {
        this.dispatchEvent(new CustomEvent('cancel-press', { bubbles: true, composed: true }))
      },
      pending: this.pendingState,
      onPendingChange: (next) => {
        this.pendingState = next
        this.requestUpdate()
      },
      actionError: this.actionErrorState,
      onActionErrorChange: (next) => {
        this.actionErrorState = next
        this.requestUpdate()
      },
    }
  }

  private readonly idGen: IdGenerator = createCounterIdGenerator()
  // 运行时环境必须始终取宿主当前所属 Document：iframe 创建或 adopt 之后不能继续用构造时的全局 realm。
  private readonly dialogScope = createScope(() => this, this.idGen)
  private config: RuntimeConfig | null = null
  private contentNode: HTMLElement | null = null
  private exit: OverlayExit | null = null
  private backdropNode: HTMLElement | null = null
  private readonly lazyContent = new LazyContent({ stash: false })
  private readonly portal = this.createPortalLeaseController({
    name: 'Dialog 视口模态',
    config: () => this.config,
    source: () => this,
    roots: () => {
      const positioner = this.getPart('positioner')
      return this.backdropNode && positioner ? [this.backdropNode, positioner] : []
    },
    onChange: () => this.requestUpdate(),
  })

  private readonly notify = (details: DialogOpenChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('open-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly ctrl = new MachineController<DialogSchema>(
    this,
    dialogMachine,
    () => this.machineProps(),
    { scope: this.dialogScope, onBuilt: svc => this.injectRefs(svc) },
  )

  private machineProps(): Partial<DialogSchema['props']> {
    return {
      open: this.open,
      defaultOpen: this.defaultOpen ?? false,
      modal: this.modal,
      role: this.dialogRole,
      closeOnEscape: this.pendingState ? false : this.closeOnEscape,
      // 异步确认挂起期间层外交互也收不起；平时交给机器的缺省
      closeOnInteractOutside: this.pendingState ? false : undefined,
      restoreFocus: this.restoreFocus,
      initialFocus: this.initialFocus,
      size: this.size,
      variant: this.variant,
      draggable: this.panelDraggable,
      unmountOnExit: this.unmountOnExit,
      // content 只引用作者写了的标题与说明
      parts: renderedTitleDescription(this.getPart('title'), this.getPart('description')),
      translations: this.translations,
      onOpenChange: this.notify,
      onExitComplete: () => this.dispatchEvent(new CustomEvent('exit-complete', { bubbles: true, composed: true })),
    }
  }

  private ensureConfig(): void {
    if (this.config)
      return
    // scrollRoot 每次现读：配置沿祖先链解析，元素搬家或 <xh-config> 改了都要跟上
    this.config = createRuntimeConfig({
      scope: this.dialogScope,
      idGenerator: this.idGen,
      scrollRoot: () => resolveXhConfig(this).scrollRoot?.() ?? null,
    })
  }

  /** 退场闸门建一次；presence 不是响应式 cell，退场结束要显式排一次更新才轮得到收起。 */
  private ensureExit(open: boolean): OverlayExit {
    this.ensureConfig()
    this.exit ??= createOverlayExit({
      open,
      onExitComplete: () => this.requestUpdate(),
      // 不靠落位藏面板：焦点陷阱与滚动锁所在的浮层按需块到了才露出内容
      onOverlayKitReady: () => this.requestUpdate(),
    })
    return this.exit
  }

  protected override externalPartRoots(): readonly HTMLElement[] {
    return this.portal.roots
  }

  // 只交注册函数，层的入栈出栈由机器的 trackOverlay 效应跟着展开态做。
  private readonly registerLayer = (): { layer: Layer, dispose: Cleanup } => {
    this.ensureConfig()
    return this.config!.layerRegistry.register({
      kind: 'modal',
      node: () => this.contentNode,
      branches: () => [],
      isModal: () => this.machineProps().modal ?? true,
      surfaces: () => [this.backdropNode].filter(Boolean) as Element[],
    })
  }

  // onBuilt 在 ctrl 构造期就跑，service 由参数传入。
  private injectRefs(svc: Service<DialogSchema>): void {
    this.ensureConfig()
    svc.refs.set('config', this.config)
    svc.refs.set('registerLayer', this.registerLayer)
    svc.refs.set('presence', this.ensureExit(svc.state.get() === 'open').presence)
    svc.refs.set('getContentEl', () => this.contentNode)
    svc.refs.set('getTriggerEl', () => this.getPart('trigger'))
    svc.refs.set('branches', () => [])
  }

  /** 说明部件的内容从无到有、从有到无时重新接线：读不出一句话的说明不进 content 的描述链。 */
  private readonly descriptionWatch = createNamingContentWatch(() => this.requestUpdate())

  protected wire(): void {
    this.descriptionWatch.watch(this.getPart('description'))
    const svc = this.ctrl.service
    const api = connectDialog(svc, wcNormalize, this.actionIntents())
    const open = svc.state.get() === 'open'

    this.contentNode = this.getPart('content')
    this.backdropNode = this.getPart('backdrop')

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('trigger', api.getTriggerProps())
    put('backdrop', api.getBackdropProps())
    put('positioner', api.getPositionerProps())
    put('content', api.getContentProps())
    put('header', api.getHeaderProps())
    put('drag-trigger', api.getDragTriggerProps())
    put('indicator', api.getIndicatorProps())
    put('title', api.getTitleProps())
    put('description', api.getDescriptionProps())
    put('body', api.getBodyProps())
    put('footer', api.getFooterProps())
    put('confirm-trigger', api.getConfirmTriggerProps())
    put('cancel-trigger', api.getCancelTriggerProps())
    put('close-trigger', api.getCloseTriggerProps())

    // 退场动画播完之前先别收：presence 读 content 的 animationName 决定要不要多留一会儿。
    // 必须排在 put('content') 之后——data-state 得先落进 DOM，探测器才读得到退场那支动画
    const exit = this.ensureExit(open)
    const modal = this.machineProps().modal ?? true
    exit.track(this.contentNode, modal ? this.backdropNode : null)
    exit.update(open)
    const visible = exit.visible

    const positioner = this.getPart('positioner')
    // 非模态不领取视口租约；缺一个根时共享控制器保持既有 Light-DOM 结构。
    this.portal.sync(modal && (open || visible))

    // 收起用内联 display，优先级高于样式表对 [hidden] 的覆盖
    if (positioner)
      this.setPartHidden(positioner, !visible)
    if (this.backdropNode)
      this.setPartHidden(this.backdropNode, !visible || !modal)
    // positioner 不是必需部件，content 自己也要收起
    this.setPartHidden(this.contentNode, !visible)

    // 写在 content 里 <template> 中的内容按 headless 的判定克隆或撤走；新挂上的部件由部件观察器补一轮 wire 接上属性
    this.lazyContent.sync(this.contentNode, api.isContentMounted(visible))
  }

  override disconnectedCallback(): void {
    this.descriptionWatch.disconnect()
    super.disconnectedCallback()
    // 退场没播完就离场：立刻结清并把子树收起，否则作者的节点会带着已被撤掉的 data-state 留在页面上。
    // 只在机器已经收起时才强收——元素被移动（remove 后立刻 append）时展开态不该被打断
    this.exit?.dispose()
    this.exit = null
    this.portal.dispose()
    if (this.ctrl.service.state.get() !== 'open')
      this.setPartHidden(this.contentNode, true)
    this.config = null // 重连时 ensureConfig 重建
  }
}
