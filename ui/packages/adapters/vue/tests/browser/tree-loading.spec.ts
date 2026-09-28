// 树的两种等待：还没有节点、正在取时 loading 占位画一枚加载环排在文案之前（与 Table、GridList 同一种占位）；
// 已有节点时重新取数不换成占位，行保留上一帧、按 micro 淡到禁用透明度，数据到了再淡回，树框本身不淡。
// 节点级的 loadingValue 另走展开箭头换转圈，不在这里。环的几何、转与停、行的淡变都得在真实浏览器里量。
import type { App, Ref } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import {
  XhTreeEmpty,
  XhTreeItem,
  XhTreeItemText,
  XhTreeLoading,
  XhTreeRoot,
  XhTreeTree,
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
  const el = host?.querySelector<HTMLElement>(`[data-scope='tree'][data-part='${name}']`)
  if (!el)
    throw new Error(`缺少 tree 部件：${name}`)
  return el
}

function token(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

/** 在宿主里把长度令牌解析成像素。 */
function px(name: string): string {
  const probe = document.createElement('span')
  probe.style.display = 'block'
  probe.style.paddingTop = `var(${name})`
  host!.append(probe)
  const value = getComputedStyle(probe).paddingTop
  probe.remove()
  return value
}

function color(value: string): string {
  const probe = document.createElement('span')
  probe.style.color = value
  host!.append(probe)
  const resolved = getComputedStyle(probe).color
  probe.remove()
  return resolved
}

async function mount(loading: Ref<boolean>, values: Ref<string[]>): Promise<void> {
  host = document.createElement('div')
  host.style.inlineSize = '320px'
  document.body.append(host)
  app = createApp({
    render: () => h(XhTreeRoot, { collection: values.value.map(value => ({ value, label: value })), loading: loading.value }, () => [
      h(XhTreeTree, null, () => values.value.map(value => h(XhTreeItem, { key: value, value }, () => h(XhTreeItemText, null, () => value)))),
      h(XhTreeLoading, null, () => '正在加载…'),
      h(XhTreeEmpty, null, () => '没有节点'),
    ]),
  })
  app.mount(host)
  await nextTick()
}

describe('tree 加载态', () => {
  it('还没有节点、正在取：loading 占位画一枚加载环排在文案之前；文案与条目同档字号、次要文字色', async () => {
    await mount(ref(true), ref([]))
    const loading = part('loading')
    expect(loading.hidden).toBe(false)
    expect(loading.hasAttribute('data-xh-loading-ring')).toBe(true)
    expect(loading.hasAttribute('data-loading')).toBe(true)

    const style = getComputedStyle(loading)
    expect(style.display).toBe('flex')
    expect(style.color).toBe(color('var(--xh-fg-muted)'))
    expect(style.fontSize).toBe(px('--xh-control-font-md'))
    expect(style.paddingTop).toBe(px('--xh-space-3'))
    expect(style.columnGap).toBe(px('--xh-control-gap-md'))

    const ring = getComputedStyle(loading, '::before')
    expect(ring.width).toBe(token('--xh-glyph-size-md'))
    expect(ring.borderTopLeftRadius).toBe('50%')
    expect(ring.animationName).toBe('xh-spin')
    expect(ring.animationPlayState).toBe('running')
  })

  it('已有节点时重新取数：占位不出现，行按 micro 淡到禁用透明度、树框不淡，取完淡回', async () => {
    const loading = ref(false)
    await mount(loading, ref(['a', 'b']))
    const tree = part('tree')
    const row = part('item')
    expect(getComputedStyle(row).transitionProperty).toContain('opacity')

    loading.value = true
    await nextTick()
    expect(part('loading').hidden).toBe(true)
    expect(getComputedStyle(row).opacity).not.toBe(token('--xh-state-disabled-opacity'))
    await expect.poll(() => getComputedStyle(row).opacity).toBe(token('--xh-state-disabled-opacity'))
    expect(getComputedStyle(tree).opacity).toBe('1')

    loading.value = false
    await nextTick()
    await expect.poll(() => getComputedStyle(row).opacity).toBe('1')
  })

  it('空态与加载态同一副排版', async () => {
    await mount(ref(false), ref([]))
    const empty = getComputedStyle(part('empty'))
    expect(empty.display).toBe('flex')
    expect(empty.color).toBe(color('var(--xh-fg-muted)'))
    expect(empty.fontSize).toBe(px('--xh-control-font-md'))
    expect(empty.paddingTop).toBe(px('--xh-space-3'))
  })
})
