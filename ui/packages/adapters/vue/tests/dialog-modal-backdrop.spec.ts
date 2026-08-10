// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import { XhDialogContent, XhDialogRoot, XhDialogTitle, XhDialogTrigger } from '../src'

/**
 * 模态对话框把背景移出无障碍树，靠的是给 body 的其它直接子元素打 inert。
 * 这一步此前是在进入 open 的那一刻同步取 content 做的，而那时 Vue 还没渲染 content，
 * 取到空数组就直接跳过——背景于是永远不 inert。
 *
 * 四条打开路径都要验：这个 bug 之所以活了这么久，正是因为两个适配器漏的那半边是
 * 互补的（Vue 只有 defaultOpen 首屏侥幸生效，WC 反过来只有 defaultOpen 首屏漏），
 * 任何只覆盖一条路径的用例都会放它过去。
 *
 * jsdom 不实现 inert，hideOutside 走的是 `el.inert = true` 这条路，
 * 落成 expando 属性；断言属性而不是 hasAttribute('inert')。
 */

interface Mounted {
  background: HTMLElement
  open: (v: boolean) => Promise<void>
  unmount: () => void
}

async function tick(): Promise<void> {
  await nextTick()
  await nextTick()
  await new Promise(r => setTimeout(r, 0))
  await nextTick()
}

function mountDialog(opts: { defaultOpen?: boolean, controlled?: boolean } = {}): Mounted {
  const background = document.createElement('div')
  background.id = 'background'
  background.textContent = '背景内容'
  document.body.appendChild(background)

  const host = document.createElement('div')
  document.body.appendChild(host)
  const openRef = ref(false)

  const app = createApp({
    setup: () => () =>
      h(
        XhDialogRoot,
        opts.controlled
          ? { 'open': openRef.value, 'onUpdate:open': (v: boolean) => { openRef.value = v } }
          : { defaultOpen: opts.defaultOpen ?? false },
        {
          default: () => [
            h(XhDialogTrigger, null, () => '打开'),
            h(XhDialogContent, null, () => [
              h(XhDialogTitle, null, () => '标题'),
              h('button', null, '确认'),
            ]),
          ],
        },
      ),
  })
  app.mount(host)

  return {
    background,
    async open(v: boolean) {
      if (opts.controlled) {
        openRef.value = v
        await tick()
        return
      }
      const trigger = host.querySelector<HTMLElement>('[data-part="trigger"]')
      const closeByEsc = (): void => {
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))
      }
      if (v)
        trigger?.click()
      else
        closeByEsc()
      await tick()
    },
    unmount() {
      app.unmount()
      host.remove()
      background.remove()
    },
  }
}

function inertOf(el: HTMLElement): boolean {
  return (el as unknown as { inert?: boolean }).inert === true
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('模态 dialog 打开后背景失活', () => {
  it('点 trigger 打开', async () => {
    const m = mountDialog()
    try {
      await m.open(true)
      expect(document.querySelector('[data-part="content"]')?.getAttribute('data-state')).toBe('open')
      expect(inertOf(m.background)).toBe(true)
    }
    finally {
      m.unmount()
    }
  })

  it('defaultOpen 首屏即打开', async () => {
    const m = mountDialog({ defaultOpen: true })
    try {
      await tick()
      expect(inertOf(m.background)).toBe(true)
    }
    finally {
      m.unmount()
    }
  })

  it('受控 open 由 false 翻到 true', async () => {
    const m = mountDialog({ controlled: true })
    try {
      await m.open(true)
      expect(inertOf(m.background)).toBe(true)
    }
    finally {
      m.unmount()
    }
  })

  it('关掉再打开：第二次照样失活', async () => {
    const m = mountDialog({ controlled: true })
    try {
      await m.open(true)
      await m.open(false)
      // 关上之后要还回去，否则背景永远读不到了
      expect(inertOf(m.background)).toBe(false)
      await m.open(true)
      expect(inertOf(m.background)).toBe(true)
    }
    finally {
      m.unmount()
    }
  })

  it('打开后当帧就关：推迟挂载的那一下不该补挂到已经关上的对话框上', async () => {
    const m = mountDialog({ controlled: true })
    try {
      await m.open(true)
      await m.open(false)
      await tick()
      expect(inertOf(m.background)).toBe(false)
    }
    finally {
      m.unmount()
    }
  })
})

/**
 * 非模态 dialog 此前整个焦点域都塞在 `if (modal)` 里：打开后焦点根本不进 content，
 * 关闭也不归还 trigger，restoreFocus 这个 prop 写 true 写 false 输出一模一样。
 *
 * 注意测法：光看"关闭后焦点是不是回到 trigger"是假阳性——焦点压根没离开过 trigger。
 * 必须先把焦点放进 content 里，再关，才验得出归还这件事。
 */
describe('非模态 dialog 的焦点', () => {
  // 焦点域挂载聚焦排在 rAF 上，且容器没就位时最多重试 3 帧；
  // nextTick 与 setTimeout(0) 都比一帧早，等不到落焦
  const settleFocus = async (): Promise<void> => {
    await tick()
    await new Promise(r => setTimeout(r, 100))
  }

  function mountNonModal(restoreFocus: boolean): { host: HTMLElement, unmount: () => void } {
    const host = document.createElement('div')
    document.body.appendChild(host)
    const app = createApp({
      setup: () => () =>
        h(XhDialogRoot, { defaultOpen: false, modal: false, restoreFocus }, {
          default: () => [
            h(XhDialogTrigger, null, () => '打开'),
            h(XhDialogContent, null, () => [
              h(XhDialogTitle, null, () => '标题'),
              h('button', { id: 'confirm' }, '确认'),
            ]),
          ],
        }),
    })
    app.mount(host)
    const unmount = (): void => {
      app.unmount()
      host.remove()
    }
    return { host, unmount }
  }

  it('打开后焦点进入 content', async () => {
    const m = mountNonModal(true)
    try {
      const trigger = m.host.querySelector<HTMLElement>('[data-part="trigger"]')!
      trigger.focus()
      trigger.click()
      await settleFocus()
      const content = document.querySelector('[data-part="content"]')!
      expect(content.contains(document.activeElement)).toBe(true)
    }
    finally {
      m.unmount()
    }
  })

  it('restoreFocus 为 true 时关闭归还 trigger，为 false 时不归还', async () => {
    for (const restore of [true, false]) {
      const m = mountNonModal(restore)
      try {
        const trigger = m.host.querySelector<HTMLElement>('[data-part="trigger"]')!
        trigger.focus()
        trigger.click()
        await settleFocus()
        // 先把焦点挪进浮层，否则"关闭后焦点在 trigger"只是因为它从没离开过
        document.querySelector<HTMLElement>('#confirm')!.focus()
        expect(document.activeElement?.id).toBe('confirm')

        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))
        await settleFocus()

        expect(document.activeElement === trigger, `restoreFocus=${restore} 时归还与否`).toBe(restore)
      }
      finally {
        m.unmount()
      }
    }
  })
})
