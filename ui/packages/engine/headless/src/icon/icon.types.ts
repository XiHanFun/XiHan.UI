import type { IconNode, IconRecord, PropTypes, Tone } from '@xihan-ui/core'

/**
 * 直径档位，缺省 md，逐档对应 --xh-glyph-size-*。
 * text 跟着相邻文字的字号走，其余七档是固定直径。
 */
export type IconSize = 'text' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'

/** 描边粗细档位，缺省 regular；由皮肤用 CSS 的 stroke-width 盖掉记录里的呈现属性。 */
export type IconWeight = 'light' | 'regular' | 'bold'

/** 旋转档位：四分之一圈的整数倍，不收任意角度。 */
export type IconRotate = 90 | 180 | 270

/** 翻转轴：横轴、纵轴，或两轴都翻。 */
export type IconFlip = 'horizontal' | 'vertical' | 'both'

export interface IconProps {
  /**
   * 要画的图标。传的是记录本身而不是名字：
   * 名字要走运行期查表，查表就必须把全表静态引进来，摇树全废。
   */
  icon?: IconRecord
  /**
   * 可及名字。
   * 给了非空白文本 = 这个图标是页面上唯一说出这件事的东西，输出 role="img" + aria-label；
   * 缺席或全空白 = 装饰，输出 aria-hidden="true"。没有第三种形态。
   */
  label?: string
  /** 直径档位，缺省 md；缺省档不输出 data-size。 */
  size?: IconSize
  /** 描边粗细档位，缺省 regular；缺省档不输出 data-weight。 */
  weight?: IconWeight
  /** 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色 */
  tone?: Tone
  /**
   * 旋转档位：90 / 180 / 270，不转就不写。
   * 收字符串是因为 WC 那侧的档位来自 DOM 属性；不是这三档的值一律不写出。
   */
  rotate?: IconRotate | string
  /** 翻转轴：horizontal / vertical / both，不翻就不写。旋转与翻转同写时两者叠加。 */
  flip?: IconFlip
}

export interface IconApi<T extends PropTypes = PropTypes> {
  /** 解析后的可及名字；装饰态为 undefined。 */
  label: string | undefined
  /** 是否装饰态（label 没给或全空白）。 */
  decorative: boolean
  /** 要铺进 glyph 的图元树；没传 icon 时是空数组。 */
  nodes: readonly IconNode[]
  /**
   * 当前铺设内容的身份。就是 icon 本身：记录是模块级常量，引用相等即内容相等。
   * 不用字符串签名——签名要遍历整棵树再拼串，每次 wire 都付一遍。
   */
  content: IconRecord | undefined
  getRootProps: () => T['element']
  getGlyphProps: () => T['element']
}

/** 读屏用的文案。本组件目前没有需要外露的文案，位先留着。 */
export interface IconTranslations {}
