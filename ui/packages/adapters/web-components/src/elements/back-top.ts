/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 back top 相关实现。

import type { ActionVariant, Service, Size, Tone } from '@xihan-ui/core'
import type { BackTopBehavior, BackTopSchema, BackTopTranslations, BackTopVisibilityChangeDetails } from '@xihan-ui/headless'
import { backTopAnatomy, backTopMachine, backTopMeta, connectBackTop } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席翻成 undefined，缺省值由机器与 connect 决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v == null || v === '' ? undefined : Number(v)) }

/**
 * `<xh-back-top>`：回到顶部行为宿主：滚动量过线时显示按钮，点击滚回顶部。
 *
 * 作者须把 trigger 写为 `<button>`：激活与 Tab 停靠由平台提供，元素不接管任何按键。
 * 收起时整个 root 带 hidden，按钮一并退出 Tab 序列与无障碍树：
 * 依靠不透明度隐藏的按钮仍然可聚焦、仍然被读屏朗读。
 *
 * @customElement xh-back-top
 * @attr {number} visibility-height - 滚动超过该像素数后按钮才显示，默认 200
 * @attr {'auto'|'smooth'} behavior - 滚回顶部的方式，默认 smooth
 * @attr {'solid'|'subtle'|'outline'|'ghost'} variant - 形态，默认 outline（磨砂面；solid 才品牌实心）
 * @attr {'brand'|'neutral'|'success'|'warning'|'danger'|'info'} tone - 语气
 * @attr {'sm'|'md'|'lg'} size - 尺寸
 * @fires visibility-change - 显隐变化；detail 为 `{ visible: boolean }`
 * @csspart root - 定位壳，承载 data-state（visible / hidden）/ data-variant / data-tone / data-size；收起时带 hidden
 * @csspart trigger - 按钮，须写为 `<button>`；可及名由 translations.trigger 提供
 */
export class XhBackTopElement extends XhElement {
  static override partContract = { anatomy: backTopAnatomy, meta: backTopMeta }

  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    visibilityHeight: { converter: NUMBER_CONVERTER, attribute: 'visibility-height' },
    behavior: { converter: STRING_CONVERTER },
    variant: { converter: STRING_CONVERTER },
    tone: { converter: STRING_CONVERTER },
    size: { converter: STRING_CONVERTER },
    // 文案是对象，只走 property
    translations: { attribute: false },
    // 滚动容器是 DOM 句柄，只走 property；不给即整页滚动
    target: { attribute: false },
  }

  declare visibilityHeight?: number
  declare behavior?: BackTopBehavior
  declare variant?: ActionVariant
  declare tone?: Tone
  declare size?: Size
  declare translations?: Partial<BackTopTranslations>
  declare target?: HTMLElement | null

  private readonly notify = (details: BackTopVisibilityChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('visibility-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly ctrl = new MachineController<BackTopSchema>(
    this,
    backTopMachine,
    () => this.machineProps(),
    { onBuilt: svc => this.injectRefs(svc) },
  )

  private machineProps(): Partial<BackTopSchema['props']> {
    return {
      visibilityHeight: this.visibilityHeight,
      behavior: this.behavior,
      translations: this.translations,
      variant: this.variant,
      tone: this.tone,
      size: this.size,
      onVisibilityChange: this.notify,
    }
  }

  // onBuilt 在 ctrl 构造期就跑，service 由参数传入。
  private injectRefs(svc: Service<BackTopSchema>): void {
    svc.refs.set('getTargetEl', () => this.target ?? null)
  }

  protected wire(): void {
    const api = connectBackTop(this.ctrl.service, wcNormalize)

    const root = this.getPart('root')
    if (root) {
      const props = api.getRootProps() as Record<string, unknown>
      this.spreader.spread(root, props)
      // Light DOM 常驻，WC 自管可见性：作者层若给这个 part 声明了 display，
      // 会盖过 UA 的 [hidden]{display:none}，光靠 hidden 属性收不起来
      this.setPartHidden(root, props.hidden === true)
    }

    const trigger = this.getPart('trigger')
    if (trigger)
      this.spreader.spread(trigger, api.getTriggerProps() as Record<string, unknown>)
  }
}
