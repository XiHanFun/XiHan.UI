import type { PropTypes } from '@xihan-ui/kernel'
import type { HighlightSegment } from './highlight.split'

export interface HighlightProps {
  /** 要显示的整段文本。命中位置按这个串逐字符算出来。 */
  text?: string
  /** 关键词，一个或一组。空串会被丢掉。 */
  keyword?: string | readonly string[]
  /** 区分大小写，缺省不区分。 */
  caseSensitive?: boolean
}

export interface HighlightApi<T extends PropTypes = PropTypes> {
  /** 解析后的文本；没给时是空串。 */
  text: string
  /** 切好的片段，依次拼回去恒等于 text。 */
  segments: readonly HighlightSegment[]
  getRootProps: () => T['element']
  /** 铺到每个命中片段上的属性；每段都一样，命中的是哪个关键词不落到 DOM 上。 */
  getMarkProps: () => T['element']
}

/** 读屏用的文案。本组件目前没有需要外露的文案，位先留着。 */
export interface HighlightTranslations {}
