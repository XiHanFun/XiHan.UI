// 树选择选满之后：没选中的行换禁用面、选不进去，但分支还得打得开——里面可能有要点掉的已选项。
// 行的字色降级与光标、箭头照旧的字色与光标，只有真实浏览器的计算样式量得出。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhTreeSelectRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const tree = [
  { value: 'branch', label: '分支', children: [{ value: 'leaf', label: '叶子' }] },
  { value: 'other', label: '另一个分支', children: [{ value: 'inner', label: '里面的叶子' }] },
  { value: 'solo', label: '单独的叶子' },
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
    render: () => h(XhTreeSelectRoot, {
      collection: tree,
      open: true,
      multiple: true,
      maxSelected: 1,
      defaultValue: ['solo'],
      defaultExpandedValue: ['branch'],
    }),
  })
  app.mount(host)
  await settle()
}

function part(name: string, value: string): HTMLElement {
  const el = document.querySelector<HTMLElement>(`[data-scope="tree-select"][data-part="${name}"][data-value="${value}"]`)
    ?? document.querySelector<HTMLElement>(`[data-scope="tree-select"][data-part="branch"][data-value="${value}"] > [data-part="branch-control"]${name === 'branch-control' ? '' : ` > [data-part="${name}"]`}`)
  if (!el)
    throw new Error(`找不到 ${name} / ${value}`)
  return el
}

/** 把一个颜色值交给浏览器按同一条路算成计算样式里的写法，再去比。 */
function resolved(token: string): string {
  const probe = document.createElement('span')
  probe.style.color = `var(${token})`
  document.body.append(probe)
  const color = getComputedStyle(probe).color
  probe.remove()
  return color
}

describe('树选择选满之后的行与箭头', () => {
  it('选不进去的叶子与分支行换禁用字色、光标 not-allowed；已选的那一行不变', async () => {
    await mountFull()
    const disabledFg = resolved('--xh-fg-disabled')

    const blockedLeaf = part('item', 'leaf')
    expect(getComputedStyle(blockedLeaf).color).toBe(disabledFg)
    expect(getComputedStyle(blockedLeaf).cursor).toBe('not-allowed')

    const blockedRow = part('branch-control', 'other')
    expect(getComputedStyle(blockedRow).color).toBe(disabledFg)
    expect(getComputedStyle(blockedRow).cursor).toBe('not-allowed')

    const picked = part('item', 'solo')
    expect(getComputedStyle(picked).color).not.toBe(disabledFg)
    expect(getComputedStyle(picked).cursor).toBe('pointer')
  })

  it('选不进去的分支，箭头照旧是可点的样子：字色不降级，光标是 pointer', async () => {
    await mountFull()
    const arrow = part('branch-trigger', 'other')
    expect(getComputedStyle(arrow).color).toBe(resolved('--xh-fg-subtle'))
    expect(getComputedStyle(arrow).cursor).toBe('pointer')
  })

  it('点箭头展得开，里面的叶子露出来', async () => {
    await mountFull()
    const branch = document.querySelector<HTMLElement>('[data-scope="tree-select"][data-part="branch"][data-value="other"]')!
    expect(branch.getAttribute('aria-expanded')).toBe('false')
    part('branch-trigger', 'other').click()
    await settle()
    expect(branch.getAttribute('aria-expanded')).toBe('true')
  })
})
