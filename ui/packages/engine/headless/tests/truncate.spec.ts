// @vitest-environment jsdom
import type { Service } from '@xihan-ui/core'
import type { TruncateApi, TruncateSchema } from '../src/truncate'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, describe, expect, it, vi } from 'vitest'
// 直接指向组件目录：包主入口的导出由接线一并补，测试不等它
import { connectTruncate, isTruncateOverflowing, resolveTruncateLines, truncateMachine } from '../src/truncate'

type Dict = Record<string, unknown>
type Props = Partial<TruncateSchema['props']>

/** 效应挂载、measureSoon 与观察器回调都排在微任务里，等它们跑完再断言。 */
async function settle(): Promise<void> {
  for (let i = 0; i < 3; i++)
    await new Promise<void>(r => queueMicrotask(r))
}

const stops: Array<() => void> = []
afterEach(() => {
  while (stops.length) stops.pop()!()
  document.body.innerHTML = ''
})

// ───────────────────────── 纯函数：不碰 DOM ─────────────────────────

describe('resolveTruncateLines', () => {
  it('缺省与非有限数一律夹一行', () => {
    expect(resolveTruncateLines(undefined)).toBe(1)
    expect(resolveTruncateLines(Number.NaN)).toBe(1)
    expect(resolveTruncateLines(Number.POSITIVE_INFINITY)).toBe(1)
  })

  it('向下取整，且至少一行', () => {
    // 半行裁不出来，交给 -webkit-line-clamp 会被它自己取整，不如在这里定死
    expect(resolveTruncateLines(3.7)).toBe(3)
    expect(resolveTruncateLines(0)).toBe(1)
    expect(resolveTruncateLines(-4)).toBe(1)
  })
})

describe('isTruncateOverflowing', () => {
  const metrics = (sw: number, cw: number, sh: number, ch: number) =>
    ({ scrollWidth: sw, clientWidth: cw, scrollHeight: sh, clientHeight: ch })

  it('单行比行内轴，差一格不算', () => {
    // 两个尺寸各自取整，恰好放得下的一行也会差出 1 来
    expect(isTruncateOverflowing(metrics(101, 100, 0, 0), false)).toBe(false)
    expect(isTruncateOverflowing(metrics(102, 100, 0, 0), false)).toBe(true)
  })

  it('多行改比块轴：行内轴再长也不算被裁', () => {
    expect(isTruncateOverflowing(metrics(400, 100, 100, 100), true)).toBe(false)
    expect(isTruncateOverflowing(metrics(100, 100, 400, 100), true)).toBe(true)
  })

  it('还没量到尺寸（全是 0）时不算被裁', () => {
    expect(isTruncateOverflowing(metrics(0, 0, 0, 0), false)).toBe(false)
    expect(isTruncateOverflowing(metrics(0, 0, 0, 0), true)).toBe(false)
  })
})

// ───────────────────────── 机器与 connect ─────────────────────────

interface Box { sw: number, cw: number, sh: number, ch: number }

interface Rig {
  service: Service<TruncateSchema>
  root: HTMLElement
  api: () => TruncateApi
  rootProps: () => Dict
  triggerProps: () => Dict
  setProps: (next: Props) => void
  stop: () => void
  /** 改尺寸并逼观察器重量一次。 */
  resize: (box: Box) => void
}

/** 无布局环境四个尺寸恒是 0，只能原地伪造。 */
function stubBox(el: HTMLElement, box: Box): void {
  const pairs: Array<[string, number]> = [
    ['scrollWidth', box.sw],
    ['clientWidth', box.cw],
    ['scrollHeight', box.sh],
    ['clientHeight', box.ch],
  ]
  for (const [name, value] of pairs)
    Object.defineProperty(el, name, { configurable: true, value })
}

const TEXT = '这一段话长得一行放不下'

