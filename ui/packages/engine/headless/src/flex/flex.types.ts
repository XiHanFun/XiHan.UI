import type { Orientation, PropTypes } from '@xihan-ui/kernel'

/** 交叉轴对齐。 */
export type FlexAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline'

/** 主轴分布。 */
export type FlexJustify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'

/** 子项间距档位，逐档对应一个间距令牌。 */
export type FlexGap = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export interface FlexProps {
  /** 主轴方向：horizontal 横排、vertical 竖排，缺省 horizontal。 */
  orientation?: Orientation
  /** 交叉轴对齐：start / center / end / stretch / baseline，不写则由皮肤的缺省对齐决定。 */
  align?: FlexAlign
  /** 主轴分布：start / center / end / between / around / evenly，不写则子项从主轴起点排起。 */
  justify?: FlexJustify
  /** 子项间距档位：xs / sm / md / lg / xl，不写则不留间距。档位换算成多少由皮肤定。 */
  gap?: FlexGap
  /** 一行放不下时折行。 */
  wrap?: boolean
  /** 容器按行内盒排版，宽度收到内容。 */
  inline?: boolean
}

export interface FlexApi<T extends PropTypes = PropTypes> {
  getRootProps: () => T['element']
}

/** 读屏用的文案。本组件目前没有需要外露的文案，位先留着。 */
export interface FlexTranslations {}
