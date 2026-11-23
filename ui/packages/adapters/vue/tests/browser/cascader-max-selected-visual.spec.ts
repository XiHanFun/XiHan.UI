// 级联选择选满之后：没选中的叶子换禁用面、选不进去；能落值的分支（changeOnSelect）行照旧是活的，
// 只把勾选框降级，点它照常铺开子列。字色、光标与方框的底色只有真实浏览器的计算样式量得出。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhCascaderRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const regions = [
  { value: 'zj', label: '浙江', children: [{ value: 'hz', label: '杭州' }] },
  { value: 'mo', label: '澳门' },
  { value: 'hk', label: '香港' },
]

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  document.getElementById('xh-portal-root')?.replaceChildren()
  app = null
  host = null
})

async function settle(): Promise<void> {
  await nextTick()
  await nextTick()
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
}

async function mountFull(): Promise<void> {
  host = document.createElement('div')
  // 过渡时长归零：量的是落定之后的面，不量换色途中的色值
  host.style.setProperty('--xh-motion-duration-color', '0s')
  document.body.append(host)
  app = createApp({
    render: () => h(XhCascaderRoot, {
      collection: regions,
      open: true,
      multiple: true,
      changeOnSelect: true,
      maxSelected: 1,
      defaultValue: [['mo']],
    }),
  })
  app.mount(host)
  await settle()
}

function item(value: string): HTMLElement {
  const el = document.querySelector<HTMLElement>(`[data-scope="cascader"][data-part="item"][data-value="${value}"]`)
  if (!el)
    throw new Error(`找不到条目 ${value}`)
  return el
}

function box(value: string): HTMLElement {
  return item(value).querySelector<HTMLElement>('[data-part="item-indicator"]')!
}

/** 把一个令牌交给浏览器按同一条路算成计算样式里的写法，再去比。 */
function resolved(property: 'color' | 'backgroundColor', token: string): string {
  const probe = document.createElement('span')
  probe.style[property] = `var(${token})`
  document.body.append(probe)
  const value = getComputedStyle(probe)[property]
  probe.remove()
  return value
}

describe('级联选择选满之后的行与勾选框', () => {
  it('选不进去的叶子换禁用字色、光标 not-allowed；已选的那一行不变', async () => {
    await mountFull()
    const disabledFg = resolved('color', '--xh-fg-disabled')

    expect(getComputedStyle(item('hk')).color).toBe(disabledFg)
    expect(getComputedStyle(item('hk')).cursor).toBe('not-allowed')

    expect(getComputedStyle(item('mo')).color).not.toBe(disabledFg)
    expect(getComputedStyle(item('mo')).cursor).toBe('pointer')
  })

  it('能落值却选不进去的分支：行照旧是活的，只有勾选框降级', async () => {
    await mountFull()
    expect(getComputedStyle(item('zj')).color).not.toBe(resolved('color', '--xh-fg-disabled'))
    expect(getComputedStyle(item('zj')).cursor).toBe('pointer')
    expect(getComputedStyle(box('zj')).backgroundColor).toBe(resolved('backgroundColor', '--xh-bg-subtle'))
    // 已选那一行的方框是填上的，不是降级的那一档
    expect(getComputedStyle(box('mo')).backgroundColor).toBe(resolved('backgroundColor', '--xh-bg-brand'))
  })

  it('点这个分支照常铺开子列，值不变', async () => {
    await mountFull()
    expect(item('zj').getAttribute('aria-selected')).toBe('false')
    item('zj').click()
    await settle()
    expect(item('hz').closest('[hidden]')).toBeNull()
    expect(item('zj').getAttribute('aria-selected')).toBe('false')
    expect(item('mo').getAttribute('aria-selected')).toBe('true')
  })
})
