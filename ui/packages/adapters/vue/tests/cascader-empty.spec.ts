// @vitest-environment jsdom
// cascader 空态：collection 为空时 content 标 data-empty、空态占位露面；
// 文案默认英文，可被实例 translations 或全局注入覆盖，empty 插槽整个换内容。
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, defineComponent, h, nextTick } from 'vue'
import {
  provideXhConfig,
  XhCascaderContent,
  XhCascaderLoading,
  XhCascaderPositioner,
  XhCascaderRoot,
  XhCascaderTrigger,
} from '../src'

async function tick(): Promise<void> {
  await nextTick()
  await nextTick()
  await new Promise(r => setTimeout(r, 0))
  await nextTick()
}

let cleanup: Array<() => void> = []

afterEach(() => {
  for (const fn of cleanup) fn()
  cleanup = []
  document.body.innerHTML = ''
})

interface MountOptions {
  props?: Record<string, unknown>
  emptySlot?: () => ReturnType<typeof h>
  loadingSlot?: () => ReturnType<typeof h>
  wrapLoading?: boolean
  config?: Parameters<typeof provideXhConfig>[0]
}

const BusinessLoadingWrapper = defineComponent({
  name: 'BusinessLoadingWrapper',
  setup(_, { slots }) {
    return () => h('section', { class: 'business-loading-wrapper' }, slots.default?.())
  },
})

function mountCascader({ props = {}, emptySlot, loadingSlot, wrapLoading, config }: MountOptions = {}): void {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const app = createApp({
    setup: () => {
      if (config)
        provideXhConfig(config)
      return () =>
        h(XhCascaderRoot, { collection: [], defaultOpen: true, ...props }, () => [
          h(XhCascaderTrigger),
          h(XhCascaderPositioner, null, () => [
            h(XhCascaderContent, null, {
              default: () => loadingSlot
                ? [wrapLoading
                    ? h(BusinessLoadingWrapper, null, () => h(XhCascaderLoading, null, loadingSlot))
                    : h(XhCascaderLoading, null, loadingSlot)]
                : [],
              ...(emptySlot ? { empty: emptySlot } : {}),
            }),
          ]),
        ])
    },
  })
  app.mount(host)
  cleanup.push(() => {
    app.unmount()
    host.remove()
  })
}

function el(selector: string): HTMLElement {
  const hit = document.querySelector<HTMLElement>(selector)
  if (!hit)
    throw new Error(`找不到 ${selector}`)
  return hit
}

const CONTENT = '[data-scope="cascader"][data-part="content"]'
const EMPTY = '[data-scope="cascader"][data-part="empty"]'
const LOADING = '[data-scope="cascader"][data-part="loading"]'

describe('cascader 空态', () => {
  it('collection 为空：content 标 data-empty，占位露面并给缺省文案', async () => {
    mountCascader()
    await tick()
    expect(el(CONTENT).getAttribute('data-empty')).toBe('')
    const empty = el(EMPTY)
    expect(empty.hasAttribute('hidden')).toBe(false)
    expect(empty.textContent).toBe('No data')
  })

  it('有数据时占位收着，content 不标 data-empty', async () => {
    mountCascader({ props: { collection: [{ value: 'a', label: '甲' }] } })
    await tick()
    expect(el(CONTENT).hasAttribute('data-empty')).toBe(false)
    expect(el(EMPTY).hasAttribute('hidden')).toBe(true)
  })

  it('首次加载自动装配唯一 Loading，使用 Cascader 翻译且 Empty 让位', async () => {
    mountCascader({ props: { loading: true, translations: { loading: '正在加载地区' } } })
    await tick()
    const loadings = document.querySelectorAll<HTMLElement>(LOADING)
    expect(loadings).toHaveLength(1)
    expect(loadings[0]!.textContent).toBe('正在加载地区')
    expect(loadings[0]!.getAttribute('role')).toBe('status')
    expect(loadings[0]!.hasAttribute('hidden')).toBe(false)
    expect(el(EMPTY).hasAttribute('hidden')).toBe(true)
    expect(el(CONTENT).getAttribute('aria-busy')).toBe('true')
  })

  it('作者显式 Loading 时不重复生成，作者内容优先于默认翻译', async () => {
    mountCascader({
      props: { loading: true, translations: { loading: '默认加载文案' } },
      loadingSlot: () => h('span', { class: 'custom-loading' }, '按作者方式读取'),
      wrapLoading: true,
    })
    await tick()
    expect(document.querySelectorAll(LOADING)).toHaveLength(1)
    expect(el(`${LOADING} .custom-loading`).textContent).toBe('按作者方式读取')
  })

  it('实例 translations 覆盖文案', async () => {
    mountCascader({ props: { translations: { empty: '暂无数据' } } })
    await tick()
    expect(el(EMPTY).textContent).toBe('暂无数据')
  })

  it('全局注入兜底文案，实例没给时生效', async () => {
    mountCascader({ config: { translations: { cascader: { empty: '没有可选项' } } } })
    await tick()
    expect(el(EMPTY).textContent).toBe('没有可选项')
  })

  it('empty 插槽整个换内容', async () => {
    mountCascader({ emptySlot: () => h('span', { class: 'custom-empty' }, '自定义空态') })
    await tick()
    expect(el(`${EMPTY} .custom-empty`).textContent).toBe('自定义空态')
  })
})
