// @vitest-environment jsdom

import type { Service } from '@xihan-ui/machine'
import type { PanelConstraint, SplitterPanelProps, SplitterSchema } from '../src/splitter'
import { normalizeProps } from '@xihan-ui/core'
import { createService } from '@xihan-ui/machine'
import { createVanillaRuntime } from '@xihan-ui/machine/vanilla'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  collapsePanel,
  connectSplitter,
  equalSizes,
  expandPanel,
  isCollapsed,
  normalizeSizes,
  panelConstraint,
  panelConstraints,
  panelRange,
  resizePanels,
  setBoundarySize,
  splitterMachine,
} from '../src/splitter'

type Props = SplitterSchema['props']
type Dict = Record<string, unknown>

/** props 用可变对象承载：受控用例要在机器活着的时候从外面改写 size。 */
function makeService(props: Props = {}): Service<SplitterSchema> {
  const runtime = createVanillaRuntime()
  const service = createService(splitterMachine, { props: () => props, runtime })
  runtime.start()
  return service
}

function api(service: Service<SplitterSchema>) {
  return connectSplitter(service, normalizeProps)
}

function triggerProps(service: Service<SplitterSchema>, index = 0): Dict {
  return api(service).getResizeTriggerProps(index) as Dict
}

function panelProps(service: Service<SplitterSchema>, index = 0): Dict {
  return api(service).getPanelProps(index) as Dict
}

/**
 * 造一个真事件再派发，而不是传个字面量对象：
 * 合成事件默认 cancelable=false，在那种事件上 preventDefault 是空操作，
 * "认下的键要拦住"这条断言会永远为真。
 */
function keydown(key: string, init: KeyboardEventInit = {}): KeyboardEvent {
  return new KeyboardEvent('keydown', { key, cancelable: true, bubbles: true, ...init })
}

function pressKey(service: Service<SplitterSchema>, key: string, index = 0, init?: KeyboardEventInit): KeyboardEvent {
  const event = keydown(key, init)
  ;(triggerProps(service, index).onKeyDown as (e: KeyboardEvent) => void)(event)
  return event
}

function constraintsOf(specs?: SplitterPanelProps[], count = 2): PanelConstraint[] {
  return panelConstraints(specs, count)
}

const sum = (sizes: readonly number[]): number => sizes.reduce((a, b) => a + b, 0)

// ── 拖动用的一套真实节点：容器矩形由测试自己摆，机器在拖拽开始那一刻现量 ──

interface Rig {
  root: HTMLElement
  triggers: HTMLElement[]
  press: (clientX: number, index?: number) => void
}

function mountRig(service: Service<SplitterSchema>, triggerCount = 1, vertical = false): Rig {
  const make = (part: string): HTMLElement => {
    const el = document.createElement('div')
    el.setAttribute('data-scope', 'splitter')
    el.setAttribute('data-part', part)
    return el
  }
  const root = make('root')
  const triggers = Array.from({ length: triggerCount }, () => {
    const el = make('resize-trigger')
    el.tabIndex = 0
    return el
  })
  root.append(...triggers)
  document.body.append(root)

  // jsdom 不做布局，量出来恒是 0×0（机器那边会当成"还没布局"原地不动）。
  // 摆一个 200px 的容器，像素与百分比才有得换算
  root.getBoundingClientRect = () => ({
    x: 0,
    y: 0,
    width: vertical ? 10 : 200,
    height: vertical ? 200 : 10,
    top: 0,
    left: 0,
    right: vertical ? 10 : 200,
    bottom: vertical ? 200 : 10,
    toJSON: () => ({}),
  }) as DOMRect
  service.refs.set('getRootEl', () => root)

  triggers.forEach((el, i) => {
    el.addEventListener('pointerdown', api(service).getResizeTriggerProps(i).onPointerDown as EventListener)
  })

  return {
    root,
    triggers,
    press: (clientX, index = 0) => {
      triggers[index]!.dispatchEvent(
        new PointerEvent('pointerdown', { clientX, clientY: clientX, button: 0, bubbles: true, cancelable: true }),
      )
    },
  }
}

function movePointer(clientX: number, clientY = clientX): void {
  document.dispatchEvent(new PointerEvent('pointermove', { clientX, clientY, bubbles: true }))
}

afterEach(() => {
  document.body.innerHTML = ''
})

// ══ 纯函数：百分比重分配 ══

