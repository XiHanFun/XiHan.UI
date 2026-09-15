/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 flex 类型契约。

import type { Orientation, PropTypes } from '@xihan-ui/core'

/** 交叉轴对齐。 */
export type FlexAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline'

/** 主轴分布。 */
export type FlexJustify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'

/** 子项间距档位，逐档对应一个间距令牌。 */
export type FlexGap = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export interface FlexProps {
  /** 主轴方向：horizontal 横向、vertical 纵向，默认 horizontal。 */
  orientation?: Orientation
  /** 交叉轴对齐：start / center / end / stretch / baseline，未提供时横向按中线对齐、纵向拉伸。 */
  align?: FlexAlign
  /** 主轴分布：start / center / end / between / around / evenly，未提供时子项从主轴起点排列。 */
  justify?: FlexJustify
  /** 子项间距档位：xs / sm / md / lg / xl，未提供时不留间距。档位对应的数值由皮肤决定。 */
  gap?: FlexGap
  /** 一行放不下时换行。 */
  wrap?: boolean
  /** 容器按行内盒排版，宽度收缩到内容。 */
  inline?: boolean
}

export interface FlexApi<T extends PropTypes = PropTypes> {
  getRootProps: () => T['element']
  /** 分隔符节点。它是装饰件，恒带 aria-hidden：一排中夹杂的竖线被逐条朗读只会打断内容。 */
  getSplitProps: () => T['element']
}

/** 读屏文案。本组件目前没有需要外露的文案，保留该位。 */
export interface FlexTranslations {}
