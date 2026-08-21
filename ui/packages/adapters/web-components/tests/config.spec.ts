// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { getXhConfig, setXhConfig, withXhConfig } from '../src/config'
import { defineXhElements } from '../src/define'

defineXhElements()

interface Updatable extends HTMLElement { updateComplete: Promise<unknown> }

async function mount(html: string): Promise<Updatable> {
  const host = document.createElement('div')
  host.innerHTML = html
  document.body.appendChild(host)
  const element = host.firstElementChild as Updatable
  await element.updateComplete
  await element.updateComplete
  return element
}

afterEach(() => {
  setXhConfig({})
  document.body.innerHTML = ''
})

describe('全局配置', () => {
  it('没配时原样返回，不新建对象', () => {
    const props = { translations: { close: '关' } }
    expect(withXhConfig('dialog', props)).toBe(props)
  })

  it('全局文案并进来', () => {
    setXhConfig({ translations: { dialog: { close: '关闭' } } })
    expect(withXhConfig('dialog', {})).toEqual({ translations: { close: '关闭' } })
  })

  it('元素上的逐键压过全局，没写的那些仍取全局', () => {
    setXhConfig({ translations: { pagination: { root: '分页', prevTrigger: '上一页', nextTrigger: '下一页' } } })
    const merged = withXhConfig('pagination', { translations: { nextTrigger: '下一顶' } })
    expect(merged.translations).toEqual({ root: '分页', prevTrigger: '上一页', nextTrigger: '下一顶' })
  })

  it('别的组件的文案不会串台', () => {
    setXhConfig({ translations: { dialog: { close: '关闭' } } })
    expect(withXhConfig('drawer', {})).toEqual({})
  })

  it('locale 元素上没给才取全局', () => {
    setXhConfig({ locale: 'zh-CN' })
    expect(withXhConfig('date-picker', { locale: undefined }).locale).toBe('zh-CN')
    expect(withXhConfig('date-picker', { locale: 'en-US' }).locale).toBe('en-US')
  })

  it('整份替换而不是深合并', () => {
    setXhConfig({ locale: 'zh-CN', translations: { dialog: { close: '关闭' } } })
    setXhConfig({ locale: 'en-US' })
    expect(getXhConfig()).toEqual({ locale: 'en-US' })
    expect(withXhConfig('dialog', {})).toEqual({})
  })
})

describe('<xh-config> 作用域', () => {
  async function mountTree(html: string): Promise<HTMLElement> {
    const host = document.createElement('div')
    host.innerHTML = html
    document.body.appendChild(host)
    for (const el of host.querySelectorAll('*')) {
      const updatable = el as Partial<Updatable>
      if (updatable.updateComplete) {
        await updatable.updateComplete
        await updatable.updateComplete
      }
    }
    return host
  }

  const dialog = `<xh-dialog default-open>
    <div data-xh-part="positioner"><div data-xh-part="content">
      <button data-xh-part="close-trigger">x</button>
    </div></div>
  </xh-dialog>`

  it('包住的子树取这一层的文案，外面的仍取全局', async () => {
    setXhConfig({ translations: { dialog: { close: '全局' } } })
    const host = await mountTree(`<div>${dialog}<xh-config id="scope">${dialog}</xh-config></div>`)
    const scope = host.querySelector('#scope') as HTMLElement & { translations?: unknown }
    scope.translations = { dialog: { close: '局部' } }
    const inside = scope.firstElementChild as Updatable
    await inside.updateComplete
    await inside.updateComplete

    const labels = [...host.querySelectorAll('[data-xh-part="close-trigger"]')]
      .map(el => el.getAttribute('aria-label'))
    expect(labels).toEqual(['全局', '局部'])
  })

  it('内层只写文案时，外层的 locale 仍然生效', () => {
    setXhConfig({})
    const host = document.createElement('div')
    host.innerHTML = '<xh-config id="outer"><xh-config id="inner"><span id="leaf"></span></xh-config></xh-config>'
    document.body.appendChild(host)
    const outer = host.querySelector('#outer') as HTMLElement & { locale?: string }
    const inner = host.querySelector('#inner') as HTMLElement & { translations?: unknown }
    outer.locale = 'en-US'
    inner.translations = { dialog: { close: '局部' } }

    const props = withXhConfig('dialog', { locale: undefined }, host.querySelector('#leaf'))
    expect(props.locale).toBe('en-US')
    expect((props as { translations?: unknown }).translations).toEqual({ close: '局部' })
  })

  it('不传节点时只看全局那份', () => {
    setXhConfig({ locale: 'zh-CN' })
    expect(withXhConfig('date-picker', { locale: undefined }).locale).toBe('zh-CN')
  })
})

describe('接到真元素上', () => {
  const html = `<xh-dialog default-open>
    <button data-xh-part="trigger">开</button>
    <div data-xh-part="positioner"><div data-xh-part="content">
      <button data-xh-part="close-trigger">x</button>
    </div></div>
  </xh-dialog>`

  it('元素上一个字不写，关闭钮的可及名字取全局文案', async () => {
    setXhConfig({ translations: { dialog: { close: '关闭' } } })
    const element = await mount(html)
    expect(element.querySelector('[data-xh-part="close-trigger"]')?.getAttribute('aria-label')).toBe('关闭')
  })

  it('不配全局时走组件内建默认', async () => {
    const element = await mount(html)
    expect(element.querySelector('[data-xh-part="close-trigger"]')?.getAttribute('aria-label')).toBe('Close')
  })

  it('切语言时已挂载的元素跟着重渲', async () => {
    setXhConfig({ translations: { dialog: { close: '关闭' } } })
    const element = await mount(html)
    const trigger = element.querySelector('[data-xh-part="close-trigger"]')
    expect(trigger?.getAttribute('aria-label')).toBe('关闭')

    setXhConfig({ translations: { dialog: { close: 'Close it' } } })
    await element.updateComplete
    await element.updateComplete
    expect(trigger?.getAttribute('aria-label')).toBe('Close it')
  })
})
