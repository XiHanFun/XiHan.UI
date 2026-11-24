// 选中又禁用的面：一个式子——选中面往承载面兑一半，仍看得出选的是哪一个、又一眼看出动不了。
//
// 品牌实心与品牌淡底各有一支语义令牌（--xh-bg-brand-disabled、--xh-bg-brand-subtle-disabled），
// 语气面取语气层的 --xh-_tone-disabled；面由形态或作者改写时按同一个式子兑。
// 此前各皮肤手写混色，兑的中性底有三种（淡底不透明档、承载面、已删的 muted），同一种状态三种长相。
import { afterEach, describe, expect, it } from 'vitest'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let host: HTMLElement | null = null

afterEach(() => {
  host?.remove()
  host = null
})

function node(scope: string, part: string, attrs = '', inner = ''): string {
  return `<div data-scope="${scope}" class="xh-scope-${scope}" data-part="${part}" ${attrs}>${inner}</div>`
}

/** 在 on 节点里挂一个探针，把某支槽或某个表达式解成颜色。 */
function resolve(on: Element, value: string): string {
  const probe = document.createElement('span')
  probe.style.backgroundColor = value
  on.append(probe)
  const color = getComputedStyle(probe).backgroundColor
  probe.remove()
  if (!color || color === 'rgba(0, 0, 0, 0)')
    throw new Error(`${value} 在此处解不出颜色`)
  return color
}

function mount(markup: string, selector: string): Element {
  host = document.createElement('div')
  host.innerHTML = markup
  document.body.append(host)
  return host.querySelector(selector)!
}

describe('选中又禁用的面', () => {
  it('toolbar：按下的条目禁用时取品牌实心的禁用档', () => {
    const item = mount(node('toolbar', 'item', 'aria-pressed="true"'), '[data-part="item"]')
    expect(resolve(item, 'var(--xh-action-bg-disabled)')).toBe(resolve(item, 'var(--xh-bg-brand-disabled)'))
  })

  it('toggle：按下又禁用取品牌实心的禁用档，写了语气取语气的禁用档', () => {
    const plain = mount(node('toggle', 'root', 'data-state="on"'), '[data-part="root"]')
    expect(resolve(plain, 'var(--xh-action-bg-disabled)')).toBe(resolve(plain, 'var(--xh-bg-brand-disabled)'))
    host!.remove()
    const toned = mount(node('toggle', 'root', 'data-state="on" data-tone="success"'), '[data-part="root"]')
    expect(resolve(toned, 'var(--xh-action-bg-disabled)')).toBe(resolve(toned, 'var(--xh-_tone-disabled)'))
  })

  it.each([
    ['image-cropper', node('image-cropper', 'flip-trigger', 'data-state="on"'), '[data-part="flip-trigger"]'],
    ['json-viewer', node('json-viewer', 'toolbar', '', '<button data-state="on"></button>'), 'button'],
  ])('%s：品牌淡底的开关禁用时取品牌淡底的禁用档', (_, markup, selector) => {
    const on = mount(markup, selector)
    expect(resolve(on, 'var(--xh-action-bg-disabled)')).toBe(resolve(on, 'var(--xh-bg-brand-subtle-disabled)'))
  })

  it('radio-group segmented：禁用的选中段，品牌档与语气档同一个式子', () => {
    const brand = mount(node('radio-group', 'root', 'data-variant="segmented"'), '[data-part="root"]')
    expect(resolve(brand, 'var(--xh-_radio-group-thumb-bg-disabled)')).toBe(resolve(brand, 'var(--xh-bg-brand-disabled)'))
    host!.remove()
    const toned = mount(node('radio-group', 'root', 'data-variant="segmented" data-tone="warning"'), '[data-part="root"]')
    expect(resolve(toned, 'var(--xh-_radio-group-thumb-bg-disabled)')).toBe(resolve(toned, 'var(--xh-_tone-disabled)'))
  })

  it.each(['solid', 'subtle', 'outline'])('toggle-group %s：选中段禁用时选中面往承载面兑一半', (variant) => {
    const item = mount(node('toggle-group', 'root', `data-variant="${variant}"`, node('toggle-group', 'item', 'data-state="on"')), '[data-part="item"]')
    expect(resolve(item, 'var(--xh-action-bg-disabled)')).toBe(resolve(item, 'color-mix(in oklab, var(--xh-_toggle-group-item-bg-on) 50%, var(--xh-bg-surface))'))
  })
})
