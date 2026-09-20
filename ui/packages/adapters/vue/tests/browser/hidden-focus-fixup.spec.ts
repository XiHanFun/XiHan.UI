// 浮层收起那一帧，焦点从被藏起的条目上退到哪里、什么时候退——只有真实浏览器答得出。
//
// 三端对拍在 jsdom 里跑，收起帧两侧 activeElement 不一样：Vue 侧焦点停在刚落 hidden 的条目上，
// WC 侧浮层壳物理搬回原位、焦点被收回 body。这里用 Chromium 钉住三件事，作为对拍采样时机的依据：
// ① 焦点元素落 hidden（UA 样式表 display:none）+ inert 后，Chromium 的 focus fixup 不是同步的：
//   同步读、微任务里读都还是那个条目，它要到渲染更新末尾才收回 body；jsdom 停在 hidden 条目上与此同构。
// ② Core 焦点域 dispose 把归还排在动画帧上，跑在 fixup 之前：焦点从 hidden 条目直接搬到 trigger，
//   blur 的 relatedTarget 就是 trigger（fixup 先跑的话会是 null），body 从来不是一个能画出来的稳定态。
// ③ 焦点元素被物理搬迁（先摘再挂）时 Chromium 同步收回 body，blur 的 relatedTarget 为 null——
//   WC 侧收起帧的 body 就是这一条，jsdom 与此同构。
// 于是两端在「DOM 静止」那一拍的差异是真实过渡态，等一个动画帧过去，两端都到了 trigger。
//
// 刻意不引皮肤：对拍夹具同样没有皮肤，hidden 就是 UA 的 display:none，与 parity 看到的那一帧同构。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhPopoverCloseTrigger,
  XhPopoverContent,
  XhPopoverDescription,
  XhPopoverPositioner,
  XhPopoverRoot,
  XhPopoverTitle,
  XhPopoverTrigger,
} from '../../src'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
  document.getElementById('xh-portal-root')?.remove()
  document.body.innerHTML = ''
})

function part(name: string): HTMLElement {
  const el = document.querySelector<HTMLElement>(`[data-scope='popover'][data-part='${name}']`)
  if (!el)
    throw new Error(`找不到部件 popover/${name}`)
  return el
}

/** 轮询到条件成立为止，超时抛出实况。 */
async function until(check: () => boolean, label: string, timeout = 1000): Promise<void> {
  const started = performance.now()
  while (!check()) {
    if (performance.now() - started > timeout) {
      const ae = document.activeElement
      throw new Error(`等待「${label}」超时；焦点在 <${ae?.tagName.toLowerCase()} ${ae?.getAttribute('data-part') ?? ''}>`)
    }
    await new Promise<void>(r => setTimeout(r, 10))
  }
}

/** 下一个动画帧回调里 content 的计算 display。要在触发收起之前登记，才排在 Core dispose 的那一帧回调前面。 */
function displayAtNextFrame(content: HTMLElement): Promise<string> {
  return new Promise(resolve => requestAnimationFrame(() => resolve(getComputedStyle(content).display)))
}

/** 记下焦点离开时的去向：fixup 给 null，focus() 搬迁给目标元素。 */
function trackBlur(el: HTMLElement): { readonly relatedTargets: (EventTarget | null)[] } {
  const relatedTargets: (EventTarget | null)[] = []
  el.addEventListener('blur', e => relatedTargets.push((e as FocusEvent).relatedTarget))
  return { relatedTargets }
}

async function mountOpenPopover(): Promise<{ trigger: HTMLElement, content: HTMLElement, inside: HTMLElement }> {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    render: () => h(XhPopoverRoot, null, () => [
      h(XhPopoverTrigger, null, () => '打开'),
      h(XhPopoverPositioner, null, () => h(XhPopoverContent, null, () => [
        h(XhPopoverTitle, null, () => '标题'),
        h(XhPopoverDescription, null, () => '描述'),
        h('button', { type: 'button' }, '确认'),
        h(XhPopoverCloseTrigger, null, () => '关闭'),
      ])),
    ]),
  })
  app.mount(host)
  await nextTick()
  const trigger = part('trigger')
  const content = part('content')
  trigger.focus()
  trigger.click()
  await until(() => content.contains(document.activeElement) && document.activeElement !== content, '焦点进入 content')
  return { trigger, content, inside: document.activeElement as HTMLElement }
}

describe('vue 浮层收起帧：Chromium 的 focus fixup 时序', () => {
  it('escape 收起：content 落 hidden 后焦点仍停在里面的按钮上，直到 Core 在动画帧里把它直接搬给 trigger', async () => {
    const { trigger, content, inside } = await mountOpenPopover()
    const blur = trackBlur(inside)

    // 先登记观察帧，再派 Escape：Core 的归还也是一帧回调，登记在我们之后、跑在我们之后
    const displayAtFrame = displayAtNextFrame(content)
    inside.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))
    await nextTick()
    await nextTick()
    // Vue 已把 hidden / inert 投影到 content，焦点还在被藏起的按钮上
    expect(content.hasAttribute('hidden')).toBe(true)
    expect(content.getAttribute('inert')).not.toBeNull()
    expect(document.activeElement).toBe(inside)

    // 动画帧回调里样式已算出 display:none：Core 的归还与之同帧、排在它之后
    expect(await displayAtFrame).toBe('none')

    // Core 的 dispose 回调把焦点还给 trigger：blur 的去向就是 trigger，不经 body。
    // 若浏览器的 fixup 抢在前面，这里会先记下一次 relatedTarget 为 null 的 blur
    await until(() => document.activeElement === trigger, '焦点归还 trigger')
    expect(blur.relatedTargets).toEqual([trigger])
    expect(content.hasAttribute('hidden')).toBe(true)
  })

  it('没有 Core 归还时：hidden 上的焦点不会同步被收走，之后才被浏览器收回 body，blur 不带去向', async () => {
    const { content, inside } = await mountOpenPopover()
    const blur = trackBlur(inside)

    // 绕过机器，直接把收起态写到节点上：只看浏览器自己的 fixup
    content.setAttribute('hidden', '')
    content.setAttribute('inert', '')
    expect(document.activeElement).toBe(inside)
    await nextTick()
    expect(document.activeElement).toBe(inside)

    await until(() => document.activeElement === document.body, '浏览器 fixup 收回 body')
    expect(blur.relatedTargets).toEqual([null])
    expect(content.hasAttribute('hidden')).toBe(true)
  })

  it('焦点元素被物理搬迁：先摘再挂的那一刻焦点同步收回 body（WC 侧浮层壳归位看到的就是这个）', async () => {
    const wrap = document.createElement('div')
    const button = document.createElement('button')
    button.type = 'button'
    button.textContent = '条目'
    wrap.append(button)
    document.body.append(wrap)
    button.focus()
    expect(document.activeElement).toBe(button)
    const blur = trackBlur(button)

    const home = document.createElement('div')
    document.body.append(home)
    home.append(wrap)
    expect(document.activeElement).toBe(document.body)
    expect(blur.relatedTargets).toEqual([null])
    expect(button.isConnected).toBe(true)
  })
})
