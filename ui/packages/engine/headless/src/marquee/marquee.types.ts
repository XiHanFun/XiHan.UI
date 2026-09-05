import type { PropTypes } from '@xihan-ui/core'

/**
 * 滚动方向：内容往这个方向走。
 * left / right 走横轴，up / down 走纵轴；轴另落成 data-orientation，皮肤据它排轨道。
 */
export type MarqueeDirection = 'left' | 'right' | 'up' | 'down'

export interface MarqueeProps {
  /** 滚动方向，缺省 left。 */
  direction?: MarqueeDirection
  /**
   * 每秒滚过的像素数。写成根上的内联变量，皮肤拿一份内容的长度除以它换成一圈的时长。
   * 只收有限正数；其余值不写出，退回皮肤缺省。
   */
  speed?: number
  /** 指针停在窗口上时暂停；键盘焦点落进窗口时同样暂停。 */
  pauseOnHover?: boolean
  /** 内容不足时重复铺满：轨道里铺两份内容，走完一份正好接上第二份。 */
  autoFill?: boolean
}

export interface MarqueeApi<T extends PropTypes = PropTypes> {
  /** 轨道里要铺几份内容：autoFill 开是 2，关是 1。 */
  copies: number
  getRootProps: () => T['element']
  getContentProps: () => T['element']
}

/** 读屏用的文案。本组件目前没有需要外露的文案，位先留着。 */
export interface MarqueeTranslations {}
