/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 spinner 相关实现。

import type { Orientation, Size, Tone } from '@xihan-ui/core'
import type { SpinnerSchema, SpinnerTranslations, SpinnerVariant } from '@xihan-ui/headless'
import { connectSpinner, spinnerAnatomy, spinnerMachine, spinnerMeta } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席翻成 undefined，缺省值由 connect 决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v === null || v === '' ? undefined : Number(v)) }
// 缺省为真的布尔：不写属性取缺省，写 loading="false" 才算假
const DEFAULT_TRUE_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

/**
 * `<xh-spinner>`：加载指示器宿主，把活区语义与可及名接到角色节点上；状态机只管露面前的等待。
 * 转圈图形由皮肤绘制在 root 的伪元素上，元素不生成任何结构。遮罩形态由作者写出 container 包住 content 与 mask、
 * root 放在 mask 里，再打上 overlay。
 *
 * @customElement xh-spinner
 * @attr {string} label - 可及名；label 角色节点显示的应当是同一段文案
 * @attr {'sm'|'md'|'lg'} size - 直径档位，默认 md
 * @attr {'ring'|'arc'|'dots'} variant - 形态，默认 arc
 * @attr {'brand'|'neutral'|'success'|'warning'|'danger'|'info'} tone - 语气
 * @attr {'horizontal'|'vertical'} orientation - 转圈与配文的排布，默认 horizontal；vertical 转圈在上、配文在下
 * @attr {number} delay - 连接后等多少毫秒才露面，默认 0；加载在这之前结束、元素被移除时它从头到尾不出现
 * @attr {boolean} loading - 是否在等待，缺省为真；写 loading="false" 时转圈藏起，遮罩形态下撤掉遮罩
 * @attr {boolean} overlay - 遮罩形态：转圈缺省竖排，配合 container / content / mask 部件包住一块内容
 * @attr {boolean} fullscreen - 遮罩形态下盖住整个视口
 * @csspart root - role=status 的活区容器，承载 aria-live / aria-label / data-size / data-variant / data-tone / data-orientation / data-state
 * @csspart label - 可见文案节点，可省略
 * @csspart container - 遮罩形态的外框，包住 content 与 mask
 * @csspart content - 被包住的内容：等待时报 aria-busy，遮罩露面后不可交互
 * @csspart mask - 盖在内容上的遮罩，root 放在它里面居中
 */
export class XhSpinnerElement extends XhElement {
  static override partContract = { anatomy: spinnerAnatomy, meta: spinnerMeta }

  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    label: { converter: STRING_CONVERTER },
    size: { converter: STRING_CONVERTER },
    variant: { converter: STRING_CONVERTER },
    tone: { converter: STRING_CONVERTER },
    orientation: { converter: STRING_CONVERTER },
    delay: { converter: NUMBER_CONVERTER },
    loading: { converter: DEFAULT_TRUE_CONVERTER },
    overlay: { type: Boolean },
    fullscreen: { type: Boolean },
    // 文案是对象，只走 property
    translations: { attribute: false },
  }

  declare label?: string
  declare size?: Size
  declare variant?: SpinnerVariant
  declare tone?: Tone
  declare orientation?: Orientation
  declare delay?: number
  declare loading?: boolean
  declare overlay?: boolean
  declare fullscreen?: boolean
  declare translations?: Partial<SpinnerTranslations>

  private readonly ctrl = new MachineController<SpinnerSchema>(this, spinnerMachine, () => this.configured('spinner', {
    label: this.label,
    size: this.size,
    variant: this.variant,
    tone: this.tone,
    orientation: this.orientation,
    delay: this.delay,
    loading: this.loading,
    overlay: this.overlay,
    fullscreen: this.fullscreen,
    translations: this.translations,
  }))

  protected wire(): void {
    const api = connectSpinner(this.ctrl.service, wcNormalize)

    const put = (name: string, attrs: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, attrs)
    }
    put('root', api.getRootProps())
    put('label', api.getLabelProps())
    put('container', api.getContainerProps())
    put('content', api.getContentProps())
    put('mask', api.getMaskProps())
  }
}
