// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { normalizeAttrs } from './normalize'

function el(html: string): HTMLElement {
  const d = document.createElement('div')
  d.innerHTML = html
  return d.firstElementChild as HTMLElement
}

describe('normalizeAttrs', () => {
  it('id → @self，抹掉适配器噪音与结构标记，保留 aria-/data- 状态', () => {
    const e = el('<div id="x1" data-scope="dialog" data-part="content" data-v-1a2b3c4d role="dialog" aria-modal="true" data-state="open"></div>')
    const attrs = normalizeAttrs(e, new Map())
    expect(attrs.id).toBe('@self')
    expect(attrs.role).toBe('dialog')
    expect(attrs['aria-modal']).toBe('true')
    expect(attrs['data-state']).toBe('open')
    expect('data-scope' in attrs).toBe(false)
    expect('data-part' in attrs).toBe(false)
    expect('data-v-1a2b3c4d' in attrs).toBe(false)
  })

  it('缺失的结构属性显式为 null', () => {
    const e = el('<button type="button"></button>')
    const attrs = normalizeAttrs(e, new Map())
    expect(attrs.type).toBe('button')
    expect(attrs.role).toBeNull()
    expect(attrs.tabindex).toBeNull()
  })

  it('iDREF 值翻译成 @part(...)，指向组件外时保留 @extern', () => {
    const title = el('<h2 id="t1" data-scope="dialog" data-part="title"></h2>')
    const content = el('<div data-scope="dialog" data-part="content" aria-labelledby="t1" aria-describedby="外部"></div>')
    const buckets = new Map([['title', [title]], ['content', [content]]])
    const attrs = normalizeAttrs(content, buckets)
    expect(attrs['aria-labelledby']).toBe('@part(title)')
    expect(attrs['aria-describedby']).toBe('@extern(外部)')
  })

  it('集合类 part 的 IDREF 带下标', () => {
    const i0 = el('<li id="o0" data-scope="menu" data-part="item"></li>')
    const i1 = el('<li id="o1" data-scope="menu" data-part="item"></li>')
    const trigger = el('<div data-scope="menu" data-part="trigger" aria-activedescendant="o1"></div>')
    const buckets = new Map([['item', [i0, i1]], ['trigger', [trigger]]])
    const attrs = normalizeAttrs(trigger, buckets)
    expect(attrs['aria-activedescendant']).toBe('@part(item[1])')
  })
})