describe('panelConstraint 缺省与自纠', () => {
  it('什么都不给就是 0-100 随便走、不可折叠', () => {
    expect(panelConstraint(undefined)).toEqual({ min: 0, max: 100, collapsible: false, collapsedSize: 0 })
  })

  it('min / max 写反时不产生上下颠倒的区间', () => {
    // 颠倒的区间会让每次 clamp 给出第三个数，面板在两个端点之间来回弹
    expect(panelConstraint({ id: 'a', min: 60, max: 20 })).toMatchObject({ min: 60, max: 60 })
  })

  it('越界的 min / collapsedSize 被夹回来', () => {
    expect(panelConstraint({ id: 'a', min: 200 })).toMatchObject({ min: 100, max: 100 })
    expect(panelConstraint({ id: 'a', max: 30, collapsedSize: 50 })).toMatchObject({ collapsedSize: 30 })
  })
})

describe('equalSizes', () => {
  it('除得尽就是齐的', () => {
    expect(equalSizes(2)).toEqual([50, 50])
    expect(equalSizes(4)).toEqual([25, 25, 25, 25])
  })

  it('除不尽时零头落在最后一块，总和仍是 100', () => {
    expect(equalSizes(3)).toEqual([33.33, 33.33, 33.34])
    expect(sum(equalSizes(3))).toBeCloseTo(100, 6)
    expect(sum(equalSizes(7))).toBeCloseTo(100, 6)
  })

  it('零块面板不炸', () => {
    expect(equalSizes(0)).toEqual([])
  })
})

describe('normalizeSizes 归位', () => {
  it('合法输入原样通过（幂等）', () => {
    const cs = constraintsOf()
    expect(normalizeSizes([30, 70], cs)).toEqual([30, 70])
    expect(normalizeSizes(normalizeSizes([30, 70], cs), cs)).toEqual([30, 70])
  })

  it('作者给的是比例时按比例缩到 100，不是把余量全塞给第一块', () => {
    expect(normalizeSizes([1, 2], constraintsOf())).toEqual([33.33, 66.67])
    expect(normalizeSizes([200, 300], constraintsOf())).toEqual([40, 60])
  })

  it('缺项与多项都收得住，总和恒为 100', () => {
    expect(sum(normalizeSizes([60], constraintsOf()))).toBeCloseTo(100, 6)
    expect(normalizeSizes([10, 10, 10], constraintsOf())).toHaveLength(2)
  })

  it('全 0 退到等分，不做除零', () => {
    expect(normalizeSizes([0, 0], constraintsOf())).toEqual([50, 50])
  })

  it('夹住约束后余量让给放得下的那块', () => {
    const cs = constraintsOf([{ id: 'a' }, { id: 'b', max: 20 }])
    // b 只能到 20，剩下的 80 全归 a
    expect(normalizeSizes([50, 50], cs)).toEqual([80, 20])
    expect(sum(normalizeSizes([50, 50], cs))).toBeCloseTo(100, 6)
  })

  it('不把零头塞给折叠着的面板（那等于替用户展开）', () => {
    const cs = constraintsOf([{ id: 'a', collapsible: true }, { id: 'b' }, { id: 'c' }], 3)
    const out = normalizeSizes([0, 30, 30], cs)
    expect(out[0]).toBe(0)
    expect(sum(out)).toBeCloseTo(100, 6)
  })
})

describe('resizePanels 两栏', () => {
  const cs = constraintsOf([{ id: 'a', min: 20 }, { id: 'b', min: 30 }])

  it('挪一步：前一块加多少，后一块就减多少', () => {
    expect(resizePanels([50, 50], 0, 10, cs)).toEqual([60, 40])
    expect(resizePanels([50, 50], 0, -10, cs)).toEqual([40, 60])
  })

  it('顶到邻居的 min 就停住，不越过去也不让总和漂掉', () => {
    // b 最少 30，所以 a 最多 70
    const out = resizePanels([50, 50], 0, 40, cs)
    expect(out).toEqual([70, 30])
    expect(sum(out)).toBeCloseTo(100, 6)
  })

  it('顶到自己的 min 同样停住', () => {
    expect(resizePanels([50, 50], 0, -40, cs)).toEqual([20, 80])
  })

  it('原数组不动，返回新数组', () => {
    const before = [50, 50]
    expect(resizePanels(before, 0, 10, cs)).toEqual([60, 40])
    expect(before).toEqual([50, 50])
  })
})