function makeRig(initial: Props = {}, box: Box = { sw: 400, cw: 100, sh: 100, ch: 100 }): Rig {
  const runtime = createVanillaRuntime()
  const props = runtime.signal<Props>(initial)
  const service = createService(truncateMachine, { props: () => props.get(), runtime })

  const root = document.createElement('div')
  root.setAttribute('data-scope', 'truncate')
  root.setAttribute('data-part', 'root')
  // 前后留白与换行照模板里的写法来，验的是它们不会被带进原生提示
  root.textContent = `\n  ${TEXT}\n`
  document.body.appendChild(root)
  stubBox(root, box)

  service.refs.set('getRootEl', () => root)
  runtime.start()
  stops.push(() => runtime.stop())

  const api = (): TruncateApi => connectTruncate(service, normalizeProps)
  return {
    service,
    root,
    api,
    rootProps: () => api().getRootProps() as Dict,
    triggerProps: () => api().getTriggerProps() as Dict,
    setProps: next => props.set({ ...props.get(), ...next }),
    stop: () => runtime.stop(),
    // 无布局环境没有 ResizeObserver，改完尺寸只能靠内容变动把量测拉起来
    resize: (next) => {
      stubBox(root, next)
      root.appendChild(document.createTextNode(''))
    },
  }
}

describe('truncate 量测', () => {
  it('挂载后量一次：被裁了就报出来', async () => {
    const rig = makeRig()
    await settle()
    expect(rig.api().overflowing).toBe(true)
    expect(rig.rootProps()['data-overflowing']).toBe('')
    expect(rig.rootProps()['data-lines']).toBe('1')
    // 行数落进内联自定义属性，皮肤拿它裁行
    expect(rig.rootProps().style).toBe('--xh-_truncate-lines: 1')
  })

  it('装得下就不报；尺寸变了跟着翻面并通知一次', async () => {
    const seen: boolean[] = []
    const rig = makeRig(
      { onOverflowChange: d => seen.push(d.overflowing) },
      { sw: 100, cw: 100, sh: 100, ch: 100 },
    )
    await settle()
    expect(rig.api().overflowing).toBe(false)
    // 结论没翻面就不通知
    expect(seen).toEqual([])

    rig.resize({ sw: 400, cw: 100, sh: 100, ch: 100 })
    await settle()
    expect(rig.api().overflowing).toBe(true)
    expect(seen).toEqual([true])
  })

  it('多行改比块轴，data-multiline 一并落上', async () => {
    const rig = makeRig({ lines: 3 }, { sw: 400, cw: 100, sh: 100, ch: 100 })
    await settle()
    expect(rig.api().overflowing).toBe(false)
    expect(rig.rootProps()['data-lines']).toBe('3')
    expect(rig.rootProps()['data-multiline']).toBe('')
  })

  it('换行数就是换了一把尺，会重量一次', async () => {
    const rig = makeRig({ lines: 3 }, { sw: 100, cw: 100, sh: 400, ch: 100 })
    await settle()
    expect(rig.api().overflowing).toBe(true)

    rig.setProps({ lines: 1 })
    await settle()
    expect(rig.api().overflowing).toBe(false)
  })

  it('字体加载完成后重量，并在卸载时清理所属 Document 监听', async () => {
    let resolveReady: (() => void) | undefined
    const ready = new Promise<void>((resolve) => {
      resolveReady = resolve
    })
    const fonts = new EventTarget() as EventTarget & { ready: Promise<void> }
    Object.defineProperty(fonts, 'ready', { value: ready })
    const add = vi.spyOn(fonts, 'addEventListener')
    const remove = vi.spyOn(fonts, 'removeEventListener')
    const previous = Object.getOwnPropertyDescriptor(document, 'fonts')
    Object.defineProperty(document, 'fonts', { configurable: true, value: fonts })
    stops.push(() => {
      if (previous)
        Object.defineProperty(document, 'fonts', previous)
      else
        Reflect.deleteProperty(document, 'fonts')
    })

    const seen: boolean[] = []
    const rig = makeRig({ onOverflowChange: d => seen.push(d.overflowing) })
    await settle()
    expect(rig.api().overflowing).toBe(true)
    expect(add).toHaveBeenCalledWith('loadingdone', expect.any(Function))
    expect(add).toHaveBeenCalledWith('loadingerror', expect.any(Function))

    stubBox(rig.root, { sw: 100, cw: 100, sh: 100, ch: 100 })
    resolveReady!()
    await settle()
    expect(rig.api().overflowing).toBe(false)

    stubBox(rig.root, { sw: 400, cw: 100, sh: 100, ch: 100 })
    fonts.dispatchEvent(new Event('loadingdone'))
    await settle()
    expect(rig.api().overflowing).toBe(true)
    expect(seen).toEqual([true, false, true])

    rig.stop()
    expect(remove).toHaveBeenCalledWith('loadingdone', expect.any(Function))
    expect(remove).toHaveBeenCalledWith('loadingerror', expect.any(Function))
  })
})

