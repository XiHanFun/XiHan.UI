/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 loading bar 相关实现。

import type { Tone } from '@xihan-ui/core'
import type { LoadingBarSchema, LoadingBarTranslations, LoadingBarValueChangeDetails } from '@xihan-ui/headless'
import { connectLoadingBar, loadingBarAnatomy, loadingBarMachine, loadingBarMeta } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席翻成 undefined，缺省值由机器与 connect 决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
// 空串也当缺席：`value=""` 经 Number() 会变成 0，那是一个货真价实的进度值，不是"没写"
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v == null || v === '' ? undefined : Number(v)) }
// 缺省为真的开关（trickle）得能被 ="false" 关掉；三态：缺席 = undefined（用默认值），="false" = false，其余 = true
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }
// 厚度两用：`height="3"` 按像素，`height="0.25rem"` 按 CSS 长度原样交给 connect
const HEIGHT_CONVERTER = {
  fromAttribute: (v: string | null): string | number | undefined => {
    if (v == null || v === '')
      return undefined
    const px = Number(v)
    return Number.isFinite(px) ? px : v
  },
}

/**
 * `<xh-loading-bar>`：Light-DOM 行为宿主：作者写 root / track / range 角色节点，
 * 元素运行 loading-bar 状态机并把 connect 产出接上。
 *
 * 两种模式互不相干：提供 `value` 即为确定进度，宽度按它显示、读屏可以获取 aria-valuenow；
 * 未提供时使用模拟进度：`loading` 置真时先跳到 `minimum`，随后按 `trickle-speed` 逐拍爬升，
 * 步长按剩余量取，因此越接近满格越慢且永远到不了 100；此时按规范不报告 aria-valuenow，
 * 属性缺席本身就是进度未知的表达。`loading` 转为假时先到达 100，走完淡出窗口才归零收起。
 *
 * 收起态只给 root 加 hidden 并写一条内联 display，作者编写的结构一个都不卸载。
 *
 * @customElement xh-loading-bar
 * @attr {number} value - 受控进度值（0-100）；提供后即为确定进度，内部爬升整体让位
 * @attr {number} default-value - 非受控初值，默认 0
 * @attr {boolean} loading - 加载开关：属性存在即开始，`loading="false"` 或移除即结束
 * @attr {string|number} height - 进度条厚度：纯数字按像素，其余按 CSS 长度；默认 2px
 * @attr {'brand'|'neutral'|'success'|'warning'|'danger'|'info'} tone - 语气，决定进度段使用哪族颜色；提供 color 时以 color 为准
 * @attr {boolean} trickle - 不确定进度时自行向前爬升，默认开启；`trickle="false"` 关闭
 * @attr {number} trickle-speed - 爬升节拍毫秒，默认 200；<=0 等同于关闭爬升
 * @attr {number} minimum - 起步值，默认 8
 * @attr {number} fade-duration - 到达 100 之后的淡出窗口毫秒，默认 200
 * @fires value-change - 进度值变化；detail 为 `{ value: number }`
 * @csspart root - progressbar 本身（承载名字、值域、data-state 与收起态）
 * @csspart track - 背景槽
 * @csspart range - 进度段；宽度由元素写入内联样式，样式层不应修改该轴
 * @csspart peg - 进度段末端的亮边（对读屏隐藏）
 */
export class XhLoadingBarElement extends XhElement {
  static override partContract = { anatomy: loadingBarAnatomy, meta: loadingBarMeta }

  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    value: { converter: NUMBER_CONVERTER },
    defaultValue: { converter: NUMBER_CONVERTER, attribute: 'default-value' },
    loading: { converter: BOOLEAN_CONVERTER },
    height: { converter: HEIGHT_CONVERTER },
    tone: { converter: STRING_CONVERTER },
    trickle: { converter: BOOLEAN_CONVERTER },
    trickleSpeed: { converter: NUMBER_CONVERTER, attribute: 'trickle-speed' },
    minimum: { converter: NUMBER_CONVERTER },
    fadeDuration: { converter: NUMBER_CONVERTER, attribute: 'fade-duration' },
    // 文案是对象，走不了属性；只作为 property 暴露，与 Vue 侧的 translations prop 对齐
    translations: { attribute: false },
  }

  declare value?: number
  declare defaultValue?: number
  declare loading?: boolean
  declare height?: string | number
  declare tone?: Tone
  declare trickle?: boolean
  declare trickleSpeed?: number
  declare minimum?: number
  declare fadeDuration?: number
  declare translations?: Partial<LoadingBarTranslations>

  private readonly notify = (details: LoadingBarValueChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('value-change', { detail: details, bubbles: true, composed: true }))
  }

  // loading-bar 机器的副作用只有两个计时器（自身自足）：不需要 config/layer/refs，controller 只带 props。
  private readonly ctrl = new MachineController<LoadingBarSchema>(this, loadingBarMachine, () => this.machineProps())

  private machineProps(): Partial<LoadingBarSchema['props']> {
    return {
      value: this.value,
      defaultValue: this.defaultValue,
      // 布尔属性经三态转换器进来：不在即 undefined，把缺省交回机器
      loading: this.loading,
      height: this.height,
      tone: this.tone,
      trickle: this.trickle,
      trickleSpeed: this.trickleSpeed,
      minimum: this.minimum,
      fadeDuration: this.fadeDuration,
      translations: this.translations,
      onValueChange: this.notify,
    }
  }

  protected wire(): void {
    const api = connectLoadingBar(this.ctrl.service, wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
    put('track', api.getTrackProps() as Record<string, unknown>)
    put('range', api.getRangeProps() as Record<string, unknown>)
    put('peg', api.getPegProps() as Record<string, unknown>)

    // 收起只写 hidden 属性是不够的：作者层给 root 声明的任何一条 display
    // 都会盖过 UA 的 [hidden]{display:none}，只有内联 style.display 压得住
    this.setPartHidden(this.getPart('root'), !api.visible)
  }
}
