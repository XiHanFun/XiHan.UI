import type { Orientation, PropTypes } from '@xihan-ui/kernel'

/**
 * 主轴方向的旧词汇。
 *
 * @deprecated 用 `Orientation`（horizontal / vertical）。全库 21 份 types 的排布轴都叫
 * orientation，aria-orientation 也钉在那个名字上；这一份是唯一说 row / column 的。
 */
export type FlexDirection = 'row' | 'column'

/** 交叉轴对齐。 */
export type FlexAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline'

/** 主轴分布。 */
export type FlexJustify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'

/** 子项间距档位，逐档对应一个间距令牌。 */
export type FlexGap = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export interface FlexProps {
  /** 主轴方向：horizontal 横排、vertical 竖排，缺省 horizontal。 */
  orientation?: Orientation
  /**
   * 主轴方向的旧写法。
   *
   * @deprecated 用 `orientation`（horizontal / vertical）。两个都写时以 orientation 为准。
   */
  direction?: FlexDirection
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
