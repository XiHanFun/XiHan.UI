// 网格列表的两种等待：还没有行时 loading 占位画一枚加载环排在文案之前；已有行时重新取数保留上一帧，
// 行按 micro 淡到禁用透明度，不是一刀切过去；数据到了再淡回。环的几何与转、行的淡变都得在真实浏览器里量。
import type { App, Ref } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import {
  XhGridListEmpty,
  XhGridListLoading,
  XhGridListRoot,
  XhGridListRow,
  XhGridListRowContent,
  XhGridListRowText,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

function part(name: string): HTMLElement {
  const el = host?.querySelector<HTMLElement>(`[data-scope='grid-list'][data-part='${name}']`)
  if (!el)
    throw new Error(`找不到 grid-list/${name}`)
  return el
}

function token(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

/** 把长度令牌在宿主里解析成像素值。 */
function resolveLength(element: Element, name: string): string {
  const probe = document.createElement('span')
  probe.style.display = 'block'
  probe.style.paddingTop = `var(${name})`
  element.append(probe)
  const value = getComputedStyle(probe).paddingTop
  probe.remove()
  return value
}

function resolveColor(element: Element, value: string): string {
  const probe = document.createElement('span')
  probe.style.color = value
  element.append(probe)
  const color = getComputedStyle(probe).color
  probe.remove()
  return color
}

async function mount(loading: Ref<boolean>, values: Ref<string[]>): Promise<void> {
  host = document.createElement('div')
  host.style.inlineSize = '320px'
  document.body.append(host)
  app = createApp({
    render: () => h(XhGridListRoot, { collection: values.value.map(value => ({ value, label: value })), loading: loading.value }, () => [
      ...values.value.map(value => h(XhGridListRow, { key: value, value }, () => h(XhGridListRowContent, null, () => h(XhGridListRowText, null, () => value)))),
      h(XhGridListLoading, null, () => '正在加载…'),
      h(XhGridListEmpty, null, () => '没有记录'),
    ]),
  })
  app.mount(host)
  await nextTick()
}

describe('grid-list 加载态', () => {
  it('还没有行、正在取：loading 占位画一枚加载环排在文案之前，环径取图标档、在转；文案取次要文字色与条目同档字号', async () => {
    await mount(ref(true), ref([]))
    const loading = part('loading')
    expect(loading.hidden).toBe(false)
    expect(loading.hasAttribute('data-xh-loading-ring')).toBe(true)
    expect(loading.hasAttribute('data-loading')).toBe(true)

    const style = getComputedStyle(loading)
    expect(style.flexDirection).toBe('row')
    expect(style.color).toBe(resolveColor(loading, 'var(--xh-fg-muted)'))
    expect(style.fontSize).toBe(resolveLength(host!, '--xh-control-font-md'))
    expect(style.paddingTop).toBe(resolveLength(host!, '--xh-space-3'))

    const ring = getComputedStyle(loading, '::before')
    expect(ring.width).toBe(token('--xh-glyph-size-md'))
    expect(ring.borderTopLeftRadius).toBe('50%')
    expect(ring.animationName).toBe('xh-spin')
    expect(ring.animationPlayState).toBe('running')
  })

  it('已有行时重新取数：占位不出现，行保留上一帧按 micro 淡到禁用透明度，取完再淡回', async () => {
    const loading = ref(false)
    await mount(loading, ref(['a', 'b']))
    const row = host!.querySelector<HTMLElement>(`[data-scope='grid-list'][data-part='row']`)!
    expect(getComputedStyle(row).transitionProperty).toContain('opacity')

    loading.value = true
    await nextTick()
    expect(part('loading').hidden).toBe(true)
    // 起淡那一刻还没到终值：淡变，不是一刀切
    expect(getComputedStyle(row).opacity).not.toBe(token('--xh-state-disabled-opacity'))
    await expect.poll(() => getComputedStyle(row).opacity).toBe(token('--xh-state-disabled-opacity'))

    loading.value = false
    await nextTick()
    await expect.poll(() => getComputedStyle(row).opacity).toBe('1')
  })
})
