// 标签输入与动态字段组的列表动效：首帧的条目直接呈现，新到的一批按到达顺序错开进场，
// 删掉的条目由替身在原处播完退场再移除，其余条目从旧位置滑到新位置。
// 动画是否在播、替身落在哪、条目此刻的位移只有真实浏览器量得出：jsdom 不排版、不跑 CSS 动画。
import type { App, Ref } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import {
  XhFieldArrayItem,
  XhFieldArrayItemDeleteTrigger,
  XhFieldArrayMoveDownTrigger,
  XhFieldArrayRoot,
  XhTagsInputControl,
  XhTagsInputInput,
  XhTagsInputItem,
  XhTagsInputItemDeleteTrigger,
  XhTagsInputItemPreview,
  XhTagsInputItemText,
  XhTagsInputRoot,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
})

/** 元素身上浏览器实际起播的 CSS 关键帧动画名。 */
function running(el: Element): string[] {
  return el.getAnimations().filter(a => a instanceof CSSAnimation).map(a => (a as CSSAnimation).animationName)
}

/** 条目此刻的位移（换位补偿的过渡还在走时不为零）。 */
function offsetY(el: Element): number {
  const value = getComputedStyle(el).translate
  if (!value || value === 'none')
    return 0
  return Number.parseFloat(value.split(/\s+/)[1] ?? '0') || 0
}

function offsetX(el: Element): number {
  const value = getComputedStyle(el).translate
  if (!value || value === 'none')
    return 0
  return Number.parseFloat(value.split(/\s+/)[0] ?? '0') || 0
}

/** 令牌当下解析成多少毫秒。 */
function tokenMs(name: string): number {
  const probe = document.createElement('div')
  probe.style.transitionDuration = `var(${name})`
  document.body.append(probe)
  const value = getComputedStyle(probe).transitionDuration
  probe.remove()
  return value.endsWith('ms') ? Number.parseFloat(value) : Number.parseFloat(value) * 1000
}

async function until(check: () => boolean): Promise<void> {
  await expect.poll(check, { timeout: 2000 }).toBe(true)
}

async function frame(): Promise<void> {
  await new Promise(resolve => requestAnimationFrame(() => resolve(undefined)))
}

async function mountTags(values: Ref<string[]>, width = 360): Promise<HTMLElement> {
  host = document.createElement('div')
  host.style.cssText = `inline-size: ${width}px`
  document.body.append(host)
  app = createApp({
    setup: () => () => h(XhTagsInputRoot, { 'value': values.value, 'onUpdate:value': (next: string[]) => { values.value = next } }, {
      default: () => h(XhTagsInputControl, null, () => [
        ...values.value.map(t => h(XhTagsInputItem, { key: t, value: t }, () => h(XhTagsInputItemPreview, null, () => [
          h(XhTagsInputItemText, null, () => t),
          h(XhTagsInputItemDeleteTrigger),
        ]))),
        h(XhTagsInputInput),
      ]),
    }),
  })
  app.mount(host)
  await nextTick()
  await nextTick()
  await frame()
  return host.querySelector<HTMLElement>(`[data-scope='tags-input'][data-part='control']`)!
}

const TAG_ITEM = `[data-scope='tags-input'][data-part='item']`

function liveTags(control: HTMLElement): HTMLElement[] {
  return [...control.querySelectorAll<HTMLElement>(`${TAG_ITEM}:not([data-state='closed'])`)]
}

describe('标签输入的列表动效', () => {
  it('首帧就在的标签直接呈现，不播进场', async () => {
    const control = await mountTags(ref(['Vue', 'React', 'Svelte']))
    expect(control.hasAttribute('data-instant')).toBe(false)
    for (const el of liveTags(control)) {
      expect(el.hasAttribute('data-instant')).toBe(true)
      expect(running(el)).toEqual([])
    }
  })

  it('新落下的一批按到达顺序错开进场', async () => {
    const values = ref(['Vue'])
    const control = await mountTags(values)
    values.value = [...values.value, 'Solid', 'Qwik']
    await nextTick()
    await until(() => liveTags(control).length === 3)
    const [, first, second] = liveTags(control)
    expect(running(first!)).toEqual(['xh-item-in'])
    expect(running(second!)).toEqual(['xh-item-in'])
    const delay = (el: Element) => Number(el.getAnimations()[0]!.effect!.getTiming().delay)
    expect(delay(first!)).toBe(0)
    expect(delay(second!)).toBe(tokenMs('--xh-motion-stagger-step'))
  })

  it('删掉的标签由替身在原处淡出、播完即移除，后面的标签从旧位置滑过去', async () => {
    const values = ref(['第一枚较长的标签', '二', '三'])
    const control = await mountTags(values)
    const [gone, next] = liveTags(control)
    const goneRect = gone!.getBoundingClientRect()
    const nextLeft = next!.getBoundingClientRect().left

    values.value = values.value.slice(1)
    await nextTick()
    await until(() => control.querySelector(`${TAG_ITEM}[data-state='closed']`) !== null)

    const ghost = control.querySelector<HTMLElement>(`${TAG_ITEM}[data-state='closed']`)!
    expect(ghost).not.toBe(gone)
    expect(ghost.hasAttribute('inert')).toBe(true)
    expect(ghost.getAttribute('aria-hidden')).toBe('true')
    expect(running(ghost)).toEqual(['xh-fade-out'])
    const ghostRect = ghost.getBoundingClientRect()
    expect(Math.abs(ghostRect.left - goneRect.left)).toBeLessThan(1)
    expect(Math.abs(ghostRect.top - goneRect.top)).toBeLessThan(1)
    expect(Math.abs(ghostRect.width - goneRect.width)).toBeLessThan(1)

    // 第二枚换到了行首：布局位已经在新位置，画面上还从旧位置起步
    const [first] = liveTags(control)
    expect(first).toBe(next)
    const shifted = offsetX(first!)
    expect(shifted).toBeGreaterThan(0)
    expect(Math.abs(first!.getBoundingClientRect().left - nextLeft)).toBeLessThan(2)

    await until(() => !ghost.isConnected)
    await until(() => offsetX(first!) === 0)
    expect(control.querySelectorAll(`${TAG_ITEM}[data-state='closed']`)).toHaveLength(0)
  })

  it('减弱动效下退场仍留淡变，换位不走位移过渡', async () => {
    const values = ref(['一', '二', '三'])
    const control = await mountTags(values)
    host!.setAttribute('data-motion', 'reduce')
    await frame()
    const [, second] = liveTags(control)
    expect(getComputedStyle(second!).transitionDuration).toBe('0.001s')

    values.value = values.value.slice(1)
    await nextTick()
    await until(() => control.querySelector(`${TAG_ITEM}[data-state='closed']`) !== null)
    const ghost = control.querySelector<HTMLElement>(`${TAG_ITEM}[data-state='closed']`)!
    expect(running(ghost)).toEqual(['xh-fade-out'])
    expect(Number(ghost.getAnimations()[0]!.effect!.getTiming().duration)).toBe(tokenMs('--xh-motion-duration-exit'))
    await until(() => !ghost.isConnected)
  })
})

