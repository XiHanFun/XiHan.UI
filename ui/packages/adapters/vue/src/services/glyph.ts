// 反馈服务默认模板用的装饰图形：类型徽记与加载弧线。
// 纯装饰（aria-hidden），读屏内容由标题与描述承担；配色取语气层继承下来的私有槽，
// 随宿主 data-tone 自动换族。徽记里的图形取 --xh-glyph-mark-* 令牌，与皮肤的兜底字形同一套。
import type { VNode } from 'vue'
import { resolveMotionPreference } from '@xihan-ui/motion'
import { h } from 'vue'

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

/** 类型徽记：圆底 + 字形；loading 给转圈弧线。 */
export function typeBadge(type: string | undefined): VNode | null {
  if (!type)
    return null
  if (type === 'loading') {
    return h('span', {
      'style': BADGE_STYLE,
      'aria-hidden': 'true',
      'onVnodeMounted': vnode => spin(vnode.el as HTMLElement),
    }, [spinArc(MARK_SIZE)])
  }
  const mark = GLYPH_MARK[type]
  if (!mark)
    return null
  return h('span', { 'style': BADGE_STYLE, 'aria-hidden': 'true' }, [h('span', { style: markStyle(mark) })])
}
