/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 外框的命名区登记：外框元素与布局的纯函数都要用，单放一处。

import type { IconRecord } from '@xihan-ui/core'

/**
 * 区的位置：最上一条、中间一行的左、中、右、中间一列的下方、最下的状态栏，以及画布浮动件。
 * 左、右、下三个位置上的区是面板，这里写的是它缺省停的栏，用户可以挪。
 */
export type DesignerFramePosition = 'top' | 'start' | 'center' | 'end' | 'bottom' | 'status' | 'overlay'

/** 画布上此刻的工具：select 是点选与框选（缺省），pan 是按住拖动平移画布。 */
export type DesignerCanvasTool = 'select' | 'pan'

/** 画布浮动件落在画布区的哪个角上，或右侧中间。 */
export type DesignerFrameOverlayAnchor = 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'end'

/** 一个命名区，也就是面板的登记。区名是面板 id，同一栏的多块面板按登记顺序上下排列。 */
export interface DesignerFrameRegion {
  /** 区名：写 slot="<区名>" 的子元素放进这个区，布局里也按它认面板。 */
  readonly name: string
  /** 区的位置；左、右、下是面板缺省停的栏。 */
  readonly position: DesignerFramePosition
  /** 所在栏的缺省大小（百分比）：左右两栏占中间一行的宽度，下方一栏占中间一列的高度；取那一栏第一块面板的值。 */
  readonly size?: number
  /** 拖动时所在栏的下限（百分比），缺省 10；取那一栏第一块面板的值。外框按尺寸槽算出的下限更大时以那个为准。 */
  readonly minSize?: number
  /** 分隔条无障碍名称里的区名，缺省用 title，再缺省用 name。 */
  readonly label?: string
  /** 面板头的标题：给了就把这块面板画成卡片，头部写标题；只对左、右、下三个位置生效。 */
  readonly title?: string
  /** 面板头标题下的一行副标题，如属性面板当前对象的名字。 */
  readonly subtitle?: string
  /** 面板头的帮助：给了就在右上角出帮助钮，悬停或聚焦时弹出这段说明。 */
  readonly help?: string
  /** 面板的图标：面板菜单、浮出小窗的标题栏里用。 */
  readonly icon?: IconRecord
  /** position 为 overlay 时落在画布区的哪里，缺省 bottom-end。 */
  readonly anchor?: DesignerFrameOverlayAnchor
  /** 缺省不显示。 */
  readonly defaultHidden?: boolean
  /** 能隐藏（面板头出关闭钮），缺省 true。 */
  readonly closable?: boolean
  /** 能换栏、调序，缺省 true。 */
  readonly movable?: boolean
  /** 能浮出成小窗，缺省 true。 */
  readonly floatable?: boolean
  /** 能收成标题条，缺省 true。 */
  readonly minimizable?: boolean
}
