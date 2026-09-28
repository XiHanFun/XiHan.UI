/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 citation 相关实现。

import type { Cleanup, Direction, IdGenerator, Layer, Placement, PositionEnginePort, RuntimeConfig, Service, Size } from '@xihan-ui/core'
import type {
  CitationActiveSourceChangeDetails,
  CitationOpenChangeDetails,
  CitationPreviewMode,
  CitationPreviewProps,
  CitationSchema,
  CitationSource,
  CitationSourceItemProps,
  CitationSourceOpenDetails,
  CitationTriggerProps,
} from '@xihan-ui/headless'
import { createCounterIdGenerator, createRuntimeConfig, createScope } from '@xihan-ui/core'
import { citationAnatomy, citationMachine, citationMeta, connectCitation } from '@xihan-ui/headless'
import { createPositionEngine } from '@xihan-ui/position'
import { wcNormalize } from '../dom/normalize'
import { MachineController } from '../runtime/machine-controller'
import { XhPortalHostElement } from '../runtime/portal-host'

// 写不成数的值当作没写，缺省仍由机器给
const NUMBER_CONVERTER = {
  fromAttribute: (v: string | null) => {
    if (v === null)
      return undefined
    const n = Number(v)
    return Number.isFinite(n) ? n : undefined
  },
}

/**
 * `<xh-citation>` —— SourcePart 驱动的行内引用、来源预览与来源列表宿主。
 *
 * @customElement xh-citation
 * @attr {string} active-source-id - 受控的当前来源 id
 * @attr {string} default-active-source-id - 非受控初始来源 id
 * @attr {boolean} open - 受控预览展开态
 * @attr {boolean} default-open - 非受控初始展开态
 * @attr {boolean} disabled - 禁用全部引用入口
 * @attr {boolean} loop - 来源列表方向键是否循环
 * @attr {'ltr'|'rtl'} dir - 文字方向
 * @attr {'sm'|'md'|'lg'} size - 尺寸
 * @attr {'inline'|'hover'} preview-mode - 预览怎样出现：inline（缺省）正文流里的一块面；hover 锚定在引用编号上的悬停卡片，预览写在 positioner 里
 * @attr {number} open-delay - hover 档：指针停在引用上到卡片出现的等待毫秒，默认 700
 * @attr {number} close-delay - hover 档：指针离开到收起的等待毫秒，默认 300
 * @attr {number} skip-delay-duration - hover 档：卡片刚收起的这么久里指向另一处引用直接接替，默认 300
 * @attr {string} placement - hover 档：卡片相对引用编号的朝向，默认 bottom
 * @attr {number} offset - hover 档：卡片与引用编号的间距（px）
 * @fires active-source-change - 当前来源变化
 * @fires open-change - 预览展开态变化
 * @fires source-open - 用户请求打开原始来源
 * @csspart root - 组件根
 * @csspart text - 含行内引用的正文
 * @csspart trigger - 行内引用按钮；value 写来源 id，一处引多个来源时写成空白分隔的几个
 * @csspart positioner - hover 档的浮层定位壳，坐标由引擎写为内联样式；inline 档按 display: contents 排
 * @csspart preview - 来源预览区域
 * @csspart prev-trigger - 一处多源时换到上一个来源
 * @csspart next-trigger - 一处多源时换到下一个来源
 * @csspart preview-index - 一处多源时的位置，元素写入「2 / 3」
 * @csspart preview-title - 预览标题
 * @csspart list - 来源列表
 * @csspart source - 来源条目
 * @csspart source-link - 来源条目按钮
 */
export class XhCitationElement extends XhPortalHostElement {
  /** 本实例的 Portal 容器；显式解析失败不回退配置默认。 */
  declare portalContainer?: () => Element | null

  static override partContract = { anatomy: citationAnatomy, meta: citationMeta }

  static override properties = {
    previewMode: { attribute: 'preview-mode' },
    openDelay: { converter: NUMBER_CONVERTER, attribute: 'open-delay' },
    closeDelay: { converter: NUMBER_CONVERTER, attribute: 'close-delay' },
    skipDelayDuration: { converter: NUMBER_CONVERTER, attribute: 'skip-delay-duration' },
    placement: {},
    offset: { converter: NUMBER_CONVERTER },
    sources: { attribute: false },
    activeSourceId: { attribute: 'active-source-id' },
    defaultActiveSourceId: { attribute: 'default-active-source-id' },
    open: { converter: { fromAttribute: (value: string | null) => (value === null ? undefined : value !== 'false') } },
    defaultOpen: { type: Boolean, attribute: 'default-open' },
    disabled: { type: Boolean },
    loop: { type: Boolean },
    direction: { attribute: 'dir' },
    size: {},
    translations: { attribute: false },
  }