describe('resizePanels 三栏', () => {
  const cs = constraintsOf([{ id: 'a' }, { id: 'b' }, { id: 'c' }], 3)

  it('中间那条只动它两侧的相邻块，前面的一动不动', () => {
    expect(resizePanels([30, 40, 30], 1, 20, cs)).toEqual([30, 60, 10])
  })

  it('相邻块顶到 min 之后，余量继续让给再后面的一块', () => {
    const limited = constraintsOf([{ id: 'a' }, { id: 'b', min: 30 }, { id: 'c' }], 3)
    // 第 0 条要多要 30：b 只让得出 10（40→30），剩下的 20 由 c 让
    const out = resizePanels([40, 40, 20], 0, 30, limited)
    expect(out).toEqual([70, 30, 0])
    expect(sum(out)).toBeCloseTo(100, 6)
  })

  it('后面全部顶死时一步也走不了', () => {
    const stuck = constraintsOf([{ id: 'a' }, { id: 'b', min: 40 }, { id: 'c', min: 20 }], 3)
    expect(resizePanels([40, 40, 20], 0, 30, stuck)).toEqual([40, 40, 20])
  })

  it('最后一条分隔条不去惊动它前面的面板', () => {
    expect(resizePanels([30, 40, 30], 1, -25, cs)).toEqual([30, 15, 55])
  })

  it('后面的面板吃不下时也绝不拿前面的凑数：自己少走一段就是了', () => {
    // c 最多 15，只吃得下 5；剩下的 10 既不能凭空消失，也不能从 a 身上抠——
    // 从 a 身上抠等于一次拖拽同时改了两处布局，用户会看到没碰过的那块自己动了
    const capped = constraintsOf([{ id: 'a' }, { id: 'b' }, { id: 'c', max: 15 }], 3)
    const out = resizePanels([70, 20, 10], 1, -15, capped)
    expect(out).toEqual([70, 15, 15])
    expect(sum(out)).toBeCloseTo(100, 6)
  })
})

describe('panelRange 报的是眼下真能走到的区间', () => {
  it('没人挡时就是自己的上下界', () => {
    const cs = constraintsOf([{ id: 'a', min: 10, max: 80 }, { id: 'b' }])
    expect(panelRange([50, 50], 0, cs)).toEqual({ min: 10, max: 80 })
  })

  it('后面的面板挡住时收窄到走得到的那一段', () => {
    const cs = constraintsOf([{ id: 'a' }, { id: 'b', min: 30, max: 60 }])
    // b 只能在 30-60 之间，于是 a 只能在 40-70 之间
    expect(panelRange([50, 50], 0, cs)).toEqual({ min: 40, max: 70 })
  })

  it('最后一块没有属于自己的分隔条，区间收成一个点', () => {
    expect(panelRange([50, 50], 1, constraintsOf())).toEqual({ min: 50, max: 50 })
  })

  it('区间与 setBoundarySize 说的是同一件事', () => {
    const cs = constraintsOf([{ id: 'a' }, { id: 'b', min: 30, max: 60 }])
    const range = panelRange([50, 50], 0, cs)
    expect(setBoundarySize([50, 50], 0, range.max, cs)).toEqual([70, 30])
    expect(setBoundarySize([50, 50], 0, range.min, cs)).toEqual([40, 60])
    // 越过区间也只走到端点
    expect(setBoundarySize([50, 50], 0, 999, cs)).toEqual([70, 30])
  })
})

describe('折叠与恢复', () => {
  const cs = constraintsOf([{ id: 'a', min: 20, collapsible: true }, { id: 'b' }])

  it('折叠腾出的地方给后面的面板，总和仍是 100', () => {
    const out = collapsePanel([40, 60], 0, cs)
    expect(out).toEqual([0, 100])
    expect(sum(out)).toBeCloseTo(100, 6)
    expect(isCollapsed(out[0]!, cs[0]!)).toBe(true)
  })

  it('折叠可以低于 min：min 管的是"展开着的时候"', () => {
    expect(collapsePanel([40, 60], 0, cs)[0]).toBe(0)
  })

  it('不可折叠的面板一动不动', () => {
    const plain = constraintsOf()
    expect(collapsePanel([40, 60], 0, plain)).toEqual([40, 60])
  })

  it('展开回到给定尺寸，并夹进 min / max', () => {
    expect(expandPanel([0, 100], 0, cs, 40)).toEqual([40, 60])
    // 小于 min 的还原值被顶回 min
    expect(expandPanel([0, 100], 0, cs, 5)).toEqual([20, 80])
  })

  it('最后一块折叠时回头找前面的面板要地方', () => {
    const tail = constraintsOf([{ id: 'a' }, { id: 'b', collapsible: true }])
    expect(collapsePanel([40, 60], 1, tail)).toEqual([100, 0])
    expect(expandPanel([100, 0], 1, tail, 60)).toEqual([40, 60])
  })

  it('collapsedSize 不为 0 时折到那个尺寸', () => {
    const rail = constraintsOf([{ id: 'a', min: 20, collapsible: true, collapsedSize: 5 }, { id: 'b' }])
    const out = collapsePanel([40, 60], 0, rail)
    expect(out).toEqual([5, 95])
    expect(isCollapsed(out[0]!, rail[0]!)).toBe(true)
  })
})

