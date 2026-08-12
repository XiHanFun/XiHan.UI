// @vitest-environment jsdom
// 全局配置注入的取值优先级：实例 props > provideXhConfig > 组件内建默认。
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, defineComponent, h, nextTick, ref } from 'vue'
import { provideXhConfig, XhBreadcrumbRoot, XhSpinner, XhTime } from '../src'

let mounted: Array<() => void> = []

function mount(setup: () => () => unknown): HTMLElement {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const app = createApp(defineComponent({ setup }))
  app.mount(host)
  mounted.push(() => {
    app.unmount()
    host.remove()
  })
  return host
}

afterEach(() => {
  for (const un of mounted) un()
  mounted = []
})

describe('provideXhConfig · translations', () => {
  it('不注入时用组件内建默认（英文）', () => {
    const host = mount(() => () => h(XhBreadcrumbRoot, () => '首页'))
    expect(host.querySelector('nav')?.getAttribute('aria-label')).toBe('Breadcrumb')
  })

  it('全局注入生效', () => {
    const host = mount(() => {
      provideXhConfig({ translations: { breadcrumb: { root: '面包屑' } } })
      return () => h(XhBreadcrumbRoot, () => '首页')
    })
    expect(host.querySelector('nav')?.getAttribute('aria-label')).toBe('面包屑')
  })

  it('实例 props 压过全局注入', () => {
    const host = mount(() => {
      provideXhConfig({ translations: { breadcrumb: { root: '面包屑' } } })
      return () => h(XhBreadcrumbRoot, { translations: { root: '路径' } }, () => '首页')
    })
    expect(host.querySelector('nav')?.getAttribute('aria-label')).toBe('路径')
  })

  it('全局值是 ref 时切换即重渲', async () => {
    const config = ref({ translations: { spinner: { label: 'Loading' } } })
    const host = mount(() => {
      provideXhConfig(config)
      return () => h(XhSpinner)
    })
    const root = (): Element | null => host.querySelector('[data-scope="spinner"]')
    expect(root()?.getAttribute('aria-label')).toBe('Loading')
    config.value = { translations: { spinner: { label: '加载中' } } }
    await nextTick()
    expect(root()?.getAttribute('aria-label')).toBe('加载中')
  })
})

describe('provideXhConfig · locale', () => {
  const value = '2026-08-12T00:00:00Z'

  it('locale 全局回落、实例胜出', () => {
    const host = mount(() => {
      provideXhConfig({ locale: 'en' })
      return () => [
        h('div', { id: 'global' }, [h(XhTime, { value, type: 'date' })]),
        h('div', { id: 'own' }, [h(XhTime, { value, type: 'date', locale: 'zh-CN' })]),
      ]
    })
    // en 是 MM/DD/YYYY，zh-CN 是 YYYY-MM-DD
    expect(host.querySelector('#global')?.textContent).toContain('/')
    expect(host.querySelector('#own')?.textContent).toContain('-')
  })
})
