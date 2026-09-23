// 集合行的语气档：条目写 data-tone 才切到该族颜色，不写保持中性。
//
// 语气是「这一条命令自身动作的性质」——删除是 danger、停用是 warning——不是选中、当前、
// 校验结果或加载。所以这份钉住的是四件事：写了才生效、静息只换字、hover / 键盘高亮 / 按下
// 逐档换语气淡底、以及三条边界（选中与当前压过语气、disabled 压过一切、nav 语境不接语气）。
//
// 判据全部取计算样式，并且不写死颜色字面量：拿同一个语气下声明了 var(--xh-tone-fg) /
// var(--xh-tone-subtle) 的探针元素做对照，令牌调档时这份测试跟着走，不会变成一张过期的色表。
import { afterEach, describe, expect, it } from 'vitest'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let host: HTMLElement | null = null

afterEach(() => {
  host?.remove()
  host = null
})

interface RowOptions {
  /** 条目自己的语气；不写即中性档。 */
  tone?: string
  /** 家族语境，缺省 overlay（锚定浮层，菜单与下拉都在这一档）。 */
  context?: string
  /** 直接摊在条目上的状态标记，例如 data-highlighted、data-pressed。 */
  state?: string
}

/** 本次用例挂节点的容器；每行各自追加，同一条断言里的两行都得活着才比得了计算样式。 */
function container(): HTMLElement {
  if (!host) {
    host = document.createElement('div')
    document.body.append(host)
  }
  return host
}

/** 挂一行集合条目，返回它算出来的样式。 */
function row({ tone, context = 'overlay', state = '' }: RowOptions = {}): CSSStyleDeclaration {
  const wrap = document.createElement('div')
  wrap.innerHTML = `<div data-scope="menu" data-part="item" data-xh-collection-item data-xh-collection-size="md" data-xh-collection-context="${context}"${tone ? ` data-tone="${tone}"` : ''} ${state}>移到回收站</div>`
  const item = wrap.firstElementChild!
  container().append(item)
  return getComputedStyle(item)
}

/** 同一语气下的对照探针：语气层解出来的字色与两档淡底，用来免去写死颜色。 */
function probe(tone: string): { fg: string, subtle: string, subtleHover: string } {
  const el = document.createElement('div')
  el.dataset.tone = tone
  el.innerHTML = `<i style="color: var(--xh-tone-fg)"></i><i style="background-color: var(--xh-tone-subtle)"></i><i style="background-color: var(--xh-tone-subtle-hover)"></i>`
  document.body.append(el)
  const [fg, subtle, subtleHover] = [...el.children].map(child => getComputedStyle(child))
  const out = {
    fg: fg!.color,
    subtle: subtle!.backgroundColor,
    subtleHover: subtleHover!.backgroundColor,
  }
  el.remove()
  return out
}

const 透明 = 'rgba(0, 0, 0, 0)'

describe('集合行的语气', () => {
  it('不写 data-tone 的条目保持中性：字色与家族缺省一致', () => {
    const danger = probe('danger')
    expect(row().color).not.toBe(danger.fg)
  })

  it('静息只换字不换面：面仍是透明，字取 --xh-tone-fg', () => {
    const cs = row({ tone: 'danger' })
    expect(cs.backgroundColor).toBe(透明)
    expect(cs.color).toBe(probe('danger').fg)
  })

  it('键盘高亮换 12% 语气淡底，按下换 20%，两档不同色', () => {
    const { subtle, subtleHover } = probe('danger')
    expect(row({ tone: 'danger', state: 'data-highlighted' }).backgroundColor).toBe(subtle)
    expect(row({ tone: 'danger', state: 'data-pressed' }).backgroundColor).toBe(subtleHover)
    expect(subtle).not.toBe(subtleHover)
  })

  it('六个语气各自成色：字色两两不同，没有并到同一族去', () => {
    const fgs = ['brand', 'neutral', 'success', 'warning', 'danger', 'info']
      .map(tone => row({ tone }).color)
    expect(new Set(fgs).size).toBe(6)
  })

  it('选中压过语气：既选中又带 danger 的一条，面与不带语气的选中行一样', () => {
    const selected = row({ state: 'data-selected' })
    const both = row({ tone: 'danger', state: 'data-selected' })
    expect(both.backgroundColor).toBe(selected.backgroundColor)
    expect(both.color).toBe(selected.color)
  })

  it('disabled 压过一切：语气不把禁用行重新点亮', () => {
    const disabled = row({ state: 'aria-disabled="true"' })
    const both = row({ tone: 'danger', state: 'aria-disabled="true"' })
    expect(both.backgroundColor).toBe(disabled.backgroundColor)
    expect(both.color).toBe(disabled.color)
  })

  it('nav 语境不接语气：那里的条目表达位置而不是动作', () => {
    const plain = row({ context: 'nav' })
    const toned = row({ tone: 'danger', context: 'nav' })
    expect(toned.color).toBe(plain.color)
    expect(row({ tone: 'danger', context: 'nav', state: 'data-highlighted' }).backgroundColor)
      .toBe(row({ context: 'nav', state: 'data-highlighted' }).backgroundColor)
  })

  it('说明行不跟语气：一条里只有一种彩字', () => {
    const wrap = document.createElement('div')
    wrap.innerHTML = `<div data-scope="menu" data-part="item" data-xh-collection-item data-xh-collection-size="md" data-xh-collection-context="overlay" data-tone="danger"><span data-xh-collection-slot="text">移到回收站</span><span data-xh-collection-slot="description">不可恢复</span></div>`
    const item = wrap.firstElementChild!
    container().append(item)
    const [text, description] = [...item.children].map(child => getComputedStyle(child))
    expect(text!.color).toBe(probe('danger').fg)
    expect(description!.color).not.toBe(probe('danger').fg)
  })
})
