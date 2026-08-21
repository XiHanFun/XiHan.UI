// @vitest-environment jsdom
// 全局配置注入的取值优先级：实例 props > provideXhConfig > 组件内建默认。
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, defineComponent, h, nextTick, ref } from 'vue'
import { provideXhConfig, XhBadge, XhBreadcrumbRoot, XhSpinner, XhTime } from '../src'

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

describe('provideXhConfig · 嵌套', () => {
  it('内层只写文案时，外层的 locale 仍然生效', () => {
    const value = '2026-08-12T00:00:00Z'
    const Inner = defineComponent({
      setup() {
        provideXhConfig({ translations: { breadcrumb: { root: '面包屑' } } })
        return () => [h(XhBreadcrumbRoot, () => '首页'), h(XhTime, { value, type: 'date' })]
      },
    })
    const host = mount(() => {
      provideXhConfig({ locale: 'en' })
      return () => h(Inner)
    })
    expect(host.querySelector('nav')?.getAttribute('aria-label')).toBe('面包屑')
    // 外层给的 en 是 MM/DD/YYYY；被整份遮蔽的话这里会退回组件内建默认
    expect(host.querySelector('[data-scope="time"]')?.textContent).toContain('/')
  })

  it('内层同名键压过外层，同一组件的其余文案键仍从外层继承', () => {
    const Inner = defineComponent({
      setup() {
        provideXhConfig({ translations: { spinner: { label: '加载中' } } })
        return () => [h(XhSpinner), h(XhBreadcrumbRoot, () => '首页')]
      },
    })
    const host = mount(() => {
      provideXhConfig({ translations: { spinner: { label: 'Loading' }, breadcrumb: { root: '面包屑' } } })
      return () => h(Inner)
    })
    expect(host.querySelector('[data-scope="spinner"]')?.getAttribute('aria-label')).toBe('加载中')
    expect(host.querySelector('nav')?.getAttribute('aria-label')).toBe('面包屑')
  })
})

describe('provideXhConfig · size', () => {
  it('全局尺寸档落到组件上，实例写了的以实例为准', () => {
    const host = mount(() => {
      provideXhConfig({ size: 'lg' })
      return () => [
        h('div', { id: 'global' }, [h(XhBadge, () => '9')]),
        h('div', { id: 'own' }, [h(XhBadge, { size: 'sm' }, () => '9')]),
      ]
    })
    expect(host.querySelector('#global [data-scope="badge"]')?.getAttribute('data-size')).toBe('lg')
    expect(host.querySelector('#own [data-scope="badge"]')?.getAttribute('data-size')).toBe('sm')
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
