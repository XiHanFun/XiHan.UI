// Action Control 上的 neutral 语气与不写等价（设计真源 §7.2 第 2 条）：中性就是缺省面，
// 非实心形态不另铺 neutral 淡底、不换深色描边，同一个次要动作只有一副长相。
//
// 钉住五件事：写在控件自己身上等价、写在组类根上由条目继承也等价、按下态同样等价，
// 以及三条边界——实心底仍是中性那一族（不退成品牌实心）、条目自己另写的语气照常生效、
// 不是 Action Control 的语气面（Tag、Alert 一类）neutral 仍取淡底。判据取计算样式，不写死颜色。
import { afterEach, describe, expect, it } from 'vitest'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let host: HTMLElement | null = null

afterEach(() => {
  host?.remove()
  host = null
})

function mount(html: string): HTMLElement {
  host ??= document.body.appendChild(document.createElement('div'))
  const wrap = document.createElement('div')
  wrap.innerHTML = html
  const node = wrap.firstElementChild as HTMLElement
  host.append(node)
  return node
}

interface ControlOptions {
  variant: 'solid' | 'subtle' | 'outline' | 'ghost'
  tone?: string
  state?: string
}

function control({ variant, tone, state = '' }: ControlOptions): string {
  return `<button type="button" data-scope="button" data-part="root" data-xh-action-control data-xh-action-variant="${variant}" data-xh-action-size="md" data-xh-action-profile="text"${tone ? ` data-tone="${tone}"` : ''} ${state}>保存</button>`
}

/** 面上三件：底、描边、字色。 */
function face(el: Element): [string, string, string] {
  const style = getComputedStyle(el)
  return [style.backgroundColor, style.borderTopColor, style.color]
}

describe('action Control 上的 neutral 语气', () => {
  it.each(['subtle', 'outline', 'ghost'] as const)('%s：写在控件自己身上与不写同一副面', (variant) => {
    const plain = face(mount(control({ variant })))
    const neutral = face(mount(control({ variant, tone: 'neutral' })))
    expect(neutral).toEqual(plain)
  })

  it.each(['subtle', 'outline', 'ghost'] as const)('%s：按下态同样等价', (variant) => {
    const plain = face(mount(control({ variant, state: 'data-pressed' })))
    const neutral = face(mount(control({ variant, tone: 'neutral', state: 'data-pressed' })))
    expect(neutral).toEqual(plain)
  })

  it.each(['subtle', 'outline', 'ghost'] as const)('%s：写在组类根上、条目继承，也与不写同一副面', (variant) => {
    const plain = face(mount(control({ variant })))
    const group = mount(`<div data-scope="toggle-group" data-part="root" data-tone="neutral">${control({ variant })}</div>`)
    expect(face(group.firstElementChild!)).toEqual(plain)
  })

  it('实心底仍是中性那一族，不退成缺省的品牌实心', () => {
    const brand = face(mount(control({ variant: 'solid' })))
    const neutral = mount(control({ variant: 'solid', tone: 'neutral' }))
    const probe = mount('<i data-tone="neutral" style="background-color: var(--xh-tone-solid)"></i>')
    expect(face(neutral)[0]).not.toBe(brand[0])
    expect(face(neutral)[0]).toBe(getComputedStyle(probe).backgroundColor)
  })

  it('中性组里条目自己另写的语气照常生效', () => {
    const plain = face(mount(control({ variant: 'outline' })))
    const group = mount(`<div data-scope="toggle-group" data-part="root" data-tone="neutral">${control({ variant: 'outline', tone: 'danger' })}</div>`)
    const danger = face(mount(control({ variant: 'outline', tone: 'danger' })))
    expect(face(group.firstElementChild!)).toEqual(danger)
    expect(danger).not.toEqual(plain)
  })

  it('不是 Action Control 的语气面，neutral 仍取淡底', () => {
    const tag = mount('<span data-tone="neutral" style="background-color: var(--xh-tone-subtle)">标签</span>')
    expect(getComputedStyle(tag).backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
  })
})