describe('总和不变量', () => {
  const cs = constraintsOf([{ id: 'a', min: 15, collapsible: true }, { id: 'b', min: 10, max: 70 }, { id: 'c' }], 3)

  it('连着一串随机操作之后总和仍是 100', () => {
    let sizes = normalizeSizes([33, 33, 34], cs)
    const deltas = [7.5, -22.3, 40, -3.14159, 88, -0.01, 12.5]
    for (const [i, delta] of deltas.entries()) {
      sizes = resizePanels(sizes, i % 2, delta, cs)
      expect(sum(sizes), `第 ${i} 步之后总和应当仍是 100`).toBeCloseTo(100, 6)
      // 顺带守住"逐块都在自己的约束里"，别用总和对了掩盖单块越界
      expect(sizes[1]).toBeLessThanOrEqual(70)
      expect(sizes[2]).toBeGreaterThanOrEqual(0)
    }
    sizes = collapsePanel(sizes, 0, cs)
    expect(sum(sizes)).toBeCloseTo(100, 6)
    sizes = expandPanel(sizes, 0, cs, 30)
    expect(sum(sizes)).toBeCloseTo(100, 6)
  })

  it('两位小数够用：不留浮点尾巴', () => {
    const out = resizePanels([33.33, 33.33, 33.34], 0, 1 / 3, cs)
    for (const v of out) expect(v).toBe(Math.round(v * 100) / 100)
  })
})

// ══ 机器 ══

describe('splitterMachine 布局', () => {
  it('三处声明都没给就是两栏等分', () => {
    expect(makeService().context.get('size')).toEqual([50, 50])
  })

  it('面板块数听 panels / size / defaultSize 中先给的那个', () => {
    expect(makeService({ panels: [{ id: 'a' }, { id: 'b' }, { id: 'c' }] }).context.get('size')).toHaveLength(3)
    expect(makeService({ defaultSize: [20, 30, 25, 25] }).context.get('size')).toHaveLength(4)
  })

  it('defaultSize 先过一遍归位再落地', () => {
    expect(makeService({ defaultSize: [1, 3] }).context.get('size')).toEqual([25, 75])
  })

  it('命令式赋值同样归位', () => {
    const s = makeService()
    s.send({ type: 'SIZE.SET', size: [10, 10] })
    expect(s.context.get('size')).toEqual([50, 50])
  })

  it('方向键步进走 step，Shift 走 largeStep', () => {
    const s = makeService({ step: 2, largeStep: 25 })
    s.send({ type: 'BOUNDARY.STEP', index: 0, direction: 1 })
    expect(s.context.get('size')).toEqual([52, 48])
    s.send({ type: 'BOUNDARY.STEP', index: 0, direction: 1, large: true })
    expect(s.context.get('size')).toEqual([77, 23])
  })

  it('步长缺省是 1% 与 10%', () => {
    const s = makeService()
    s.send({ type: 'BOUNDARY.STEP', index: 0, direction: 1 })
    expect(s.context.get('size')).toEqual([51, 49])
    s.send({ type: 'BOUNDARY.STEP', index: 0, direction: -1, large: true })
    expect(s.context.get('size')).toEqual([41, 59])
  })

  it('端点取眼下能走到的位置', () => {
    const s = makeService({ panels: [{ id: 'a', min: 25 }, { id: 'b', min: 40 }] })
    s.send({ type: 'BOUNDARY.TO_MAX', index: 0 })
    expect(s.context.get('size')).toEqual([60, 40])
    s.send({ type: 'BOUNDARY.TO_MIN', index: 0 })
    expect(s.context.get('size')).toEqual([25, 75])
  })

  it('disabled 时守卫挡住一切写入，包括命令式赋值', () => {
    const s = makeService({ disabled: true })
    s.send({ type: 'BOUNDARY.STEP', index: 0, direction: 1 })
    s.send({ type: 'BOUNDARY.TO_MAX', index: 0 })
    s.send({ type: 'BOUNDARY.SET', index: 0, size: 90 })
    s.send({ type: 'SIZE.SET', size: [10, 90] })
    s.send({ type: 'PANEL.COLLAPSE', index: 0 })
    expect(s.context.get('size')).toEqual([50, 50])
  })

  it('折叠后展开回到折叠前的尺寸，而不是一个凭空的默认值', () => {
    const s = makeService({
      defaultSize: [30, 70],
      panels: [{ id: 'a', min: 20, collapsible: true }, { id: 'b' }],
    })
    s.send({ type: 'PANEL.COLLAPSE', index: 0 })
    expect(s.context.get('size')).toEqual([0, 100])
    s.send({ type: 'PANEL.EXPAND', index: 0 })
    expect(s.context.get('size')).toEqual([30, 70])
  })

  it('一上来就是折叠态时展开退到 min', () => {
    const s = makeService({
      defaultSize: [0, 100],
      panels: [{ id: 'a', min: 25, collapsible: true }, { id: 'b' }],
    })
    s.send({ type: 'PANEL.EXPAND', index: 0 })
    expect(s.context.get('size')).toEqual([25, 75])
  })

  it('不可折叠的面板收不下折叠事件', () => {
    const s = makeService({ defaultSize: [30, 70] })
    s.send({ type: 'PANEL.COLLAPSE', index: 0 })
    expect(s.context.get('size')).toEqual([30, 70])
  })

  it('重复的折叠 / 展开事件不会把记下的尺寸冲掉', () => {
    const s = makeService({
      defaultSize: [30, 70],
      panels: [{ id: 'a', collapsible: true }, { id: 'b' }],
    })
    s.send({ type: 'PANEL.COLLAPSE', index: 0 })
    // 已经折叠着还再折一次：不该把 0 记成"折叠前的尺寸"
    s.send({ type: 'PANEL.COLLAPSE', index: 0 })
    s.send({ type: 'PANEL.EXPAND', index: 0 })
    expect(s.context.get('size')).toEqual([30, 70])
  })

  it('受控 size：内部写入不落地，意图仍从 onSizeChange 送出去', () => {
    const onSizeChange = vi.fn()
    const props: Props = { size: [30, 70], onSizeChange }
    const s = makeService(props)
    s.send({ type: 'BOUNDARY.STEP', index: 0, direction: 1 })
    expect(s.context.get('size')).toEqual([30, 70])
    expect(onSizeChange).toHaveBeenCalledWith({ size: [31, 69] })

    // 宿主写回来了，界面才跟着走
    props.size = [31, 69]
    expect(s.context.get('size')).toEqual([31, 69])
  })

  it('受控值也过归位：宿主写来一份凑不齐 100 的数组不会让布局塌掉', () => {
    const props: Props = { size: [1, 1] }
    const s = makeService(props)
    expect(s.context.get('size')).toEqual([50, 50])
  })

  it('onSizeChangeEnd 只在一次拖拽收尾时发一次，并带上分隔条下标', () => {
    const onSizeChangeEnd = vi.fn()
    const s = makeService({ defaultSize: [30, 40, 30], onSizeChangeEnd })
    s.send({ type: 'BOUNDARY.STEP', index: 1, direction: 1 })
    expect(onSizeChangeEnd).not.toHaveBeenCalled()

    const rig = mountRig(s, 2)
    rig.press(100, 1)
    document.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }))
    expect(onSizeChangeEnd).toHaveBeenCalledTimes(1)
    expect(onSizeChangeEnd).toHaveBeenCalledWith({ size: [30, 41, 29], index: 1 })
  })
})

