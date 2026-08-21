// 反馈服务默认模板用的装饰图形：类型徽记与加载弧线。
// 纯装饰（aria-hidden），读屏内容由标题与描述承担；配色取语气层继承下来的私有槽，
// 随宿主 data-tone 自动换族。徽记里的图形取 --xh-glyph-mark-* 令牌，与皮肤的兜底字形同一套。
import type { VNode } from 'vue'
import { h } from 'vue'

const BADGE_STYLE = {
  display: 'grid',
  placeItems: 'center',
  flex: 'none',
  inlineSize: '20px',
  blockSize: '20px',
  borderRadius: '999px',
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
    inlineSize: '12px',
    blockSize: '12px',
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

/** 类型徽记：圆底 + 字形；loading 给转圈弧线。 */
export function typeBadge(type: string | undefined): VNode | null {
  if (!type)
    return null
  if (type === 'loading') {
    return h('span', { 'style': { ...BADGE_STYLE, animation: 'xh-spin 0.8s linear infinite' }, 'aria-hidden': 'true' }, [spinArc('12px')])
  }
  const mark = GLYPH_MARK[type]
  if (!mark)
    return null
  return h('span', { 'style': BADGE_STYLE, 'aria-hidden': 'true' }, [h('span', { style: markStyle(mark) })])
}
