import type { SpinnerProps, SpinnerTranslations } from '@xihan-ui/headless'
import type { Size, Tone } from '@xihan-ui/kernel'
import { connectSpinner, spinnerAnatomy, spinnerMeta } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'

// 属性缺席翻成 undefined，缺省值由 connect 决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }

/**
 * `<xh-spinner>` —— 加载指示器宿主，无状态机，把活区语义与可及名字打到角色节点上。
 * 转圈图形由皮肤画在 root 的伪元素上，元素不生成任何结构。
 *
 * @customElement xh-spinner
 * @attr {string} label - 可及名字；label 角色节点显示的应当是同一段文案
 * @attr {'sm'|'md'|'lg'} size - 直径档位，缺省 md
 * @attr {'brand'|'neutral'|'success'|'warning'|'danger'|'info'} tone - 语气
 * @csspart root - role=status 的活区容器，承载 aria-live/aria-label/data-size/data-tone
 * @csspart label - 可见文案节点，可省
 */
export class XhSpinnerElement extends XhElement {
  static override partContract = { anatomy: spinnerAnatomy, meta: spinnerMeta }

  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    label: { converter: STRING_CONVERTER },
    size: { converter: STRING_CONVERTER },
    tone: { converter: STRING_CONVERTER },
    // 文案是对象，只走 property
    translations: { attribute: false },
  }

  declare label?: string
  declare size?: Size
  declare tone?: Tone
  declare translations?: Partial<SpinnerTranslations>

  protected wire(): void {
    const props: SpinnerProps = {
      label: this.label,
      size: this.size,
      tone: this.tone,
      translations: this.translations,
    }
    const api = connectSpinner(this.configured('spinner', props), wcNormalize)

    const put = (name: string, attrs: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, attrs)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
    put('label', api.getLabelProps() as Record<string, unknown>)
  }
}
