import type { TimeProps, TimeType, TimeValue } from '@xihan-ui/headless'
import { connectTime, timeAnatomy, timeMeta } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'

// 属性缺席翻成 undefined，缺省值由 connect 决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }

/**
 * `<xh-time>` —— Light-DOM 行为宿主，无状态机，把 connectTime 产出打到 root 角色节点。
 *
 * 作者写一个空的 `<time data-xh-part="root"></time>`：datetime 与显示文本都是算出来的，
 * 两者取自同一个墙钟，元素不做时区换算。作者若自己在这个节点里写了文本，那份文本原样留着，
 * 元素只覆盖自己上一次铺进去的那一份。
 *
 * 认不出的时刻落 `data-state="invalid"`，此时不写 datetime——
 * 与其给机器一个瞎编的时间戳，不如什么都不给。
 *
 * 数字时间戳只能走 property（`el.value = 1786000000000`）：属性里的一串数字与年份写法分不开。
 *
 * @customElement xh-time
 * @attr {string} value - 要显示的时刻；只写年月日的串按本地零点解读
 * @attr {'date'|'datetime'|'relative'} type - 呈现方式，缺省 datetime
 * @attr {string} format - 自定义格式串，记号是 YYYY / YY / MM / M / DD / D / HH / H / mm / m / ss / s
 * @attr {string} locale - BCP 47 语言标记，zh 开头用中文用词、其余英文；不给按宿主语言，宿主也没有时按 en-US。只换给人看的文本
 * @attr {string} now - 算相对说法时的参照时刻，缺省取当前时刻
 * @csspart root - 那个 `<time>`，承载 datetime / data-format / data-state / data-relative
 */
export class XhTimeElement extends XhElement {
  static override partContract = {
    anatomy: timeAnatomy,
    meta: timeMeta,
    // root 不是 <time> 时 datetime 只是个自定义属性，机器读不到任何时刻
    tags: { root: ['time'] },
  }

  // 描述符逐个写全，CEM 分析器读不了对象展开
  static override properties = {
    value: { converter: STRING_CONVERTER },
    type: { converter: STRING_CONVERTER },
    format: { converter: STRING_CONVERTER },
    locale: { converter: STRING_CONVERTER },
    now: { converter: STRING_CONVERTER },
  }

  declare value?: TimeValue
  declare type?: TimeType
  declare format?: string
  declare locale?: string
  declare now?: TimeValue

  /** 上一次铺进 root 的那份文本。 */
  #painted?: string

  protected wire(): void {
    const root = this.getPart('root')
    if (!root)
      return

    // 读响应式 property，不回读 DOM 特性
    const api = connectTime({
      value: this.value,
      type: this.type,
      format: this.format,
      locale: this.locale,
      now: this.now,
    } satisfies TimeProps, wcNormalize)

    this.spreader.spread(root, api.getRootProps() as Record<string, unknown>)
    this.#paintText(root, api.text)
  }

  /**
   * 把格式化好的文本铺进 root。
   * 节点里已有的文本不是本元素铺的（作者自己写的兜底文案）就不动它。
   */
  #paintText(root: HTMLElement, text: string): void {
    const current = root.textContent ?? ''
    if (current.trim() !== '' && current !== this.#painted)
      return
    this.#painted = text
    if (current !== text)
      root.textContent = text
  }
}
