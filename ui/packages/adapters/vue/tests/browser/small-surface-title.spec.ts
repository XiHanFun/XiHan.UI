// 浮层内与小面标题（14 / medium）：紧凑行距（--xh-leading-tight），字取所在面的前景。
//
// 这一档标题多是一行，正文行距（1.5）会让标题和下面的说明之间空出一截；有的写了、有的不写（继承宿主），
// 同一副气泡换个页面就高矮不一。frosted 浮层上的标题取材质前景：强制色与高对比度档下它会换成系统色，
// 写死 --xh-fg-default 的那一家就跟不过去。
// 面内说明（13 / muted）取正文行距：Dialog、Drawer 此前没写，随宿主走。
import { afterEach, describe, expect, it } from 'vitest'
import { tokenLength, tokenValue } from './design-token'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

/** 小面标题：scope → [部件名, 所在面的前景令牌]。 */
const TITLES: Record<string, [string, string]> = {
  'popover': ['title', '--xh-material-frosted-fg'],
  'popconfirm': ['title', '--xh-material-frosted-fg'],
  'hover-card': ['title', '--xh-material-frosted-fg'],
  'floating-panel': ['title', '--xh-material-frosted-fg'],
  'approval': ['title', '--xh-fg-default'],
  'empty-state': ['title', '--xh-fg-default'],
  'citation': ['preview-title', '--xh-fg-default'],
}

let host: HTMLElement | null = null

afterEach(() => {
  host?.remove()
  host = null
})

/** 行高令牌是无单位的倍数：直接读声明值，不经探针（探针会按它自己的字号算成像素）。 */
function leading(token: string): number {
  const value = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue(token))
  if (Number.isNaN(value))
    throw new Error(`读不到 ${token}`)
  return value
}

function mount(scope: string, part: string): CSSStyleDeclaration {
  host = document.createElement('div')
  const node = `<div data-scope="${scope}" class="xh-scope-${scope}" data-part="${part}">同步设置</div>`
  // EmptyState 的标题字号由 root 上的尺寸档私有槽给，要包在 root 里
  host.innerHTML = scope === 'empty-state' ? `<div data-scope="empty-state" class="xh-scope-empty-state" data-part="root">${node}</div>` : node
  document.body.append(host)
  return getComputedStyle(host.querySelector(`[data-part="${part}"]`)!)
}

describe('浮层内与小面标题', () => {
  it.each(Object.entries(TITLES))('%s：14px 中等字重、紧凑行距、所在面的前景', (scope, [part, fg]) => {
    const style = mount(scope, part)
    const size = tokenLength('--xh-text-label-size')
    expect(style.fontSize).toBe(`${size}px`)
    expect(style.fontWeight).toBe(tokenValue('font-weight', '--xh-font-weight-medium'))
    expect(Number.parseFloat(style.lineHeight)).toBeCloseTo(size * leading('--xh-leading-tight'), 2)
    expect(style.color).toBe(tokenValue('color', fg))
  })

  it('empty-state：lg 档标题升到区块标题，行高跟着取区块标题那一支', () => {
    host = document.createElement('div')
    host.innerHTML = '<div data-scope="empty-state" class="xh-scope-empty-state" data-part="root" data-size="lg"><div data-scope="empty-state" class="xh-scope-empty-state" data-part="title">没有数据</div></div>'
    document.body.append(host)
    const style = getComputedStyle(host.querySelector('[data-part="title"]')!)
    const size = tokenLength('--xh-text-heading-3-size')
    expect(style.fontSize).toBe(`${size}px`)
    expect(Number.parseFloat(style.lineHeight)).toBeCloseTo(size * leading('--xh-text-heading-3-leading'), 2)
  })
})

describe('面内说明', () => {
  it.each(['dialog', 'drawer'])('%s：13px 次要字色，正文行距', (scope) => {
    const style = mount(scope, 'description')
    const size = tokenLength('--xh-text-secondary-size')
    expect(style.fontSize).toBe(`${size}px`)
    expect(Number.parseFloat(style.lineHeight)).toBeCloseTo(size * leading('--xh-leading-normal'), 2)
  })
})
