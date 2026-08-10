import type { PropTypes, Size, Tone } from '@xihan-ui/kernel'

/** 直径档位，缺省 md。 */

/** 读屏用的文案，默认英文。 */
export interface SpinnerTranslations {
  /** 转圈的可及名字，说明正在等什么。 */
  label: string
}

export interface SpinnerProps {
  /**
   * 这一处的可及名字，写在 root 上。
   * label 部件显示的应当是同一段文案：aria-label 会盖过节点里的文字，两者不一致时
   * 读屏念的与屏幕上看到的就对不上了。
   */
  label?: string
  /** 直径档位，缺省 md；缺省档不输出 data-size。 */
  size?: Size
  /** 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色 */
  tone?: Tone
  translations?: Partial<SpinnerTranslations>
}

export interface SpinnerApi<T extends PropTypes = PropTypes> {
  /** 解析后的文案：label → translations.label → 内置默认值。 */
  label: string
  getRootProps: () => T['element']
  getLabelProps: () => T['element']
}
