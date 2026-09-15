/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 log 相关实现。

import type { IdGenerator, RuntimeConfig, Service, Size } from '@xihan-ui/core'
import type { LogLevel, LogProps, LogSchema, LogStickChangeDetails, LogTranslations } from '@xihan-ui/headless'
import { createCounterIdGenerator, createRuntimeConfig, createScope } from '@xihan-ui/core'
import { connectLog, logAnatomy, logMachine, logMeta } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席翻成 undefined，缺省值由 connect 给出
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
// 空串按缺席处理，避免 Number('') 落成 0
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v == null || v === '' ? undefined : Number(v)) }

const LEVELS = new Set<string>(['debug', 'info', 'warn', 'error'])

/** 一行的级别，取作者写在节点上的 level；四档之外一律当没写。 */
function lineLevel(el: HTMLElement): LogLevel | undefined {
  const raw = el.getAttribute('level')
  return raw != null && LEVELS.has(raw) ? raw as LogLevel : undefined
}

/**
 * `<xh-log>`：Light-DOM 行为宿主：作者写 root / viewport / content / line 角色节点，
 * 元素把 connectLog 的产出接上。行增长时跟随滚动到底部，用户上滚后解除贴附，
 * 滚回底部阈值内、按回到底部按钮或调用 scrollToBottom() 时恢复。
 *
 * 行的内容不替作者生成：文本、级别、时间戳、标注都写在 line 角色节点中，元素只发身份与等宽排版。
 *
 * @customElement xh-log
 * @attr {number} rows - 视口按多少行定高；未提供时高度由皮肤决定
 * @attr {boolean} loading - 行仍在传输中：日志区报告 aria-busy，根写 data-loading
 * @attr {string} size - 尺寸：sm / md / lg
 * @fires stick-change - 贴底状态变化；detail 为 `{ atBottom: boolean, sticking: boolean }`
 * @csspart root - 组件根容器，承载 data-size / data-loading / data-at-bottom / data-sticking
 * @csspart viewport - 滚动容器；role=log + aria-live=off + tabindex=0，按行数定高写入内联样式
 * @csspart content - 所有行的包裹层，尺寸变化的观察目标
 * @csspart line - 一行日志，承载身份、等宽排版与 data-level；级别写为节点上的 level 属性
 * @csspart scroll-to-end-trigger - 回到底部按钮，在底部时收起（hidden + 内联 display）
 * @csspart live-region - 视觉隐藏的播报区（role=status + aria-live=polite + aria-atomic）
 */
export class XhLogElement extends XhElement {
  static override partContract = { anatomy: logAnatomy, meta: logMeta }

  // 描述符逐个写全，不用对象展开，CEM 分析器的 lit 插件读不了展开元素的名字
  static override properties = {
    rows: { converter: NUMBER_CONVERTER },
    loading: { type: Boolean },
    size: { converter: STRING_CONVERTER },
    // 对象值走不了 HTML 属性，只作为 property 暴露
    translations: { attribute: false },
  }

  declare rows?: number
  declare loading?: boolean
  declare size?: Size
  /** 日志区与回到底部按钮的无障碍名，由 connect 写到节点上。 */
  declare translations?: Partial<LogTranslations>

  private readonly idGen: IdGenerator = createCounterIdGenerator()
  private readonly logScope = createScope(null, this.idGen)
  private config: RuntimeConfig | null = null

  private readonly notify = (details: LogStickChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('stick-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly ctrl = new MachineController<LogSchema>(
    this,
    logMachine,
    () => ({ onStickChange: this.notify }),
    { scope: this.logScope, onBuilt: svc => this.injectRefs(svc) },
  )

  private ensureConfig(): void {
    if (this.config)
      return
    this.config = createRuntimeConfig({ scope: this.logScope, idGenerator: this.idGen })
  }

  /** 装填 config 与两个节点 getter；onBuilt 在 ctrl 构造期就跑，故 service 由参数传入。 */
  private injectRefs(svc: Service<LogSchema>): void {
    this.ensureConfig()
    svc.refs.set('config', this.config)
    svc.refs.set('getViewportEl', () => this.getPart('viewport'))
    svc.refs.set('getContentEl', () => this.getPart('content'))
  }

  private viewProps(): LogProps {
    return {
      rows: this.rows,
      loading: this.loading ?? false,
      size: this.size,
      translations: this.translations,
    }
  }

  /**
   * 滚动到底部并恢复粘附。状态机在 hostConnected 后才建立，尚未进入 DOM 时不做任何处理、不抛错。
   * 作者未写 scroll-to-end-trigger 角色节点时，由自己的按钮调用它。
   */
  scrollToBottom(): void {
    const service = this.ctrl.service as Service<LogSchema> | undefined
    service?.send({ type: 'SCROLL_TO_BOTTOM' })
  }

  protected wire(): void {
    const api = connectLog(this.ctrl.service, this.configured('log', this.viewProps()), wcNormalize)

    // 角色节点可能晚一拍才填进来，每次接线都让句柄按当前节点重绑
    this.ctrl.service.refs.get('stick')?.retarget()

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
    put('viewport', api.getViewportProps() as Record<string, unknown>)
    put('content', api.getContentProps() as Record<string, unknown>)
    put('scroll-to-end-trigger', api.getScrollToEndTriggerProps() as Record<string, unknown>)
    put('live-region', api.getLiveRegionProps() as Record<string, unknown>)

    // 多实例 part 逐个打，行有几条打几条；级别取作者写在节点上的 level
    for (const el of this.getParts('line'))
      this.spreader.spread(el, api.getLineProps({ level: lineLevel(el) }) as Record<string, unknown>)

    // 除 hidden 属性外还写内联 display，压住作者层给该 part 声明的 display
    this.setPartHidden(this.getPart('scroll-to-end-trigger'), !api.showScrollToEndTrigger)
  }
}
