// @vitest-environment jsdom
// 全局配置注入的取值优先级：实例 props > provideXhConfig > 组件内建默认。
import type { XhConfig } from '../src'
import { getMotionOverride, setMotionOverride } from '@xihan-ui/motion'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, defineComponent, h, nextTick, ref } from 'vue'
import { provideXhConfig, XhBadge, XhBreadcrumbRoot, XhButton, XhEmptyStateRoot, XhSpinner, XhTimestamp } from '../src'

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
  document.body.innerHTML = ''
  setMotionOverride(null)
})

describe('provideXhConfig · motion', () => {
  it('七轴绑定投影到显式 root，局部 motion 不改全局 override', () => {
    const scope = document.createElement('section')
    document.body.append(scope)
    setMotionOverride('no-preference')
    mount(() => {
      provideXhConfig({
        visualEnvironment: {
          root: scope,
          initial: {
            mode: 'dark',
            density: 'compact',
            dir: 'rtl',
            contrast: 'more',
            motion: 'reduce',
            transparency: 'reduce',
          },
        },
      })
      return () => h('div')
    })
    expect(scope.getAttribute('data-theme')).toBe('dark')
    expect(scope.getAttribute('data-density')).toBe('compact')
    expect(scope.getAttribute('data-motion')).toBe('reduce')
    expect(scope.getAttribute('data-transparency')).toBe('reduce')
    expect(getMotionOverride()).toBe('no-preference')
  })

  it('没有视觉绑定时不碰别处设好的 override', () => {
    setMotionOverride('reduce')
    mount(() => {
      provideXhConfig({ locale: 'en' })
      return () => h('div')
    })
    expect(getMotionOverride()).toBe('reduce')
  })

  it('配置是 ref 时七轴一起重投影', async () => {
    const scope = document.createElement('section')
    document.body.append(scope)
    const config = ref<XhConfig>({
      visualEnvironment: { root: scope, initial: { mode: 'dark' as const, motion: 'reduce' as const } },
    })
    mount(() => {
      provideXhConfig(config)
      return () => h('div')
    })
    expect(scope.getAttribute('data-theme')).toBe('dark')
    config.value = {
      visualEnvironment: { root: scope, initial: { mode: 'light' as const, motion: 'default' as const } },
    }
    await nextTick()
    expect(scope.getAttribute('data-theme')).toBe('light')
    expect(scope.getAttribute('data-motion')).toBe('default')
  })
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
        return () => [h(XhBreadcrumbRoot, () => '首页'), h(XhTimestamp, { value, type: 'date' })]
      },
    })
    const host = mount(() => {
      provideXhConfig({ locale: 'en' })
      return () => h(Inner)
    })
    expect(host.querySelector('nav')?.getAttribute('aria-label')).toBe('面包屑')
    // 外层给的 en 是 MM/DD/YYYY；被整份遮蔽的话这里会退回组件内建默认
    expect(host.querySelector('[data-scope="timestamp"]')?.textContent).toContain('/')
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
    expect(host.querySelector('#global [data-scope="badge"][data-part="indicator"]')?.getAttribute('data-size')).toBe('lg')
    expect(host.querySelector('#own [data-scope="badge"][data-part="indicator"]')?.getAttribute('data-size')).toBe('sm')
  })

  it('不跑机器的组件也吃全局尺寸档，全局值是 ref 时切换即重渲', async () => {
    const config = ref<{ size: 'lg' | 'sm' }>({ size: 'lg' })
    const host = mount(() => {
      provideXhConfig(config)
      return () => [
        h(XhButton, () => '去'),
        h(XhEmptyStateRoot, () => '空'),
      ]
    })
    const sizes = (): Array<string | null> => ['button', 'empty-state']
      .map(scope => host.querySelector(`[data-scope="${scope}"]`)?.getAttribute('data-size') ?? null)
    expect(sizes()).toEqual(['lg', 'lg'])
    config.value = { size: 'sm' }
    await nextTick()
    expect(sizes()).toEqual(['sm', 'sm'])
  })
})

describe('provideXhConfig · locale', () => {
  const value = '2026-08-12T00:00:00Z'

  it('locale 全局回落、实例胜出', () => {
    const host = mount(() => {
      provideXhConfig({ locale: 'en' })
      return () => [
        h('div', { id: 'global' }, [h(XhTimestamp, { value, type: 'date' })]),
        h('div', { id: 'own' }, [h(XhTimestamp, { value, type: 'date', locale: 'zh-CN' })]),
      ]
    })
    // en 是 MM/DD/YYYY，zh-CN 是 YYYY-MM-DD
    expect(host.querySelector('#global')?.textContent).toContain('/')
    expect(host.querySelector('#own')?.textContent).toContain('-')
  })
})