  declare sources?: readonly CitationSource[]
  declare activeSourceId?: string | null
  declare defaultActiveSourceId?: string | null
  declare open?: boolean
  declare defaultOpen?: boolean
  declare disabled?: boolean
  declare loop?: boolean
  declare direction?: Direction
  declare size?: Size
  declare previewMode?: CitationPreviewMode
  declare openDelay?: number
  declare closeDelay?: number
  declare skipDelayDuration?: number
  declare placement?: Placement
  declare offset?: number
  declare translations?: CitationSchema['props']['translations']

  private readonly idGen: IdGenerator = createCounterIdGenerator()
  private readonly citationScope = createScope(() => this, this.idGen)
  private readonly positionEngine: PositionEnginePort = createPositionEngine()
  private config: RuntimeConfig | null = null
  /** hover 档的卡片搬到 portal 落点；inline 档不搬。 */
  private readonly portal = this.createAnchoredPortalController({
    name: 'Citation',
    config: () => this.config,
    source: () => this.getPart('root'),
    root: () => this.getPart('positioner'),
    onChange: () => this.requestUpdate(),
  })

  private readonly onActiveSourceChange = (details: CitationActiveSourceChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('active-source-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly onOpenChange = (details: CitationOpenChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('open-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly onSourceOpen = (details: CitationSourceOpenDetails): void => {
    this.dispatchEvent(new CustomEvent('source-open', { detail: details, bubbles: true, composed: true }))
  }

  private readonly ctrl = new MachineController<CitationSchema>(
    this,
    citationMachine,
    () => this.machineProps(),
    { scope: this.citationScope, onBuilt: svc => this.injectRefs(svc) },
  )

  private ensureConfig(): void {
    this.config ??= createRuntimeConfig({ scope: this.citationScope, idGenerator: this.idGen })
  }

  protected override externalPartRoots(): readonly HTMLElement[] {
    return this.portal.roots
  }

  // 只交注册函数：入栈出栈由机器按悬停卡片的开合驱动
  private readonly registerLayer = (): { layer: Layer, dispose: Cleanup } => {
    this.ensureConfig()
    return this.config!.layerRegistry.register({
      kind: 'popover',
      node: () => this.getPart('positioner'),
      // 行内引用记为本层分支：按在另一处引用上是切换，不是层外交互
      branches: () => this.getParts('trigger'),
      isModal: () => false,
      surfaces: () => [],
    })
  }

  // onBuilt 在 ctrl 构造期就跑（此刻 this.ctrl 尚未赋值），故 service 由参数传入
  private injectRefs(svc: Service<CitationSchema>): void {
    this.ensureConfig()
    svc.refs.set('config', this.config)
    svc.refs.set('registerLayer', this.registerLayer)
    svc.refs.set('position', this.positionEngine)
    svc.refs.set('getFloatingEl', () => this.getPart('positioner'))
  }

  private machineProps(): Partial<CitationSchema['props']> {
    return this.configured('citation', {
      sources: this.sources,
      activeSourceId: this.activeSourceId,
      defaultActiveSourceId: this.defaultActiveSourceId,
      open: this.open,
      defaultOpen: this.defaultOpen ?? false,
      disabled: this.disabled ?? false,
      loop: this.loop,
      dir: this.direction,
      size: this.size,
      previewMode: this.previewMode,
      openDelay: this.openDelay,
      closeDelay: this.closeDelay,
      skipDelayDuration: this.skipDelayDuration,
      placement: this.placement,
      offset: this.offset,
      translations: this.translations,
      onActiveSourceChange: this.onActiveSourceChange,
      onOpenChange: this.onOpenChange,
      onSourceOpen: this.onSourceOpen,
    })
  }

  protected wire(): void {
    const api = connectCitation(this.ctrl.service, wcNormalize)
    const spread = (name: string, props: Record<string, unknown>): void => {
      for (const element of this.getParts(name))
        this.spreader.spread(element, props)
    }
    spread('root', api.getRootProps() as Record<string, unknown>)
    spread('text', api.getTextProps() as Record<string, unknown>)

    // positioner 的 style 是坐标对象，spreader 会逐条写成内联样式
    spread('positioner', api.getPositionerProps() as Record<string, unknown>)

    for (const trigger of this.getParts('trigger')) {
      // value 写来源 id，一处引多个来源时写成空白分隔的几个
      const ids = (trigger.getAttribute('value') ?? '').split(/\s+/).filter(Boolean)
      const item: CitationTriggerProps = {
        ...(ids.length > 1 ? { sourceIds: ids } : { sourceId: ids[0] ?? '' }),
        citationId: trigger.getAttribute('name') ?? undefined,
        anchorIndex: numberAttr(trigger, 'data-anchor-index'),
        disabled: trigger.hasAttribute('disabled') || trigger.getAttribute('aria-disabled') === 'true',
      }
      this.spreader.spread(trigger, api.getTriggerProps(item) as Record<string, unknown>)
    }

    for (const preview of this.getParts('preview')) {
      const item = previewProps(preview)
      this.spreader.spread(preview, api.getPreviewProps(item) as Record<string, unknown>)
    }

    const previewPart = (
      name: string,
      getter: (item: CitationPreviewProps) => Record<string, unknown>,
    ): void => {
      for (const element of this.getParts(name)) {
        const preview = element.closest<HTMLElement>(citationAnatomy.build().preview.selector)
        if (preview)
          this.spreader.spread(element, getter(previewProps(preview)))
      }
    }
    previewPart('preview-header', item => api.getPreviewHeaderProps(item) as Record<string, unknown>)
    previewPart('preview-title', item => api.getPreviewTitleProps(item) as Record<string, unknown>)
    previewPart('preview-meta', item => api.getPreviewMetaProps(item) as Record<string, unknown>)
    previewPart('quote', item => api.getQuoteProps(item) as Record<string, unknown>)
    previewPart('preview-link', item => api.getPreviewLinkProps(item) as Record<string, unknown>)
    previewPart('dismiss-trigger', item => api.getDismissTriggerProps(item) as Record<string, unknown>)
    previewPart('prev-trigger', item => api.getPrevTriggerProps(item) as Record<string, unknown>)
    previewPart('next-trigger', item => api.getNextTriggerProps(item) as Record<string, unknown>)
    previewPart('preview-index', item => api.getPreviewIndexProps(item) as Record<string, unknown>)
    // 位置是运行期才知道的：元素写进 preview-index 里
    for (const element of this.getParts('preview-index')) {
      const preview = element.closest<HTMLElement>(citationAnatomy.build().preview.selector)
      const at = preview ? api.getPreviewPosition(previewProps(preview)) : null
      const text = at ? `${at.index} / ${at.total}` : ''
      if (element.textContent !== text)
        element.textContent = text
    }

    spread('list', api.getListProps() as Record<string, unknown>)
    for (const source of this.getParts('source')) {
      const item = sourceItem(source)
      this.spreader.spread(source, api.getSourceProps(item) as Record<string, unknown>)
    }
    const sourcePart = (
      name: string,
      getter: (item: CitationSourceItemProps) => Record<string, unknown>,
    ): void => {
      for (const element of this.getParts(name)) {
        const source = element.closest<HTMLElement>(citationAnatomy.build().source.selector)
        if (source)
          this.spreader.spread(element, getter(sourceItem(source)))
      }
    }
    sourcePart('source-link', item => api.getSourceLinkProps(item) as Record<string, unknown>)
    sourcePart('source-index', item => api.getSourceIndexProps(item) as Record<string, unknown>)
    sourcePart('source-title', item => api.getSourceTitleProps(item) as Record<string, unknown>)
    sourcePart('source-meta', item => api.getSourceMetaProps(item) as Record<string, unknown>)

    // hover 档卡片在场（没带 hidden）时才搬到 portal 落点
    const positioner = this.getPart('positioner')
    this.portal.sync(api.previewMode === 'hover' && positioner != null && !positioner.hidden)
  }

  /**
   * 角色节点提前发现一次：default-open 时状态机在 hostConnected 当场进入打开态，
   * 定位副作用要同步取到 positioner 与锚点。
   */
  override connectedCallback(): void {
    this.refreshParts()
    super.connectedCallback()
  }

  override disconnectedCallback(): void {
    this.portal.dispose()
    super.disconnectedCallback()
    this.config = null
  }
}

function numberAttr(element: Element, name: string): number | undefined {
  const raw = element.getAttribute(name)
  if (raw == null)
    return undefined
  const value = Number(raw)
  return Number.isInteger(value) && value >= 0 ? value : undefined
}

function previewProps(preview: HTMLElement): CitationPreviewProps {
  return {
    sourceId: preview.getAttribute('value') ?? '',
    anchorIndex: numberAttr(preview, 'data-anchor-index'),
  }
}

function sourceItem(source: HTMLElement): CitationSourceItemProps {
  return {
    sourceId: source.getAttribute('value') ?? '',
    disabled: source.hasAttribute('disabled') || source.getAttribute('aria-disabled') === 'true',
  }
}
