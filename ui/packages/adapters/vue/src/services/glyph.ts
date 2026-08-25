// 反馈服务默认模板用的装饰图形：裸字形（typeGlyph）、圆底徽记（typeBadge）与加载弧线。
// 纯装饰（aria-hidden），读屏内容由标题与描述承担；配色取语气层继承下来的私有槽，
// 随宿主 data-tone 自动换族。徽记里的图形取 --xh-glyph-mark-* 令牌，与皮肤的兜底字形同一套。
import type { VNode } from 'vue'
import { resolveMotionPreference } from '@xihan-ui/motion'
import { h } from 'vue'

/** 裸字形跟着宿主声明的图标尺寸走；宿主没声明时退回控件指示符那一档。 */
const GLYPH_SIZE = 'var(--xh-icon-size, var(--xh-control-indicator-size))'

const GLYPH_STYLE = {
  display: 'grid',
  placeItems: 'center',
  flex: 'none',
  inlineSize: GLYPH_SIZE,
  blockSize: GLYPH_SIZE,
  /* 字形压的是同族淡底，不是白底：主色 600 档兑上去只剩 2.1–2.7（浅色 success / warning、
     深色 neutral），够不到图形该有的 3:1。-fg 档在同一批底上最低 4.08，与 alert 的图标同档 */
  color: 'var(--xh-_tone-fg, var(--xh-fg-default))',
} as const

/** 徽记的圆底取中号字形尺寸；里面的字形四边各让出一个 space-1。 */
const BADGE_SIZE = 'var(--xh-glyph-size-md)'
const MARK_SIZE = 'calc(var(--xh-glyph-size-md) - 2 * var(--xh-space-1))'

const BADGE_STYLE = {
  display: 'grid',
  placeItems: 'center',
  flex: 'none',
  inlineSize: BADGE_SIZE,
  blockSize: BADGE_SIZE,
  borderRadius: 'var(--xh-shape-pill)',
  background: 'var(--xh-_tone-subtle, var(--xh-bg-muted))',
  color: 'var(--xh-_tone-fg, var(--xh-fg-default))',
} as const

/** 四种类型各取哪枚字形令牌；图形经 mask 着色，跟着徽记的前景色走。 */
const GLYPH_MARK: Record<string, string> = {
  info: '--xh-glyph-mark-info',
  success: '--xh-glyph-mark-check',
  warning: '--xh-glyph-mark-warning',
  error: '--xh-glyph-mark-close',
}

function markStyle(token: string): Record<string, string> {
  const image = `var(${token})`
  return {
    display: 'block',
    inlineSize: MARK_SIZE,
    blockSize: MARK_SIZE,
    backgroundColor: 'currentColor',
    WebkitMask: `${image} center / contain no-repeat`,
    mask: `${image} center / contain no-repeat`,
  }
}

/** 旋转的加载弧线；转动动画由外层容器（如 XhButtonIndicator）或自带样式提供。 */
export function spinArc(size = '1em'): VNode {
  return h('svg', {
    'viewBox': '0 0 16 16',
    'width': size,
    'height': size,
    'aria-hidden': 'true',
    'style': { display: 'block' },
  }, [
    h('circle', {
      'cx': 8,
      'cy': 8,
      'r': 6.5,
      'fill': 'none',
      'stroke': 'currentColor',
      'stroke-width': 2,
      'stroke-linecap': 'round',
      'stroke-dasharray': '30',
      'stroke-dashoffset': '22',
    }),
  ])
}

/** 解析 CSS 时长（"640ms" / "0.8s"）为毫秒，解析不出来给 0。 */
function parseDuration(value: string): number {
  const n = Number.parseFloat(value)
  if (!Number.isFinite(n))
    return 0
  return /s\s*$/.test(value) && !/ms\s*$/.test(value) ? n * 1000 : n
}

/**
 * 让徽记转起来。动画用 Web Animations 而不是 CSS 动画名：模板是内联样式渲染的，
 * 不归任何一份皮肤管，引用皮肤里的 @keyframes 名字时那份皮肤不一定在场。
 * 时长读 --xh-spin-duration 令牌；减弱动效时不转，静止的弧线仍读得出「还没好」。
 */
function spin(el: HTMLElement): void {
  if (typeof el.animate !== 'function' || resolveMotionPreference(el.ownerDocument?.defaultView ?? undefined) === 'reduce')
    return
  const duration = parseDuration(getComputedStyle(el).getPropertyValue('--xh-spin-duration'))
  if (duration <= 0)
    return
  el.animate([{ rotate: '0deg' }, { rotate: '360deg' }], { duration, iterations: Number.POSITIVE_INFINITY, easing: 'linear' })
}

/**
 * 状态字形：不带圆底的一枚字形，尺寸随宿主的 --xh-icon-size，颜色随语气。
 *
 * 与 typeBadge 的分工是体量：圆底徽记是给对话框那种有余裕的版面用的（眼下只剩它在用），
 * 排在一行短消息里会把行高顶起来，也让一句话的反馈看着像一则公告。
 */
export function typeGlyph(type: string | undefined): VNode | null {
  if (!type)
    return null
  if (type === 'loading') {
    // key 必须与下面那支不同：同为无 key 的 span 会被判成同一个节点就地复用，
    // 而转圈是 Web Animations 挂在元素上的，样式补丁不会把它收走——
    // loading 改写成 success 之后那枚勾号会一直转
    return h('span', {
      'key': 'spin',
      'style': GLYPH_STYLE,
      'aria-hidden': 'true',
      'onVnodeMounted': vnode => spin(vnode.el as HTMLElement),
    }, [spinArc('100%')])
  }
  const mark = GLYPH_MARK[type]
  if (!mark)
    return null
  const image = `var(${mark})`
  // 图案经 mask 着色，取的就是本元素的 color，不必再套一层内节点
  return h('span', {
    'key': 'mark',
    'style': {
      ...GLYPH_STYLE,
      backgroundColor: 'currentColor',
      WebkitMask: `${image} center / contain no-repeat`,
      mask: `${image} center / contain no-repeat`,
    },
    'aria-hidden': 'true',
  })
}

/** 类型徽记：圆底 + 字形；loading 给转圈弧线。 */
export function typeBadge(type: string | undefined): VNode | null {
  if (!type)
    return null
  if (type === 'loading') {
    // 两支的 key 必须不同，理由同 typeGlyph
    return h('span', {
      'key': 'spin',
      'style': BADGE_STYLE,
      'aria-hidden': 'true',
      'onVnodeMounted': vnode => spin(vnode.el as HTMLElement),
    }, [spinArc(MARK_SIZE)])
  }
  const mark = GLYPH_MARK[type]
  if (!mark)
    return null
  return h('span', { 'key': 'mark', 'style': BADGE_STYLE, 'aria-hidden': 'true' }, [h('span', { style: markStyle(mark) })])
}