async function mountRows(rows: Ref<string[]>): Promise<HTMLElement> {
  host = document.createElement('div')
  host.style.cssText = 'inline-size: 360px'
  document.body.append(host)
  app = createApp({
    setup: () => () => h(XhFieldArrayRoot, { 'value': rows.value, 'onUpdate:value': (next: unknown[]) => { rows.value = next as string[] }, 'movable': true }, {
      default: ({ items }: { items: Array<{ key: string, value: unknown, index: number }> }) => items.map(row => h(XhFieldArrayItem, { key: row.key, index: row.index }, () => [
        h('input', { 'aria-label': `第 ${row.index + 1} 行`, 'value': String(row.value) }),
        h(XhFieldArrayMoveDownTrigger),
        h(XhFieldArrayItemDeleteTrigger),
      ])),
    }),
  })
  app.mount(host)
  await nextTick()
  await nextTick()
  await frame()
  return host.querySelector<HTMLElement>(`[data-scope='field-array'][data-part='root']`)!
}

const ROW = `[data-scope='field-array'][data-part='item']`

function liveRows(root: HTMLElement): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>(`${ROW}:not([data-state='closed'])`)]
}

describe('动态字段组的列表动效', () => {
  it('首帧的行直接呈现；新增的行进场', async () => {
    const rows = ref(['甲', '乙'])
    const root = await mountRows(rows)
    for (const el of liveRows(root))
      expect(running(el)).toEqual([])
    rows.value = [...rows.value, '丙']
    await nextTick()
    await until(() => liveRows(root).length === 3)
    expect(running(liveRows(root)[2]!)).toEqual(['xh-item-in'])
  })

  it('删掉的行由替身在原处淡出，替身里的输入框不带表单名与 id', async () => {
    const rows = ref(['甲', '乙', '丙'])
    const root = await mountRows(rows)
    const [, middle, last] = liveRows(root)
    const top = middle!.getBoundingClientRect().top
    const lastTop = last!.getBoundingClientRect().top

    // 经删除钮删：行号跟着删除走，卸下的正是中间那一行（整份替换值时行号按位置续用）
    middle!.querySelector<HTMLButtonElement>(`[data-part='item-delete-trigger']`)!.click()
    await nextTick()
    await until(() => root.querySelector(`${ROW}[data-state='closed']`) !== null)
    const ghost = root.querySelector<HTMLElement>(`${ROW}[data-state='closed']`)!
    expect(Math.abs(ghost.getBoundingClientRect().top - top)).toBeLessThan(1)
    expect(running(ghost)).toEqual(['xh-fade-out'])
    expect(ghost.querySelector('[id]')).toBeNull()
    // 下面那一行上移了一行：画面上还从原位置起步
    expect(offsetY(last!)).toBeGreaterThan(0)
    expect(Math.abs(last!.getBoundingClientRect().top - lastTop)).toBeLessThan(2)
    await until(() => !ghost.isConnected)
  })

  it('下移一行是换位：两行互换位置、不重播进场', async () => {
    const rows = ref(['甲', '乙'])
    const root = await mountRows(rows)
    const [first, second] = liveRows(root)
    first!.querySelector<HTMLButtonElement>(`[data-part='move-down-trigger']`)!.click()
    await nextTick()
    await until(() => liveRows(root)[0] === second)
    expect(running(first!)).toEqual([])
    expect(running(second!)).toEqual([])
    expect(offsetY(first!)).toBeLessThan(0)
    expect(offsetY(second!)).toBeGreaterThan(0)
    expect(root.querySelector(`${ROW}[data-state='closed']`)).toBeNull()
  })
})