describe('splitterMachine 指针拖动', () => {
  it('按下不改布局，随后跟着指针走，松手回 idle', () => {
    const s = makeService()
    const rig = mountRig(s)

    rig.press(100)
    expect(s.state.get()).toBe('dragging')
    // 分隔条本来就在指针底下，按下这一刻不该跳
    expect(s.context.get('size')).toEqual([50, 50])

    movePointer(150)
    // 200px 容器里挪了 50px = 25 个百分点
    expect(s.context.get('size')).toEqual([75, 25])

    document.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }))
    expect(s.state.get()).toBe('idle')
  })

  it('每帧从按下那一刻的布局重算：撞到 min 之后指针一回头布局就跟着回来', () => {
    // 增量累加式在这里会卡住：被 min 吞掉的那 30 个百分点再也补不回来，
    // 指针回到起点时面板还停在 40
    const s = makeService({ panels: [{ id: 'a', min: 40 }, { id: 'b' }] })
    const rig = mountRig(s)
    rig.press(100)
    movePointer(20) // 想推到 10%，被 min 顶在 40
    expect(s.context.get('size')).toEqual([40, 60])
    movePointer(120) // 相对起点 +10 个百分点
    expect(s.context.get('size')).toEqual([60, 40])
  })

  it('竖直排布看的是纵坐标', () => {
    const s = makeService({ orientation: 'vertical' })
    const rig = mountRig(s, 1, true)
    rig.press(100)
    movePointer(100, 150)
    expect(s.context.get('size')).toEqual([75, 25])
  })

  it('从右往左排版时指针右移是把前一块压小', () => {
    const s = makeService({ dir: 'rtl' })
    const rig = mountRig(s)
    rig.press(100)
    movePointer(150)
    expect(s.context.get('size')).toEqual([25, 75])
  })

  it('容器还没布局（量出来是 0）时原地不动，不产生 Infinity', () => {
    const s = makeService()
    const rig = mountRig(s)
    rig.root.getBoundingClientRect = () => ({ x: 0, y: 0, width: 0, height: 0, top: 0, left: 0, right: 0, bottom: 0, toJSON: () => ({}) }) as DOMRect
    rig.press(100)
    movePointer(150)
    expect(s.context.get('size')).toEqual([50, 50])
  })

  it('松手后文档上的监听器逐个撤干净，指针再动布局也不跟了', () => {
    // 只断言"布局没跟着动"是咬不住撤除的：DRAG.MOVE 在 idle 下本来就没人接，
    // 监听器全泄漏了这条也照样绿。所以直接盯 add/remove 的配对
    const added = vi.spyOn(document, 'addEventListener')
    const removed = vi.spyOn(document, 'removeEventListener')
    const s = makeService()
    const rig = mountRig(s)
    rig.press(100)
    document.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }))

    for (const type of ['pointermove', 'pointerup', 'pointercancel']) {
      const on = added.mock.calls.filter(c => c[0] === type)
      const off = removed.mock.calls.filter(c => c[0] === type)
      expect(on.length, `${type} 应当装过一次`).toBe(1)
      // 比函数身份而不是次数：撤错了对象等于没撤
      expect(off.map(c => c[1]), `${type} 应当被同一个处理器撤掉`).toContain(on[0]![1])
    }

    movePointer(20)
    expect(s.context.get('size')).toEqual([50, 50])
    added.mockRestore()
    removed.mockRestore()
  })

  it('松手后拖拽依据也清干净，不会被下一场拖拽捡去用', () => {
    const s = makeService()
    const rig = mountRig(s)
    rig.press(100)
    document.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }))
    expect(s.refs.get('drag')).toBeNull()
  })

  it('pointercancel 同样收尾：系统抢走手势不会让状态永远停在 dragging', () => {
    const s = makeService()
    const rig = mountRig(s)
    rig.press(100)
    document.dispatchEvent(new PointerEvent('pointercancel', { bubbles: true }))
    expect(s.state.get()).toBe('idle')
  })

  it('按下的是哪条就拖哪条，焦点跟着落上去', () => {
    const s = makeService({ defaultSize: [30, 40, 30] })
    const rig = mountRig(s, 2)
    rig.press(100, 1)
    expect(s.context.get('activeIndex')).toBe(1)
    expect(document.activeElement).toBe(rig.triggers[1])
    movePointer(120)
    // 只动第 1 条两侧的那两块，第 0 块纹丝不动
    expect(s.context.get('size')).toEqual([30, 50, 20])
  })

  it('禁用时按下不进 dragging，也不装监听器', () => {
    const s = makeService({ disabled: true })
    const rig = mountRig(s)
    rig.press(100)
    expect(s.state.get()).toBe('idle')
    movePointer(150)
    expect(s.context.get('size')).toEqual([50, 50])
  })

  it('右键与中键不当拖动：只有主键才推得动', () => {
    const s = makeService()
    const rig = mountRig(s)
    rig.triggers[0]!.dispatchEvent(new PointerEvent('pointerdown', { clientX: 100, clientY: 100, button: 2, bubbles: true, cancelable: true }))
    expect(s.state.get()).toBe('idle')
    expect(s.context.get('size')).toEqual([50, 50])
  })
})

