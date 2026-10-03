/**
 * 粘底靠滚动容器的几何量：jsdom 不排版，三个量靠钉，滚动靠派事件模拟。
 *
 * @vitest-environment jsdom
 */

import type { LogProps, LogSchema, LogStickChangeDetails } from '../src/log'
import { createRuntimeConfig, createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, describe, expect, it } from 'vitest'
import { connectLog, logMachine, parseAnsi, stripAnsi } from '../src/log'

type MachineProps = LogSchema['props']

const flush = (): Promise<void> => new Promise(resolve => setTimeout(resolve, 0))

function makeLog(initial: MachineProps = {}, view: LogProps = {}) {
  const changes: LogStickChangeDetails[] = []
  const runtime = createVanillaRuntime()
  const props = runtime.signal<MachineProps>({ ...initial, onStickChange: d => changes.push(d) })
  const service = createService(logMachine, { props: () => props.get(), runtime })

  const viewport = document.createElement('div')
  const content = document.createElement('div')
  viewport.append(content)
  document.body.append(viewport)
  const metrics = { scrollTop: 0, scrollHeight: 1000, clientHeight: 200 }
  for (const key of ['scrollTop', 'scrollHeight', 'clientHeight'] as const) {
    Object.defineProperty(viewport, key, {
      get: () => metrics[key],
      set: (v: number) => {
        metrics[key] = v
      },
      configurable: true,
    })
  }
  service.refs.set('config', createRuntimeConfig())
  service.refs.set('getViewportEl', () => viewport)
  service.refs.set('getContentEl', () => content)
  runtime.start()

  return {
    service,
    viewport,
    changes,
    metrics,
    api: (v: LogProps = view) => connectLog(service, v, normalizeProps),
    scroll: async (top: number) => {
      metrics.scrollTop = top
      viewport.dispatchEvent(new Event('scroll'))
      await flush()
    },
    stop: () => {
      runtime.stop()
      viewport.remove()
    },
  }
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('connectLog 投影', () => {
  it('视口是 role=log 且显式关掉 aria-live，可聚焦；播报走独立的 status 活区', async () => {
    const l = makeLog()
    await flush()
    const viewport = l.api().getViewportProps() as Record<string, unknown>
    expect(viewport).toMatchObject({ 'role': 'log', 'aria-live': 'off', 'aria-label': 'Log', 'tabindex': 0 })
    expect(viewport['aria-busy']).toBeUndefined()
    expect(l.api().getLiveRegionProps()).toMatchObject({ 'role': 'status', 'aria-live': 'polite', 'aria-atomic': 'true' })
    l.stop()
  })

  it('rows 按行高槽位乘出视口高度，非正数与小数一律当没给；loading 置 aria-busy；文案可换', async () => {
    const l = makeLog()
    await flush()
    expect(l.api({ rows: 8 }).rows).toBe(8)
    expect((l.api({ rows: 8 }).getViewportProps() as Record<string, unknown>).style).toEqual({ blockSize: 'calc(var(--xh-log-line-height, var(--xh-text-code-leading)) * 8)' })
    expect(l.api({ rows: 5.7 }).rows).toBe(5)
    expect(l.api({ rows: 0 }).rows).toBeUndefined()
    expect(l.api({ rows: -3 }).rows).toBeUndefined()
    expect((l.api({}).getViewportProps() as Record<string, unknown>).style).toEqual({ blockSize: '' })

    const busy = l.api({ loading: true, translations: { log: '构建日志', scrollToBottom: '回到底部' } })
    expect(busy.loading).toBe(true)
    expect(busy.getViewportProps()).toMatchObject({ 'aria-busy': 'true', 'aria-label': '构建日志' })
    expect(busy.getRootProps()).toMatchObject({ 'data-loading': '' })
    expect(busy.getScrollToEndTriggerProps()).toMatchObject({ 'aria-label': '回到底部' })
    l.stop()
  })

  it('行只拿身份与级别；根落尺寸', async () => {
    const l = makeLog()
    await flush()
    expect(l.api().getLineProps({ level: 'error' })).toMatchObject({ 'data-level': 'error' })
    expect((l.api().getLineProps() as Record<string, unknown>)['data-level']).toBeUndefined()
    expect(l.api({ size: 'sm' }).getRootProps()).toMatchObject({ 'data-size': 'sm' })
    l.stop()
  })
})

describe('logMachine 粘底', () => {
  it('起步在底且粘着：回到底部的按钮收着；用户上滚后解除粘附并露出按钮', async () => {
    const l = makeLog()
    await flush()
    expect(l.api().atBottom).toBe(true)
    expect(l.api().sticking).toBe(true)
    expect(l.api().showScrollToEndTrigger).toBe(false)
    expect(l.api().getRootProps()).toMatchObject({ 'data-at-bottom': '', 'data-sticking': '' })
    expect(l.api().getScrollToEndTriggerProps()).toMatchObject({ 'type': 'button', 'hidden': true, 'data-state': 'hidden' })
    // 回底钮接 Action Control 的 floating 档：ghost 形态、比日志低一档（缺省 sm，32px 正方盒），材质由皮肤给 frosted
    expect(l.api().getScrollToEndTriggerProps()).toMatchObject({
      'data-xh-action-control': '',
      'data-xh-action-profile': 'floating',
      'data-xh-action-variant': 'ghost',
      'data-xh-action-display': 'always',
      'data-xh-action-size': 'sm',
    })

    // 先滚到底附近再往上滚：scrollTop 变小即视为用户上滚
    await l.scroll(800)
    await l.scroll(300)
    expect(l.api().atBottom).toBe(false)
    expect(l.api().sticking).toBe(false)
    expect(l.api().showScrollToEndTrigger).toBe(true)
    expect((l.api().getScrollToEndTriggerProps() as Record<string, unknown>).hidden).toBeUndefined()
    expect(l.changes.at(-1)).toEqual({ atBottom: false, sticking: false })
    l.stop()
  })

  it('滚回阈值内恢复粘附；点按钮把视口滚到底', async () => {
    const l = makeLog({ threshold: 40 })
    await flush()
    await l.scroll(800)
    await l.scroll(300)
    expect(l.api().sticking).toBe(false)
    await l.scroll(770)
    expect(l.api().atBottom).toBe(true)
    expect(l.api().sticking).toBe(true)

    await l.scroll(100)
    l.viewport.scrollTo = ((o: { top: number }) => {
      l.metrics.scrollTop = o.top
    }) as unknown as HTMLElement['scrollTo']
    ;(l.api().getScrollToEndTriggerProps() as { onClick: () => void }).onClick()
    expect(l.metrics.scrollTop).toBe(1000)
    l.stop()
  })
})

// ══ 按压通道 ══

type Dict = Record<string, unknown>
const key = (name: string): KeyboardEvent => ({ key: name, repeat: false, isComposing: false, keyCode: 0 } as KeyboardEvent)
const fire = (props: Dict, name: string, event: unknown): void => (props[name] as (e: unknown) => void)(event)

describe('logMachine 按压通道：Space / Enter 与触屏按住投影 data-pressed', () => {
  it('离底后：keydown 在场、keyup 撤下；触屏按下在场、抬起 / 取消撤下；失焦撤下；鼠标按下不走这一路；粘底状态不动', async () => {
    const l = makeLog()
    await flush()
    await l.scroll(800)
    await l.scroll(300)
    const trigger = (): Dict => l.api().getScrollToEndTriggerProps() as Dict
    expect(trigger().hidden).toBeUndefined()
    expect(trigger()['data-pressed']).toBeUndefined()
    fire(trigger(), 'onKeyDown', key(' '))
    expect(trigger()['data-pressed']).toBe('')
    fire(trigger(), 'onKeyUp', key(' '))
    expect(trigger()['data-pressed']).toBeUndefined()
    fire(trigger(), 'onKeyDown', key('Enter'))
    expect(trigger()['data-pressed']).toBe('')
    fire(trigger(), 'onBlur', {})
    expect(trigger()['data-pressed']).toBeUndefined()
    fire(trigger(), 'onPointerDown', { pointerType: 'touch' })
    expect(trigger()['data-pressed']).toBe('')
    fire(trigger(), 'onPointerCancel', {})
    expect(trigger()['data-pressed']).toBeUndefined()
    fire(trigger(), 'onPointerDown', { pointerType: 'touch' })
    expect(trigger()['data-pressed']).toBe('')
    fire(trigger(), 'onPointerUp', {})
    expect(trigger()['data-pressed']).toBeUndefined()
    fire(trigger(), 'onPointerDown', { pointerType: 'mouse' })
    expect(trigger()['data-pressed']).toBeUndefined()
    expect(l.api().atBottom).toBe(false)
    expect(l.api().sticking).toBe(false)
    l.stop()
  })

  it('在底时按钮带 hidden，按住不进；按住途中回到底部、按钮收起时自收；再离底后照常', async () => {
    const l = makeLog({ threshold: 40 })
    await flush()
    const trigger = (): Dict => l.api().getScrollToEndTriggerProps() as Dict
    expect(trigger().hidden).toBe(true)
    fire(trigger(), 'onKeyDown', key(' '))
    expect(trigger()['data-pressed']).toBeUndefined()
    fire(trigger(), 'onPointerDown', { pointerType: 'touch' })
    expect(trigger()['data-pressed']).toBeUndefined()

    await l.scroll(800)
    await l.scroll(300)
    fire(trigger(), 'onKeyDown', key('Enter'))
    expect(trigger()['data-pressed']).toBe('')
    // Enter 在 keydown 即 click：滚回底部、按钮收起，不会再来 keyup
    await l.scroll(770)
    expect(l.api().atBottom).toBe(true)
    expect(trigger().hidden).toBe(true)
    expect(trigger()['data-pressed']).toBeUndefined()

    await l.scroll(300)
    fire(trigger(), 'onKeyDown', key(' '))
    expect(trigger()['data-pressed']).toBe('')
    fire(trigger(), 'onKeyUp', key(' '))
    expect(trigger()['data-pressed']).toBeUndefined()
    l.stop()
  })
})

const ESC = '\u001B'

describe('parseAnsi', () => {
  it('前景色、粗体与复位拆成一段段，相邻同样式并成一段', () => {
    expect(parseAnsi(`${ESC}[31merror${ESC}[0m: disk full`)).toEqual([
      { text: 'error', fg: 'red' },
      { text: ': disk full' },
    ])
    expect(parseAnsi(`${ESC}[1;32mok${ESC}[22m done${ESC}[39m`)).toEqual([
      { text: 'ok', fg: 'green', bold: true },
      { text: ' done', fg: 'green' },
    ])
  })

  it('90–97 记 bright；256 色只认前 16 个，高位与真彩色不着色', () => {
    expect(parseAnsi(`${ESC}[94minfo`)).toEqual([{ text: 'info', fg: 'blue', bright: true }])
    expect(parseAnsi(`${ESC}[38;5;9mhot`)).toEqual([{ text: 'hot', fg: 'red', bright: true }])
    expect(parseAnsi(`${ESC}[38;5;208mx${ESC}[38;2;255;0;0my`)).toEqual([{ text: 'xy' }])
  })

  it('背景色不着色；斜体、下划线与暗淡各自开关', () => {
    expect(parseAnsi(`${ESC}[41;3mhi${ESC}[23;4m u${ESC}[24;2m d`)).toEqual([
      { text: 'hi', italic: true },
      { text: ' u', underline: true },
      { text: ' d', dim: true },
    ])
  })

  it('不是 SGR 的转义（清行、挪光标、改标题）整段去掉', () => {
    expect(stripAnsi(`${ESC}[2K${ESC}[1Gprogress${ESC}]0;title\u0007 50%`)).toBe('progress 50%')
  })

  it('没有转义的文字原样一段；空串没有段', () => {
    expect(parseAnsi('plain')).toEqual([{ text: 'plain' }])
    expect(parseAnsi('')).toEqual([])
    expect(parseAnsi(`${ESC}[31m${ESC}[0m`)).toEqual([])
  })
})

describe('connectLog 着色与过滤', () => {
  it('一段 ANSI 文字的颜色与字形写成 data 属性', async () => {
    const l = makeLog()
    await flush()
    expect(l.api().getSegmentProps({ text: 'x', fg: 'red', bright: true, bold: true })).toMatchObject({
      'data-scope': 'log',
      'data-part': 'segment',
      'data-fg': 'red',
      'data-bright': '',
      'data-bold': '',
    })
    l.stop()
  })

  it('levels 只留所选级别的行，没写级别的行不受影响', async () => {
    const l = makeLog()
    await flush()
    const api = l.api({ levels: ['warn', 'error'] })
    expect((api.getLineProps({ level: 'info' }) as Record<string, unknown>).hidden).toBe(true)
    expect((api.getLineProps({ level: 'error' }) as Record<string, unknown>).hidden).toBeUndefined()
    expect((api.getLineProps() as Record<string, unknown>).hidden).toBeUndefined()
    expect(api.isLevelVisible('debug')).toBe(false)
    expect(l.api().isLevelVisible('debug')).toBe(true)
    l.stop()
  })
})

describe('log 与虚拟滚动接线', () => {
  it('接了 Virtualizer：视口不占 Tab 位、带 data-virtualized，粘底跟 Virtualizer 的滚动层走', async () => {
    const scroller = document.createElement('div')
    const inner = document.createElement('div')
    scroller.append(inner)
    document.body.append(scroller)
    const metrics = { scrollTop: 0, scrollHeight: 2000, clientHeight: 200 }
    for (const k of ['scrollTop', 'scrollHeight', 'clientHeight'] as const) {
      Object.defineProperty(scroller, k, {
        get: () => metrics[k],
        set: (v: number) => {
          metrics[k] = v
        },
        configurable: true,
      })
    }
    const virtualizer = {
      count: 100,
      scrollToIndex: () => {},
      focusIndex: () => {},
      getRenderedItemRoots: () => [],
      getViewportElement: () => scroller,
      getContentElement: () => inner,
    }
    const l = makeLog({ virtualizer })
    await flush()
    const viewport = l.api().getViewportProps() as Record<string, unknown>
    expect(viewport.tabindex).toBeUndefined()
    expect(viewport['data-virtualized']).toBe('')
    expect(l.api().virtualized).toBe(true)

    // 在 Virtualizer 的视口里上滚：日志离底、回底钮冒出来
    metrics.scrollTop = 200
    scroller.dispatchEvent(new Event('scroll'))
    await flush()
    expect(l.api().atBottom).toBe(false)
    l.stop()
    scroller.remove()
  })
})

describe('回底钮的尺寸档', () => {
  it.each([['sm', 'sm'], ['md', 'sm'], ['lg', 'md']] as const)('日志 %s 档时回底钮取 %s：比组件低一档、最低 sm', (size, expected) => {
    const l = makeLog({}, { size })
    expect((l.api().getScrollToEndTriggerProps() as Dict)['data-xh-action-size']).toBe(expected)
    l.stop()
  })
})
