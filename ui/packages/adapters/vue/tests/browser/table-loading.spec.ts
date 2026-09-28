// 表格的两种等待：还没有行时 loading 占位画一枚加载环（加载环家族配方，与 Spinner 环档同一副画法）排在文案之前；
// 已有行时重新取数不换成占位，保留上一帧，表体与表尾按 micro 淡到禁用透明度，数据到了再淡回。
// 环的几何、转与停、表体的淡变都得在真实浏览器里量。
import type { App, Ref } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import {
  XhTableBody,
  XhTableCell,
  XhTableColumnHeader,
  XhTableColumnLabel,
  XhTableEmpty,
  XhTableHeader,
  XhTableLoading,
  XhTableRoot,
  XhTableRow,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const columns = [{ id: 'name', label: '任务' }]

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

function part(name: string): HTMLElement {
  const el = host?.querySelector<HTMLElement>(`[data-scope='table'][data-part='${name}']`)
  if (!el)
    throw new Error(`找不到 table/${name}`)
  return el
}

function token(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

async function mount(loading: Ref<boolean>, ids: Ref<string[]>): Promise<void> {
  host = document.createElement('div')
  host.style.inlineSize = '360px'
  document.body.append(host)
  app = createApp({
    render: () => h(XhTableRoot, { columns, rows: ids.value.map(id => ({ id })), loading: loading.value }, {
      default: () => [
        h(XhTableHeader, null, {
          default: () => [h(XhTableRow, null, {
            default: () => columns.map(column => h(XhTableColumnHeader, { key: column.id, value: column.id }, { default: () => h(XhTableColumnLabel, null, { default: () => column.label }) })),
          })],
        }),
        h(XhTableBody, null, {
          default: () => ids.value.map(id => h(XhTableRow, { key: id, value: id }, { default: () => h(XhTableCell, { value: 'name' }, { default: () => id }) })),
        }),
        h(XhTableLoading, null, { default: () => '正在取数…' }),
        h(XhTableEmpty, null, { default: () => '还没有任务' }),
      ],
    }),
  })
  app.mount(host)
  await nextTick()
}

describe('table 加载态', () => {
  it('空表取数：loading 占位画一枚加载环排在文案之前，环径取图标档、在转；不再整块呼吸', async () => {
    await mount(ref(true), ref([]))
    const loading = part('loading')
    expect(loading.hidden).toBe(false)
    expect(loading.hasAttribute('data-xh-loading-ring')).toBe(true)
    expect(loading.hasAttribute('data-loading')).toBe(true)

    const style = getComputedStyle(loading)
    expect(style.animationName).toBe('none')
    expect(style.flexDirection).toBe('row')

    const ring = getComputedStyle(loading, '::before')
    expect(ring.width).toBe(token('--xh-glyph-size-md'))
    expect(ring.height).toBe(token('--xh-glyph-size-md'))
    expect(ring.borderTopLeftRadius).toBe('50%')
    expect(ring.animationName).toBe('xh-spin')
    expect(ring.animationPlayState).toBe('running')
    await expect.poll(() => getComputedStyle(loading, '::before').opacity).toBe('1')
  })

  it('已有行时重新取数：占位不出现，表体保留上一帧按 micro 淡到禁用透明度，取完再淡回', async () => {
    const loading = ref(false)
    await mount(loading, ref(['a', 'b']))
    const body = part('body')
    expect(getComputedStyle(body).opacity).toBe('1')
    expect(getComputedStyle(body).transitionProperty).toBe('opacity')
    expect(getComputedStyle(body).transitionDuration).toBe(`${Number.parseFloat(token('--xh-motion-duration-micro')) / 1000}s`)

    loading.value = true
    await nextTick()
    expect(part('loading').hidden).toBe(true)
    expect(body.querySelectorAll('[data-part="row"]')).toHaveLength(2)
    await expect.poll(() => getComputedStyle(body).opacity).toBe(token('--xh-state-disabled-opacity'))

    loading.value = false
    await nextTick()
    await expect.poll(() => getComputedStyle(body).opacity).toBe('1')
  })
})