// ══ connect ══

describe('connectSplitter 键盘', () => {
  it('水平排布认左右两键，按 step 推动并拦住默认行为', () => {
    const s = makeService({ step: 5 })
    expect(pressKey(s, 'ArrowRight').defaultPrevented).toBe(true)
    expect(s.context.get('size')).toEqual([55, 45])
    pressKey(s, 'ArrowLeft')
    expect(s.context.get('size')).toEqual([50, 50])
  })

  it('shift + 方向键走 largeStep', () => {
    const s = makeService()
    pressKey(s, 'ArrowRight', 0, { shiftKey: true })
    expect(s.context.get('size')).toEqual([60, 40])
    pressKey(s, 'ArrowLeft', 0, { shiftKey: true })
    expect(s.context.get('size')).toEqual([50, 50])
  })

  it('水平排布不接上下两键：不动布局也不吞键', () => {
    const s = makeService()
    const event = pressKey(s, 'ArrowDown')
    expect(event.defaultPrevented).toBe(false)
    expect(s.context.get('size')).toEqual([50, 50])
  })

  it('竖直排布反过来：认上下、不接左右', () => {
    const s = makeService({ orientation: 'vertical' })
    expect(pressKey(s, 'ArrowDown').defaultPrevented).toBe(true)
    expect(s.context.get('size')).toEqual([51, 49])
    expect(pressKey(s, 'ArrowRight').defaultPrevented).toBe(false)
    expect(s.context.get('size')).toEqual([51, 49])
  })

  it('从右往左排版只对调左右两键，语义恒是"撑大前一块"', () => {
    const s = makeService({ dir: 'rtl' })
    pressKey(s, 'ArrowLeft')
    expect(s.context.get('size')).toEqual([51, 49])
    pressKey(s, 'ArrowRight')
    expect(s.context.get('size')).toEqual([50, 50])
  })

  it('竖直排布不吃 rtl 的对调', () => {
    const s = makeService({ dir: 'rtl', orientation: 'vertical' })
    pressKey(s, 'ArrowDown')
    expect(s.context.get('size')).toEqual([51, 49])
  })

  it('home / End 推到该面板眼下能到的两端', () => {
    const s = makeService({ panels: [{ id: 'a', min: 20, max: 80 }, { id: 'b' }] })
    expect(pressKey(s, 'End').defaultPrevented).toBe(true)
    expect(s.context.get('size')).toEqual([80, 20])
    pressKey(s, 'Home')
    expect(s.context.get('size')).toEqual([20, 80])
  })

  it('enter 在可折叠的面板上折叠 / 展开', () => {
    const s = makeService({
      defaultSize: [30, 70],
      panels: [{ id: 'a', min: 20, collapsible: true }, { id: 'b' }],
    })
    expect(pressKey(s, 'Enter').defaultPrevented).toBe(true)
    expect(s.context.get('size')).toEqual([0, 100])
    expect(api(s).panels[0]!.collapsed).toBe(true)
    pressKey(s, 'Enter')
    expect(s.context.get('size')).toEqual([30, 70])
    expect(api(s).panels[0]!.collapsed).toBe(false)
  })

  it('面板不可折叠时 Enter 原样放行', () => {
    const s = makeService({ defaultSize: [30, 70] })
    const event = pressKey(s, 'Enter')
    expect(event.defaultPrevented).toBe(false)
    expect(s.context.get('size')).toEqual([30, 70])
  })

  it('带 Ctrl / Meta / Alt 的组合一律放行', () => {
    const s = makeService()
    expect(pressKey(s, 'Home', 0, { ctrlKey: true }).defaultPrevented).toBe(false)
    expect(pressKey(s, 'ArrowRight', 0, { metaKey: true }).defaultPrevented).toBe(false)
    expect(pressKey(s, 'ArrowRight', 0, { altKey: true }).defaultPrevented).toBe(false)
    expect(s.context.get('size')).toEqual([50, 50])
  })

  it('禁用时连键都不接：不 preventDefault 也不动布局', () => {
    const s = makeService({ disabled: true })
    expect(pressKey(s, 'ArrowRight').defaultPrevented).toBe(false)
    expect(pressKey(s, 'Home').defaultPrevented).toBe(false)
    expect(s.context.get('size')).toEqual([50, 50])
  })

  it('按方向键的同时把 activeIndex 挪到这条分隔条上', () => {
    const s = makeService({ defaultSize: [30, 40, 30] })
    pressKey(s, 'ArrowRight', 1)
    expect(s.context.get('activeIndex')).toBe(1)
    expect(s.context.get('size')).toEqual([30, 41, 29])
  })
})

