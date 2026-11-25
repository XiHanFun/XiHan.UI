// Presence 的进出场：退场那一段内容还在、不带 hidden，动画真的播完才藏起、卸载并通知 exit-complete；
// 中途改回在场不卸载；首帧在场不播进场。退场探测读的是浏览器实际在播的动画，jsdom 里演不出来。
import type { App, Ref } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import { XhPresence } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'
import './hidden-important-host'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
  delete document.documentElement.dataset.motion
})

/** exit-complete 那一刻量到的事实：通知必须晚于收起与卸载。 */
interface ExitRecord {
  hidden: boolean
  content: boolean
}

interface Mounted {
  present: Ref<boolean>
  exits: ExitRecord[]
  root: HTMLElement
}

function root(): HTMLElement {
  const el = document.querySelector<HTMLElement>(`[data-scope='presence'][data-part='root']`)
  if (!el)
    throw new Error('找不到 presence/root')
  return el
}

function content(): HTMLElement | null {
  return document.querySelector<HTMLElement>('[data-testid="content"]')
}

const frame = (): Promise<unknown> => new Promise(resolve => requestAnimationFrame(resolve))

/** 等 Vue 把这一轮提交完：退场闸门的 watcher 是 flush: 'post'，要排在渲染之后。 */
async function settle(): Promise<void> {
  await nextTick()
  await nextTick()
}

async function mount(initial: boolean, props: Record<string, unknown> = {}): Promise<Mounted> {
  const present = ref(initial)
  const exits: ExitRecord[] = []
  host = document.createElement('div')
  // 退场直接取这支令牌，拉长到逐帧采样追得上；整段仍在下面的轮询上限里播完
  host.style.setProperty('--xh-motion-duration-exit', '600ms')
  host.style.setProperty('--xh-motion-duration-enter', '600ms')
  document.body.append(host)
  app = createApp({
    setup: () => () => h(XhPresence, {
      ...props,
      present: present.value,
      onExitComplete: () => {
        const el = root()
        exits.push({ hidden: el.hasAttribute('hidden'), content: content() !== null })
      },
    }, () => h('span', { 'data-testid': 'content' }, '内容')),
  })
  app.mount(host)
  await settle()
  await frame()
  return { present, exits, root: root() }
}

describe('presence 进出场', () => {
  it('首帧就在场：直接呈现，带 data-instant，不播进场', async () => {
    const { root } = await mount(true)
    expect(root.hasAttribute('data-instant')).toBe(true)
    expect(root.dataset.state).toBe('open')
    expect(root.hidden).toBe(false)
    expect(getComputedStyle(root).animationName).toBe('none')
    expect(Number(getComputedStyle(root).opacity)).toBe(1)
    expect(content()).not.toBeNull()
  })

  it('present 改 false：退场那一段内容还在、不带 hidden；播完才藏起、卸载，之后才发 exit-complete', async () => {
    const { present, exits, root } = await mount(true)
    present.value = false
    await settle()

    // 退场开始：data-state 翻成 closed，首帧的 data-instant 撤掉，播的是皮肤的淡出
    expect(root.dataset.state).toBe('closed')
    expect(root.hasAttribute('data-instant')).toBe(false)
    expect(root.hidden).toBe(false)
    expect(getComputedStyle(root).display).not.toBe('none')
    expect(getComputedStyle(root).animationName).toBe('xh-fade-out')
    expect(content()).not.toBeNull()
    expect(exits).toEqual([])

    // 播的途中看得见在变淡，内容一直挂着
    await frame()
    await frame()
    await frame()
    const midway = Number(getComputedStyle(root).opacity)
    expect(midway).toBeLessThan(1)
    expect(midway).toBeGreaterThan(0)
    expect(root.hidden).toBe(false)
    expect(content()).not.toBeNull()

    // 播完才收：hidden 落下、内容卸载，exit-complete 在两者之后只发一次
    await expect.poll(() => root.hidden, { timeout: 3000 }).toBe(true)
    await settle()
    expect(content()).toBeNull()
    expect(exits).toEqual([{ hidden: true, content: false }])
  })

  it('退场中途改回在场：取消退场，内容不重新挂载、不发 exit-complete，从此刻的不透明度接着淡入', async () => {
    const { present, exits, root } = await mount(true)
    const node = content()
    present.value = false
    await settle()
    await frame()
    await frame()
    await frame()
    expect(Number(getComputedStyle(root).opacity)).toBeLessThan(1)

    present.value = true
    await settle()
    expect(root.dataset.state).toBe('open')
    expect(root.hidden).toBe(false)
    expect(root.hasAttribute('data-instant')).toBe(false)
    expect(getComputedStyle(root).animationName).toBe('xh-fade-in')
    // 进场的起点接在退场停下的地方，不先跳回全透明
    const from = Number(root.style.getPropertyValue('--xh-_enter-from-opacity'))
    expect(from).toBeGreaterThan(0)
    expect(from).toBeLessThan(1)
    // 还是原来那个节点：没有卸载再挂
    expect(content()).toBe(node)

    // 原本的退场时长过完也不收、不通知
    await new Promise(resolve => setTimeout(resolve, 900))
    expect(root.hidden).toBe(false)
    expect(content()).toBe(node)
    expect(exits).toEqual([])
  })

  it('初始不在场：root 藏着、不挂内容；改 true 后不带 data-instant，播进场', async () => {
    const { present, exits, root } = await mount(false)
    expect(root.hidden).toBe(true)
    expect(content()).toBeNull()

    present.value = true
    await settle()
    expect(root.hidden).toBe(false)
    expect(root.hasAttribute('data-instant')).toBe(false)
    expect(content()).not.toBeNull()
    expect(getComputedStyle(root).animationName).toBe('xh-fade-in')
    await frame()
    expect(Number(getComputedStyle(root).opacity)).toBeLessThan(1)
    expect(exits).toEqual([])
  })

  it('unmountOnExit 为 false：退场播完 root 藏起，内容留在原处', async () => {
    const { present, exits, root } = await mount(true, { unmountOnExit: false })
    const node = content()
    present.value = false
    await settle()
    expect(root.hidden).toBe(false)
    await expect.poll(() => root.hidden, { timeout: 3000 }).toBe(true)
    await settle()
    expect(content()).toBe(node)
    expect(exits).toEqual([{ hidden: true, content: true }])
  })

  it('减弱动效下退场仍是一段淡出，播完才收', async () => {
    document.documentElement.dataset.motion = 'reduce'
    const { present, exits, root } = await mount(true)
    present.value = false
    await settle()
    expect(root.hidden).toBe(false)
    expect(getComputedStyle(root).animationName).toBe('xh-fade-out')
    await expect.poll(() => root.hidden, { timeout: 3000 }).toBe(true)
    expect(exits).toHaveLength(1)
  })
})
