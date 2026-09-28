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

/** 断点档位名，与断点令牌逐字同名，与 Grid 同一套。 */
export type FlexBreakpoint = 'sm' | 'md' | 'lg' | 'xl'

/** 逐档的取值：档与档之间自窄到宽依次接管，没写的档沿用比它窄的那一档。 */
export interface FlexByBreakpoint<T> {
  /** 未达到任何断点时的取值。 */
  base?: T
  /** 视口宽度达到 sm 断点后的取值。 */
  sm?: T
  /** 视口宽度达到 md 断点后的取值。 */
  md?: T
  /** 视口宽度达到 lg 断点后的取值。 */
  lg?: T
  /** 视口宽度达到 xl 断点后的取值。 */
  xl?: T
}

/** 单值即各档同一个取值；断点对象则逐档取值。 */
export type FlexResponsive<T> = T | FlexByBreakpoint<T>

export interface FlexProps {
  /**
   * 主轴方向：horizontal 横向、vertical 纵向，默认 horizontal。
   * 也接受断点对象 `{ base, sm, md, lg, xl }`：窄屏竖排、宽屏横排这类切换逐档书写；
   * 没写 align 时交叉轴的缺省对齐跟着当档的方向走。
   */
  orientation?: FlexResponsive<Orientation>
  /**
   * 交叉轴对齐：start / center / end / stretch / baseline，未提供时横向按中线对齐、纵向拉伸。
   * 也接受断点对象逐档书写，没写的档沿用更窄的一档。
   */
  align?: FlexResponsive<FlexAlign>
  /** 主轴分布：start / center / end / between / around / evenly，未提供时子项从主轴起点排列。也接受断点对象逐档书写。 */
  justify?: FlexResponsive<FlexJustify>
  /** 子项间距档位：xs / sm / md / lg / xl，未提供时不留间距。档位对应的数值由皮肤决定。也接受断点对象逐档书写。 */
  gap?: FlexResponsive<FlexGap>
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