describe('connectSplitter 属性输出', () => {
  it('root 是一组：role=group 并带排布轴', () => {
    const root = api(makeService()).getRootProps() as Dict
    expect(root.role).toBe('group')
    expect(root['aria-orientation']).toBe('horizontal')
    expect(root['data-scope']).toBe('splitter')
    expect(root['data-part']).toBe('root')
  })

  it('分隔条是 separator，三个 aria-value* 与 aria-controls 都写全', () => {
    const s = makeService({ defaultSize: [40, 60], panels: [{ id: 'main', min: 20, max: 80 }, { id: 'side' }] })
    const trigger = triggerProps(s)
    expect(trigger.role).toBe('separator')
    expect(trigger['aria-valuenow']).toBe('40')
    expect(trigger['aria-valuemin']).toBe('20')
    expect(trigger['aria-valuemax']).toBe('80')
    expect(trigger.tabindex).toBe(0)
    expect(trigger['data-index']).toBe('0')
  })

  it('aria-controls 指向它调整的那块面板，不是随便哪一块', () => {
    const s = makeService({ defaultSize: [30, 40, 30], panels: [{ id: 'a' }, { id: 'b' }, { id: 'c' }] })
    expect(triggerProps(s, 0)['aria-controls']).toBe(panelProps(s, 0).id)
    expect(triggerProps(s, 1)['aria-controls']).toBe(panelProps(s, 1).id)
    // 指的是前一块，不是后一块
    expect(triggerProps(s, 0)['aria-controls']).not.toBe(panelProps(s, 1).id)
  })

  it('面板 id 经 scope 派生：同一份 panels 声明用两次也不会撞车', () => {
    const a = makeService({ panels: [{ id: 'main' }, { id: 'side' }] })
    const b = makeService({ panels: [{ id: 'main' }, { id: 'side' }] })
    expect(panelProps(a, 0).id).not.toBe(panelProps(b, 0).id)
  })

  it('分隔条自身的朝向与排布轴垂直', () => {
    expect(triggerProps(makeService())['aria-orientation']).toBe('vertical')
    expect(triggerProps(makeService({ orientation: 'vertical' }))['aria-orientation']).toBe('horizontal')
  })

  it('aria-valuenow 跟着布局走', () => {
    const s = makeService({ defaultSize: [40, 60] })
    pressKey(s, 'ArrowRight')
    expect(triggerProps(s)['aria-valuenow']).toBe('41')
  })

  it('禁用：显式 aria-disabled 且退出 Tab 序列', () => {
    const on = triggerProps(makeService())
    expect(on['aria-disabled']).toBe('false')
    expect(on.tabindex).toBe(0)
    expect(on['data-disabled']).toBeUndefined()

    const off = triggerProps(makeService({ disabled: true }))
    expect(off['aria-disabled']).toBe('true')
    expect(off.tabindex).toBeUndefined()
    expect(off['data-disabled']).toBe('')
  })

  it('面板尺寸写进内联样式，比例由 flex-basis 承担', () => {
    const s = makeService({ defaultSize: [30, 70] })
    expect(panelProps(s, 0).style).toEqual({ flexBasis: '30%', flexGrow: '0', flexShrink: '1' })
    expect(panelProps(s, 1).style).toEqual({ flexBasis: '70%', flexGrow: '0', flexShrink: '1' })
  })

  it('折叠的面板带 data-collapsed', () => {
    const s = makeService({ defaultSize: [30, 70], panels: [{ id: 'a', collapsible: true }, { id: 'b' }] })
    expect(panelProps(s, 0)['data-collapsed']).toBeUndefined()
    s.send({ type: 'PANEL.COLLAPSE', index: 0 })
    expect(panelProps(s, 0)['data-collapsed']).toBe('')
    expect(panelProps(s, 0).style).toMatchObject({ flexBasis: '0%' })
  })

  it('拖动期间只有被抓住的那条带 data-dragging', () => {
    const s = makeService({ defaultSize: [30, 40, 30] })
    const rig = mountRig(s, 2)
    rig.press(100, 1)
    expect(api(s).dragging).toBe(true)
    expect(triggerProps(s, 0)['data-dragging']).toBeUndefined()
    expect(triggerProps(s, 1)['data-dragging']).toBe('')
    expect((api(s).getRootProps() as Dict)['data-dragging']).toBe('')
  })

  it('作者多写的部件不产 NaN：下标夹回真实存在的位置', () => {
    const s = makeService({ defaultSize: [30, 70] })
    expect(panelProps(s, 5)['data-index']).toBe('1')
    expect(panelProps(s, Number.NaN)['data-index']).toBe('0')
    expect(panelProps(s, -3)['data-index']).toBe('0')
    // 两栏只有一条分隔条：多写的那条被夹回第 0 条，推它也只推真实存在的那条
    expect(triggerProps(s, 4)['data-index']).toBe('0')
    pressKey(s, 'ArrowRight', 4)
    expect(s.context.get('size')).toEqual([31, 69])
  })

  it('api 的命令式出口走同一条归位规则', () => {
    const s = makeService({ panels: [{ id: 'a', max: 70 }, { id: 'b' }] })
    api(s).setSize([1, 1])
    expect(s.context.get('size')).toEqual([50, 50])
    api(s).setPanelSize(0, 90)
    expect(s.context.get('size')).toEqual([70, 30])
  })

  it('togglePanel 在不可折叠的面板上是空操作', () => {
    const s = makeService({ defaultSize: [30, 70] })
    api(s).togglePanel(0)
    expect(s.context.get('size')).toEqual([30, 70])
  })

  it('程序化送来的越界分界线下标被夹住，不把尺寸数组撑长', () => {
    // 分界线比面板少一条：三块面板只有 0、1 两条分界线
    const s = makeService({ defaultSize: [30, 40, 30] })
    s.send({ type: 'BOUNDARY.SET', index: 99, size: 10 })
    expect(s.context.get('size')).toHaveLength(3)
    expect(s.context.get('activeIndex')).toBe(1)

    s.send({ type: 'BOUNDARY.SET', index: -3, size: 10 })
    expect(s.context.get('size')).toHaveLength(3)
    expect(s.context.get('size')[0]).toBe(10)
  })

  it('panels 把每块的尺寸、可达区间与折叠态算好交给作者', () => {
    const a = api(makeService({ defaultSize: [30, 70], panels: [{ id: 'main', min: 20 }, { id: 'side', min: 10 }] }))
    expect(a.size).toEqual([30, 70])
    expect(a.panels.map(p => p.id)).toEqual(['main', 'side'])
    expect(a.panels[0]).toMatchObject({ index: 0, size: 30, min: 20, max: 90, collapsible: false, collapsed: false })
  })
})
