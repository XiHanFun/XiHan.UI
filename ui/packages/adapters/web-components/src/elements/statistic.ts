/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 statistic 相关实现。

import type { Size, Tone } from '@xihan-ui/core'
import type { StatisticProps, StatisticTrend } from '@xihan-ui/headless'
import type { ElementStructure } from '../element-base'
import { connectStatistic, statisticAnatomy, statisticMeta, statisticStructure } from '@xihan-ui/headless'
import { NUMBER_CONVERTER, STRING_CONVERTER } from '../dom/converters'
import { GEN_ATTR } from '../dom/generated-nodes'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'

/**
 * `<xh-statistic>`：Light-DOM 行为宿主，无状态机，把 connectStatistic 产出接到各角色节点。
 *
 * 除 root 外的部件全部可省略：只放置一个数值也是合法的统计块。
 * 给了 value 时元素按 locale 与 formatOptions 格式化它：作者写的 value 部件是空的，就把这串字写进去；
 * 部件里写了内容就照写的显示，不覆盖。不给 value 时数值由作者格式化后放入 value 部件。组件不做动画。
 *
 * root 上不写 role：一块统计数是否为列表项、是否需要可及名，由它所在的位置决定。
 *
 * 不写部件（或只写 root）时元素按标准结构生成：标签（label 属性或 `slot="label"`）、前缀（`slot="prefix"`）、
 * 数值（value 格式化好的文字）、后缀（`slot="suffix"`）、涨跌（给了 trend 或 trend-text 才有），给了哪段才生成哪段。
 *
 * @customElement xh-statistic
 * @attr {'sm'|'md'|'lg'} size - 尺寸档位，写到 root 的 data-size 上
 * @attr {'brand'|'neutral'|'success'|'warning'|'danger'|'info'} tone - 语气，写到 root 的 data-tone 上
 * @attr {'up'|'down'|'flat'} trend - 涨跌，写到 trend 部件的 data-trend 上；与 tone 正交
 * @attr {number} value - 数值：按 locale 与 formatOptions 格式化后写进 value 部件；部件里写了内容就照写的显示
 * @attr {string} locale - BCP 47 语言标记，决定小数点、分组符与货币写法；未提供时取全局配置，再没有按宿主语言，宿主也没有时按 en-US
 * @prop {Intl.NumberFormatOptions} formatOptions - 交给 Intl.NumberFormat 的选项（小数位、分组、货币、百分比、单位、紧凑记数），只能通过 property 设置
 * @attr {string} label - 标签文字：生成结构时铺带这段文字的 label 部件；手写部件时不使用它
 * @attr {string} trend-text - 涨跌段的比数文字（「同比 12%」）：生成结构时铺进 trend 部件；手写部件时不使用它
 * @csspart root - 承载 data-size 与 data-tone 的容器
 * @csspart label - 数值上方的标签
 * @csspart value - 数值本体，用等宽数字排版
 * @csspart prefix - 数值前的货币符号或升降箭头
 * @csspart suffix - 数值后的单位或百分号
 * @csspart trend - 涨跌段，承载 data-trend；为空时皮肤按方向绘制兜底箭头
 */
export class XhStatisticElement extends XhElement {
  static override partContract = { anatomy: statisticAnatomy, meta: statisticMeta }

  static override structure: ElementStructure<XhStatisticElement> = {
    build: host => statisticStructure({
      label: host.label,
      valueText: host.api().valueText,
      trend: host.trend,
      trendText: host.trendText,
      slotted: (name, key) => host.slotted(name, key),
    }),
  }

  // 描述符逐个写全，CEM 分析器读不了对象展开
  static override properties = {
    size: { converter: STRING_CONVERTER },
    tone: { converter: STRING_CONVERTER },
    trend: { converter: STRING_CONVERTER },
    value: { converter: NUMBER_CONVERTER },
    locale: { converter: STRING_CONVERTER },
    // 选项是对象，只能走 property
    formatOptions: { attribute: false },
    label: { converter: STRING_CONVERTER },
    trendText: { converter: STRING_CONVERTER, attribute: 'trend-text' },
  }

  declare size?: Size
  declare tone?: Tone
  declare trend?: StatisticTrend
  declare value?: number
  declare locale?: string
  declare formatOptions?: Intl.NumberFormatOptions
  declare label?: string
  declare trendText?: string

  /** 作者写的 value 部件 → 元素上一次写进去的数值文字：文字还是这一串，就仍归元素管，可以换成新值。 */
  private readonly writtenValue = new WeakMap<HTMLElement, string>()

  // 读响应式 property，不回读 DOM 特性
  private api(): ReturnType<typeof connectStatistic> {
    const props: StatisticProps = {
      size: this.size,
      tone: this.tone,
      trend: this.trend,
      value: this.value,
      locale: this.locale,
      formatOptions: this.formatOptions,
    }
    return connectStatistic(this.configured('statistic', props), wcNormalize)
  }

  /**
   * 作者写的 value 部件里放格式化好的数值：部件是空的、或里面仍是元素上次写的那串字时才写，
   * 作者自己写了内容（文字或节点）就不动。标准结构生成的 value 由结构同步写字，这里跳过。
   */
  private fillValue(el: HTMLElement, text: string | undefined): void {
    if (el.hasAttribute(GEN_ATTR))
      return
    const written = this.writtenValue.get(el)
    const ours = written !== undefined && el.childElementCount === 0 && el.textContent === written
    // 只有空白的文字是模板缩进留下的，不算作者内容；放了节点（图标、数值动画）就算
    const authored = !ours && (el.childElementCount > 0 || (el.textContent ?? '').trim() !== '')
    if (authored) {
      this.writtenValue.delete(el)
      return
    }
    if (text === undefined) {
      if (ours)
        el.textContent = ''
      this.writtenValue.delete(el)
      return
    }
    // 比一次再写：值没动时的赋值会白白惊动一次变更记录
    if (el.textContent !== text)
      el.textContent = text
    this.writtenValue.set(el, text)
  }

  protected wire(): void {
    const api = this.api()

    const put = (name: string, attrs: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, attrs)
    }
    put('root', api.getRootProps())
    put('label', api.getLabelProps())
    put('value', api.getValueProps())
    put('prefix', api.getPrefixProps())
    put('suffix', api.getSuffixProps())
    put('trend', api.getTrendProps())

    const value = this.getPart('value')
    if (value)
      this.fillValue(value, api.valueText)
  }
}
