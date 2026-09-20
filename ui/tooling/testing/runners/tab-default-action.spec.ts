// @vitest-environment jsdom
import type { AdapterHarness, ApplyContext } from '../src'
import { afterEach, describe, expect, it } from 'vitest'
import { applyStep } from '../src'

/**
 * 合成 Tab 没有浏览器的默认动作，apply-step 补的那一份要与浏览器一个口径：
 * 从按下那一刻的焦点起按文档 Tab 序走，处理器拦下就不动，越界到 body，
 * 藏起来、inert、退出 Tab 序与禁用的都跳过。三端 harness 走的是同一段代码，这里只用空壳宿主。
 */
function stubHarness(flush: () => Promise<void> = async () => {}): AdapterHarness {
  const refuse = (what: string) => async () => {
    throw new Error(`空壳宿主不支持 ${what}`)
  }
  return {
    adapterName: 'vue',
    mount: refuse('mount') as AdapterHarness['mount'],
    setProps: refuse('setProps'),
    flush,
    drainEvents: () => [],
    unmount: refuse('unmount'),
  }
}

function contextOf(harness = stubHarness()): ApplyContext {
  return { harness, root: document.body, doc: document, component: 'stub', anatomy: { parts: {} } as unknown as ApplyContext['anatomy'] }
}

function render(html: string): void {
  document.body.innerHTML = html
}

function byId(id: string): HTMLElement {
  const el = document.getElementById(id)
  if (!el)
    throw new Error(`夹具里没有 #${id}`)
  return el
}

