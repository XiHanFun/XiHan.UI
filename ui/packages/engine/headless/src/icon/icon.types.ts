/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 icon 类型契约。

import type { IconNode, IconRecord, PropTypes, Tone } from '@xihan-ui/core'

/**
 * 直径档位，默认 md，逐档对应 --xh-glyph-size-*。
 * text 跟随相邻文字的字号，其余七档是固定直径。
 */
export type IconSize = 'text' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'

/** 描边粗细档位，默认 regular；由皮肤用 CSS 的 stroke-width 覆盖记录中的呈现属性。 */
export type IconWeight = 'light' | 'regular' | 'bold'

/** 旋转档位：四分之一圈的整数倍，不接受任意角度。 */
export type IconRotate = 90 | 180 | 270

/** 翻转轴：横轴、纵轴，或两轴都翻。 */
export type IconFlip = 'horizontal' | 'vertical' | 'both'

export interface IconProps {
  /**
   * 要绘制的图标。传入的是记录本身而不是名字：
   * 名字需要运行期查表，查表就必须把全表静态引入，摇树完全失效。
   */
  icon?: IconRecord
  /**
   * 可及名。
   * 提供非空白文本 = 该图标是页面上唯一表达该信息的元素，输出 role="img" + aria-label；
   * 缺席或全空白 = 装饰，输出 aria-hidden="true"。没有第三种形态。
   */
  label?: string
  /** 直径档位，默认 md；默认档不输出 data-size。 */
  size?: IconSize
  /** 描边粗细档位，默认 regular；默认档不输出 data-weight。 */
  weight?: IconWeight
  /** 颜色：brand / neutral / success / warning / danger / info。 */
  tone?: Tone
  /**
   * 旋转档位：90 / 180 / 270，不旋转时不写。
   * 接受字符串是因为 WC 侧的档位来自 DOM 属性；不是这三档的值一律不写出。
   */
  rotate?: IconRotate | string
  /** 翻转轴：horizontal / vertical / both，不翻转时不写。旋转与翻转同时提供时两者叠加。 */
  flip?: IconFlip
}

export interface IconApi<T extends PropTypes = PropTypes> {
  /** 解析后的可及名；装饰态为 undefined。 */
  label: string | undefined
  /** 是否装饰态（label 未提供或全空白）。 */
  decorative: boolean
  /** 要铺进 glyph 的图元树；未传 icon 时为空数组。 */
  nodes: readonly IconNode[]
  /**
   * 当前铺设内容的身份。即 icon 本身：记录是模块级常量，引用相等即内容相等。
   * 不用字符串签名：签名要遍历整棵树再拼串，每次 wire 都要付出一次。
   */
  content: IconRecord | undefined
  getRootProps: () => T['element']
  getGlyphProps: () => T['element']
}

/** 读屏文案。本组件目前没有需要外露的文案，保留该位。 */
export interface IconTranslations {}