describe('truncate 展开', () => {
  it('文字盒子恒没有按钮语义：展开交互全在旁边那颗按钮上', async () => {
    for (const initial of [{}, { expandable: true }]) {
      const rig = makeRig(initial)
      await settle()
      const props = rig.rootProps()
      expect(props.role).toBeUndefined()
      expect(props.tabindex).toBeUndefined()
      expect(props['aria-expanded']).toBeUndefined()
      expect(props.onClick).toBeUndefined()
      expect(props.onKeydown).toBeUndefined()
    }
  })

  it('按钮是原生 button，aria-controls 指回文字盒子，用 Action Control 的文字档', async () => {
    const rig = makeRig({ expandable: true })
    await settle()
    const trigger = rig.triggerProps()
    expect(trigger.type).toBe('button')
    expect(trigger['aria-controls']).toBe(rig.rootProps().id)
    expect(trigger['data-xh-action-control']).toBe('')
    expect(trigger['data-xh-action-profile']).toBe('text')
    expect(trigger['data-xh-action-variant']).toBe('ghost')
  })

  it('expandable：点按钮铺开；铺开着不再量，收回去才重量', async () => {
    const rig = makeRig({ expandable: true })
    await settle()
    expect(rig.triggerProps().hidden).toBeUndefined()
    expect(rig.triggerProps()['aria-expanded']).toBe('false')
    expect(rig.api().triggerLabel).toBe('Show more')
    expect(rig.api().overflowing).toBe(true)

    ;(rig.triggerProps().onClick as () => void)()
    await settle()
    expect(rig.api().open).toBe(true)
    expect(rig.rootProps()['data-state']).toBe('open')
    expect(rig.triggerProps()['aria-expanded']).toBe('true')
    expect(rig.api().triggerLabel).toBe('Show less')

    // 裁剪已经撤掉，这时量出来的恒是"装得下"，所以铺开态原地留住上一次的结论
    rig.resize({ sw: 100, cw: 100, sh: 100, ch: 100 })
    await settle()
    expect(rig.api().overflowing).toBe(true)

    ;(rig.triggerProps().onClick as () => void)()
    await settle()
    expect(rig.api().open).toBe(false)
    expect(rig.api().overflowing).toBe(false)
  })

  it('装得下的短文本：按钮收起不占位，点了也不动', async () => {
    // 按下去什么都不变的按钮不该露出来：读屏会念出一颗按不动的按钮，Tab 也会白停一站
    const rig = makeRig({ expandable: true }, { sw: 100, cw: 100, sh: 100, ch: 100 })
    await settle()
    expect(rig.api().overflowing).toBe(false)
    expect(rig.rootProps()['data-expandable']).toBe('')
    expect(rig.rootProps()['data-state']).toBeUndefined()
    expect(rig.triggerProps().hidden).toBe(true)
    ;(rig.triggerProps().onClick as () => void)()
    await settle()
    expect(rig.api().open).toBe(false)
  })

  it('装不下了按钮当场露出来', async () => {
    const rig = makeRig({ expandable: true }, { sw: 100, cw: 100, sh: 100, ch: 100 })
    await settle()
    expect(rig.triggerProps().hidden).toBe(true)

    rig.resize({ sw: 400, cw: 100, sh: 100, ch: 100 })
    await settle()
    expect(rig.triggerProps().hidden).toBeUndefined()
  })

  it('铺开态恒留着收回去的入口：那一档量不出"被裁"', async () => {
    // 铺开着起步时量测整个跳过，overflowing 停在初值 false，
    // 只按它判就会把这颗按钮撤掉，用户再也收不回去
    const rig = makeRig({ expandable: true, defaultOpen: true }, { sw: 400, cw: 100, sh: 100, ch: 100 })
    await settle()
    expect(rig.api().overflowing).toBe(false)
    expect(rig.triggerProps().hidden).toBeUndefined()
    expect(rig.triggerProps()['aria-expanded']).toBe('true')

    ;(rig.triggerProps().onClick as () => void)()
    await settle()
    expect(rig.api().open).toBe(false)
  })

  it('translations 换掉按钮上的两句文案', async () => {
    const rig = makeRig({ expandable: true, translations: { expand: '展开', collapse: '收起' } })
    await settle()
    expect(rig.api().triggerLabel).toBe('展开')
    ;(rig.triggerProps().onClick as () => void)()
    await settle()
    expect(rig.api().triggerLabel).toBe('收起')
  })

  it('受控 open：只发意图不自改，父写回才铺开', async () => {
    const seen: boolean[] = []
    const rig = makeRig({ expandable: true, open: false, onOpenChange: d => seen.push(d.open) })
    await settle()

    ;(rig.triggerProps().onClick as () => void)()
    await settle()
    expect(seen).toEqual([true])
    expect(rig.api().open).toBe(false)

    rig.setProps({ open: true })
    await settle()
    expect(rig.api().open).toBe(true)
  })
})

