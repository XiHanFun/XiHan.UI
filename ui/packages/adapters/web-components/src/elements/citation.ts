/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 citation 相关实现。

import type { Direction, Size } from '@xihan-ui/core'
import type {
  CitationActiveSourceChangeDetails,
  CitationOpenChangeDetails,
  CitationPreviewProps,
  CitationSchema,
  CitationSource,
  CitationSourceItemProps,
  CitationSourceOpenDetails,
  CitationTriggerProps,
} from '@xihan-ui/headless'
import { citationAnatomy, citationMachine, citationMeta, connectCitation } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

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
 * @fires active-source-change - 当前来源变化
 * @fires open-change - 预览展开态变化
 * @fires source-open - 用户请求打开原始来源
 * @csspart root - 组件根
 * @csspart text - 含行内引用的正文
 * @csspart trigger - 行内引用按钮
 * @csspart preview - 来源预览区域
 * @csspart preview-title - 预览标题
 * @csspart list - 来源列表
 * @csspart source - 来源条目
 * @csspart source-link - 来源条目按钮
 */
export class XhCitationElement extends XhElement {
  static override partContract = { anatomy: citationAnatomy, meta: citationMeta }

  static override properties = {
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
  declare translations?: CitationSchema['props']['translations']

  private readonly onActiveSourceChange = (details: CitationActiveSourceChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('active-source-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly onOpenChange = (details: CitationOpenChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('open-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly onSourceOpen = (details: CitationSourceOpenDetails): void => {
    this.dispatchEvent(new CustomEvent('source-open', { detail: details, bubbles: true, composed: true }))
  }

  private readonly ctrl = new MachineController<CitationSchema>(this, citationMachine, () => this.machineProps())

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

    for (const trigger of this.getParts('trigger')) {
      const item: CitationTriggerProps = {
        sourceId: trigger.getAttribute('value') ?? '',
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
