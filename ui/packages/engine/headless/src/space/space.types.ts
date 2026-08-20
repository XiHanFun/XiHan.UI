import type { Orientation, PropTypes } from '@xihan-ui/kernel'

/** 交叉轴对齐。 */
export type SpaceAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline'

/** 主轴分布。 */
export type SpaceJustify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'

/** 子项间距档位，逐档对应一个间距令牌。 */
export type SpaceGap = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export interface SpaceProps {
  /** 排布方向：horizontal 横排、vertical 竖排，缺省 horizontal。 */
  direction?: Orientation
  /** 子项间距档位：xs / sm / md / lg / xl，缺省 md。档位换算成多少由皮肤定。 */
  gap?: SpaceGap
  /** 交叉轴对齐：start / center / end / stretch / baseline，不写则横排按中线对齐、竖排拉伸。 */
  align?: SpaceAlign
  /** 主轴分布：start / center / end / between / around / evenly，不写则子项从主轴起点排起。 */
  justify?: SpaceJustify
  /** 一行放不下时折行。 */
  wrap?: boolean
  /** 容器按行内盒排版，宽度收到内容。 */
  inline?: boolean
}

export interface SpaceApi<T extends PropTypes = PropTypes> {
  getRootProps: () => T['element']
  /** 分隔符节点。它是装饰件，恒带 aria-hidden：一排里夹着的竖线被逐条念出来只会打断内容。 */
  getSplitProps: () => T['element']
}

/** 读屏用的文案。本组件目前没有需要外露的文案，位先留着。 */
export interface SpaceTranslations {}