describe('truncate 中间省略', () => {
  it('单行真被裁且收着时，把压好空白的整段文字交给皮肤', async () => {
    const rig = makeRig({ position: 'middle' })
    await settle()
    expect(rig.rootProps()['data-position']).toBe('middle')
    expect(rig.rootProps()['data-middle-text']).toBe(TEXT)
  })

  it('装得下、铺开着或多行时不交：中间省略只在单行被裁时成立', async () => {
    const fits = makeRig({ position: 'middle' }, { sw: 100, cw: 100, sh: 100, ch: 100 })
    await settle()
    expect(fits.rootProps()['data-middle-text']).toBeUndefined()

    const opened = makeRig({ position: 'middle', expandable: true })
    await settle()
    ;(opened.triggerProps().onClick as () => void)()
    await settle()
    expect(opened.rootProps()['data-middle-text']).toBeUndefined()

    const multi = makeRig({ position: 'middle', lines: 2 }, { sw: 100, cw: 100, sh: 400, ch: 100 })
    await settle()
    expect(multi.rootProps()['data-position']).toBeUndefined()
    expect(multi.rootProps()['data-middle-text']).toBeUndefined()
  })

  it('缺省末尾省略不写 data-position', async () => {
    const rig = makeRig()
    await settle()
    expect(rig.rootProps()['data-position']).toBeUndefined()
  })
})

describe('truncate 提示', () => {
  it('tooltip：被裁时把整段文字交给 title，模板里的缩进不带进去', async () => {
    const rig = makeRig({ tooltip: true, expandable: true })
    await settle()
    expect(rig.rootProps().title).toBe(TEXT)

    // 铺开着什么都没被裁掉，提示一并撤走
    ;(rig.triggerProps().onClick as () => void)()
    await settle()
    expect(rig.rootProps().title).toBeUndefined()
  })

  it('不开 tooltip 就不写 title，只报 data-overflowing', async () => {
    const rig = makeRig()
    await settle()
    expect(rig.rootProps().title).toBeUndefined()
    expect(rig.rootProps()['data-overflowing']).toBe('')
  })

  it('没被裁时不写 title', async () => {
    const rig = makeRig({ tooltip: true }, { sw: 100, cw: 100, sh: 100, ch: 100 })
    await settle()
    expect(rig.rootProps().title).toBeUndefined()
  })
})
