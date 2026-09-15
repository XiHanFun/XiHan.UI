/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 marquee 类型契约。

import type { PropTypes } from '@xihan-ui/core'

/**
 * 滚动方向：内容向该方向移动。
 * left / right 沿横轴，up / down 沿纵轴；轴另写为 data-orientation，皮肤据此排列轨道。
 */
export type MarqueeDirection = 'left' | 'right' | 'up' | 'down'

export interface MarqueeProps {
  /** 滚动方向，默认 left。 */
  direction?: MarqueeDirection
  /**
   * 名义上的每秒像素数。写为根上的内联变量，皮肤用一份内容的长度除以它换算为一圈的时长。
   * 该长度取自 `--xh-marquee-span`：CSS 无法读取布局尺寸，槽中存放的是一个默认值。
   * 把它修改为与内容真实长度一致时速度才逐字等于每秒该像素数，否则它是一个成比例的快慢档。
   * 只接受有限正数；其余值不写出，回退为皮肤默认值。
   */
  speed?: number
  /** 指针停在窗口上时暂停；键盘焦点落进窗口时同样暂停。 */
  pauseOnHover?: boolean
  /** 受控暂停：为真即停在当前位置，为假继续移动。优先于 pauseOnHover。 */
  paused?: boolean
  /** 内容不足时重复铺满：轨道中铺两份内容，走完一份正好接上第二份。 */
  autoFill?: boolean
}

export interface MarqueeApi<T extends PropTypes = PropTypes> {
  /** 轨道中铺设的内容份数：autoFill 开启为 2，关闭为 1。 */
  copies: number
  getRootProps: () => T['element']
  getContentProps: () => T['element']
}

/** 读屏文案。本组件目前没有需要外露的文案，保留该位。 */
export interface MarqueeTranslations {}