/** 记下按键事件落在谁身上。 */
function recordKeys(): { readonly log: string[] } {
  const log: string[] = []
  for (const type of ['keydown', 'keyup'] as const) {
    document.addEventListener(type, (e) => {
      const target = e.target as Element
      log.push(`${type}@${target === document.body ? 'body' : target.id}`)
    })
  }
  return { log }
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('key: Tab 的平台默认动作', () => {
  it('tab 把焦点交给文档序里的下一个可 tab 元素；Shift+Tab 反向', async () => {
    render('<button id="a">a</button><button id="b">b</button><button id="c">c</button>')
    byId('b').focus()
    const ctx = contextOf()

    await applyStep(ctx, { kind: 'key', key: 'Tab' })
    expect(document.activeElement).toBe(byId('c'))

    await applyStep(ctx, { kind: 'key', key: 'Tab', modifiers: ['Shift'] })
    expect(document.activeElement).toBe(byId('b'))
    await applyStep(ctx, { kind: 'key', key: 'Tab', modifiers: ['Shift'] })
    expect(document.activeElement).toBe(byId('a'))
  })

  it('keydown 被 preventDefault 就不动', async () => {
    render('<button id="a">a</button><button id="b">b</button>')
    byId('a').focus()
    byId('a').addEventListener('keydown', (e) => {
      if (e.key === 'Tab')
        e.preventDefault()
    })

    await applyStep(contextOf(), { kind: 'key', key: 'Tab' })
    expect(document.activeElement).toBe(byId('a'))
  })

  it('两端越界到 body：最后一个往后、第一个往前，焦点都回到 body', async () => {
    render('<button id="a">a</button><button id="b">b</button>')
    const ctx = contextOf()

    byId('b').focus()
    await applyStep(ctx, { kind: 'key', key: 'Tab' })
    expect(document.activeElement).toBe(document.body)

    byId('a').focus()
    await applyStep(ctx, { kind: 'key', key: 'Tab', modifiers: ['Shift'] })
    expect(document.activeElement).toBe(document.body)
  })

  it('从 body 起步：Tab 落到第一个、Shift+Tab 落到最后一个', async () => {
    render('<button id="a">a</button><button id="b">b</button>')
    const ctx = contextOf()
    expect(document.activeElement).toBe(document.body)

    await applyStep(ctx, { kind: 'key', key: 'Tab' })
    expect(document.activeElement).toBe(byId('a'))

    byId('a').blur()
    await applyStep(ctx, { kind: 'key', key: 'Tab', modifiers: ['Shift'] })
    expect(document.activeElement).toBe(byId('b'))
  })

  it('hidden、display:none、inert（属性与 expando 两种形态）、tabindex=-1 与 disabled 都跳过', async () => {
    render(`
      <button id="a">a</button>
      <button id="hidden" hidden>hidden</button>
      <div style="display:none"><button id="none">none</button></div>
      <div inert><button id="inert-attr">inert</button></div>
      <div id="inert-host"><button id="inert-prop">inert</button></div>
      <button id="roving" tabindex="-1">roving</button>
      <button id="disabled" disabled>disabled</button>
      <button id="z">z</button>
    `)
    ;(byId('inert-host') as HTMLElement & { inert: boolean }).inert = true
    byId('a').focus()
    const ctx = contextOf()

    await applyStep(ctx, { kind: 'key', key: 'Tab' })
    expect(document.activeElement).toBe(byId('z'))
    await applyStep(ctx, { kind: 'key', key: 'Tab', modifiers: ['Shift'] })
    expect(document.activeElement).toBe(byId('a'))
  })

  it('起点只当文档位置用：处理器把焦点元素藏起来或摘出 Tab 序，仍从它的位置往下数', async () => {
    render('<button id="a">a</button><div id="menu"><button id="item">item</button></div><button id="z">z</button>')
    byId('item').focus()
    byId('item').addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        byId('menu').hidden = true
        byId('item').tabIndex = -1
      }
    })

    await applyStep(contextOf(), { kind: 'key', key: 'Tab' })
    expect(document.activeElement).toBe(byId('z'))
  })

  it('先等宿主把这一轮提交完再数：提交里退出 Tab 序的元素不再是落点', async () => {
    render('<button id="a">a</button><button id="b">b</button><button id="c">c</button>')
    byId('a').focus()
    let flushed = 0
    const harness = stubHarness(async () => {
      flushed += 1
      byId('b').hidden = true
    })

    await applyStep(contextOf(harness), { kind: 'key', key: 'Tab' })
    expect(flushed).toBe(1)
    expect(document.activeElement).toBe(byId('c'))
  })

  it('keyup 派给移过去之后持有焦点的元素；拦下的那次仍派给原处', async () => {
    render('<button id="a">a</button><button id="b">b</button>')
    const { log } = recordKeys()
    byId('a').focus()
    const ctx = contextOf()

    await applyStep(ctx, { kind: 'key', key: 'Tab' })
    expect(log).toEqual(['keydown@a', 'keyup@b'])

    log.length = 0
    byId('b').addEventListener('keydown', e => e.preventDefault())
    await applyStep(ctx, { kind: 'key', key: 'Tab' })
    expect(log).toEqual(['keydown@b', 'keyup@b'])
  })

  it('越界那一下 keyup 落在 body 上', async () => {
    render('<button id="a">a</button>')
    const { log } = recordKeys()
    byId('a').focus()

    await applyStep(contextOf(), { kind: 'key', key: 'Tab' })
    expect(document.activeElement).toBe(document.body)
    expect(log).toEqual(['keydown@a', 'keyup@body'])
  })

  it('其余按键没有这条默认动作：Enter 不动焦点，keyup 仍派给原处', async () => {
    render('<button id="a">a</button><button id="b">b</button>')
    const { log } = recordKeys()
    byId('a').focus()

    await applyStep(contextOf(), { kind: 'key', key: 'Enter' })
    expect(document.activeElement).toBe(byId('a'))
    expect(log).toEqual(['keydown@a', 'keyup@a'])
  })

  it('组合期间的 Tab 归输入法：不动焦点也不派 keyup', async () => {
    render('<button id="a">a</button><button id="b">b</button>')
    const { log } = recordKeys()
    byId('a').focus()

    await applyStep(contextOf(), { kind: 'key', key: 'Tab', composing: true })
    expect(document.activeElement).toBe(byId('a'))
    expect(log).toEqual(['keydown@a'])
  })
})
