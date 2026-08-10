// @vitest-environment jsdom
import type { Service } from '@xihan-ui/machine'
import type { EllipsisApi, EllipsisSchema } from '../src/ellipsis'
import { normalizeProps } from '@xihan-ui/kernel'
import { createService } from '@xihan-ui/machine'
import { createVanillaRuntime } from '@xihan-ui/machine/vanilla'
import { afterEach, describe, expect, it } from 'vitest'
// 直接指向组件目录：包主入口的导出由接线一并补，测试不等它
import { connectEllipsis, ellipsisMachine, isEllipsisOverflowing, resolveEllipsisLines } from '../src/ellipsis'

type Dict = Record<string, unknown>
type Props = Partial<EllipsisSchema['props']>

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

describe('resolveEllipsisLines', () => {
  it('缺省与非有限数一律夹一行', () => {
    expect(resolveEllipsisLines(undefined)).toBe(1)
    expect(resolveEllipsisLines(Number.NaN)).toBe(1)
    expect(resolveEllipsisLines(Number.POSITIVE_INFINITY)).toBe(1)
  })

  it('向下取整，且至少一行', () => {
    // 半行裁不出来，交给 -webkit-line-clamp 会被它自己取整，不如在这里定死
    expect(resolveEllipsisLines(3.7)).toBe(3)
    expect(resolveEllipsisLines(0)).toBe(1)
    expect(resolveEllipsisLines(-4)).toBe(1)
  })
})

describe('isEllipsisOverflowing', () => {
  const metrics = (sw: number, cw: number, sh: number, ch: number) =>
    ({ scrollWidth: sw, clientWidth: cw, scrollHeight: sh, clientHeight: ch })

  it('单行比行内轴，差一格不算', () => {
    // 两个尺寸各自取整，恰好放得下的一行也会差出 1 来
    expect(isEllipsisOverflowing(metrics(101, 100, 0, 0), false)).toBe(false)
    expect(isEllipsisOverflowing(metrics(102, 100, 0, 0), false)).toBe(true)
  })

  it('多行改比块轴：行内轴再长也不算被裁', () => {
    expect(isEllipsisOverflowing(metrics(400, 100, 100, 100), true)).toBe(false)
    expect(isEllipsisOverflowing(metrics(100, 100, 400, 100), true)).toBe(true)
  })

  it('还没量到尺寸（全是 0）时不算被裁', () => {
    expect(isEllipsisOverflowing(metrics(0, 0, 0, 0), false)).toBe(false)
    expect(isEllipsisOverflowing(metrics(0, 0, 0, 0), true)).toBe(false)
  })
})

// ───────────────────────── 机器与 connect ─────────────────────────

interface Box { sw: number, cw: number, sh: number, ch: number }

interface Rig {
  service: Service<EllipsisSchema>
  root: HTMLElement
  api: () => EllipsisApi
  rootProps: () => Dict
  setProps: (next: Props) => void
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
  const service = createService(ellipsisMachine, { props: () => props.get(), runtime })

  const root = document.createElement('div')
  root.setAttribute('data-scope', 'ellipsis')
  root.setAttribute('data-part', 'root')
  // 前后留白与换行照模板里的写法来，验的是它们不会被带进原生提示
  root.textContent = `\n  ${TEXT}\n`
  document.body.appendChild(root)
  stubBox(root, box)

  service.refs.set('getRootEl', () => root)
  runtime.start()
  stops.push(() => runtime.stop())

  const api = (): EllipsisApi => connectEllipsis(service, normalizeProps)
  return {
    service,
    root,
    api,
    rootProps: () => api().getRootProps() as Dict,
    setProps: next => props.set({ ...props.get(), ...next }),
    // 无布局环境没有 ResizeObserver，改完尺寸只能靠内容变动把量测拉起来
    resize: (next) => {
      stubBox(root, next)
      root.appendChild(document.createTextNode(''))
    },
  }
}

describe('ellipsis 量测', () => {
  it('挂载后量一次：被裁了就报出来', async () => {
    const rig = makeRig()
    await settle()
    expect(rig.api().overflowing).toBe(true)
    expect(rig.rootProps()['data-overflowing']).toBe('')
    expect(rig.rootProps()['data-lines']).toBe('1')
    // 行数落进内联自定义属性，皮肤拿它裁行
    expect(rig.rootProps().style).toBe('--xh-_ellipsis-lines: 1')
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
})

describe('ellipsis 展开', () => {
  it('不可展开时根上没有按钮语义', async () => {
    const rig = makeRig()
    await settle()
    const props = rig.rootProps()
    expect(props.role).toBeUndefined()
    expect(props.tabindex).toBeUndefined()
    expect(props['aria-expanded']).toBeUndefined()
    expect(props.onClick).toBeUndefined()
  })

  it('expandable：点一下铺开；铺开着不再量，收回去才重量', async () => {
    const rig = makeRig({ expandable: true })
    await settle()
    expect(rig.rootProps().role).toBe('button')
    expect(rig.rootProps().tabindex).toBe(0)
    expect(rig.rootProps()['aria-expanded']).toBe('false')
    expect(rig.api().overflowing).toBe(true)

    ;(rig.rootProps().onClick as () => void)()
    await settle()
    expect(rig.api().expanded).toBe(true)
    expect(rig.rootProps()['data-expanded']).toBe('')
    expect(rig.rootProps()['aria-expanded']).toBe('true')

    // 裁剪已经撤掉，这时量出来的恒是"装得下"，所以铺开态原地留住上一次的结论
    rig.resize({ sw: 100, cw: 100, sh: 100, ch: 100 })
    await settle()
    expect(rig.api().overflowing).toBe(true)

    ;(rig.rootProps().onClick as () => void)()
    await settle()
    expect(rig.api().expanded).toBe(false)
    expect(rig.api().overflowing).toBe(false)
  })

  it('enter / Space 切换并拦掉 Space 的翻页，其它键不管', async () => {
    const rig = makeRig({ expandable: true })
    await settle()
    const press = (key: string): boolean => {
      const event = new KeyboardEvent('keydown', { key, cancelable: true })
      ;(rig.rootProps().onKeydown as (e: KeyboardEvent) => void)(event)
      return event.defaultPrevented
    }

    expect(press('Enter')).toBe(true)
    await settle()
    expect(rig.api().expanded).toBe(true)

    expect(press(' ')).toBe(true)
    await settle()
    expect(rig.api().expanded).toBe(false)

    expect(press('a')).toBe(false)
    await settle()
    expect(rig.api().expanded).toBe(false)
  })

  it('受控 expanded：只发意图不自改，父写回才铺开', async () => {
    const seen: boolean[] = []
    const rig = makeRig({ expandable: true, expanded: false, onExpandedChange: d => seen.push(d.expanded) })
    await settle()

    ;(rig.rootProps().onClick as () => void)()
    await settle()
    expect(seen).toEqual([true])
    expect(rig.api().expanded).toBe(false)

    rig.setProps({ expanded: true })
    await settle()
    expect(rig.api().expanded).toBe(true)
  })
})

describe('ellipsis 提示', () => {
  it('tooltip：被裁时把整段文字交给 title，模板里的缩进不带进去', async () => {
    const rig = makeRig({ tooltip: true, expandable: true })
    await settle()
    expect(rig.rootProps().title).toBe(TEXT)

    // 铺开着什么都没被裁掉，提示一并撤走
    ;(rig.rootProps().onClick as () => void)()
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
