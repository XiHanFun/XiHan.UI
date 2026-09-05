// @vitest-environment jsdom
import type { StepsApi, StepsSchema } from '../src/steps'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { clampStep, connectSteps, normalizeStepCount, stepsAnatomy, stepsMachine, stepsMeta } from '../src/steps'

type Props = StepsSchema['props']
type Dict = Record<string, unknown>

const COUNT = 3

const listeners = new WeakMap<HTMLElement, Map<string, EventListener>>()

/**
 * 最小 spread：与 WC 侧同一套翻译规则（on 之后全小写做事件名，其余落属性）。
 * 有它才跑得到真实事件流——只比对 connect 的返回值就只能验静态属性，
 * "方向键把焦点送到哪个 trigger 上"这类事实必须有活 DOM 才立得住。
 */
function spread(el: HTMLElement, props: Dict): void {
  for (const [key, raw] of Object.entries(props)) {
    if (key.length > 2 && key.startsWith('on') && key[2]! >= 'A' && key[2]! <= 'Z') {
      const type = key.slice(2).toLowerCase()
      const map = listeners.get(el) ?? new Map<string, EventListener>()
      listeners.set(el, map)
      const prev = map.get(type)
      if (prev)
        el.removeEventListener(type, prev)
      if (typeof raw === 'function') {
        el.addEventListener(type, raw as EventListener)
        map.set(type, raw as EventListener)
      }
      continue
    }
    if (raw === undefined || raw === null || raw === false) {
      el.removeAttribute(key)
      continue
    }
    el.setAttribute(key, String(raw))
  }
}

interface Harness {
  api: () => StepsApi
  list: HTMLElement
  item: (index: number) => HTMLElement
  trigger: (index: number) => HTMLElement
  indicator: (index: number) => HTMLElement
  separator: (index: number) => HTMLElement
  content: (index: number) => HTMLElement
  setProps: (next: Partial<Props>) => void
}

/** 作者标了禁用的步骤（与 DOM 无关的声明，绝不从 DOM 回读——那会读到机器自己写的）。 */
function mount(initial: Partial<Props> = {}, authorDisabled: readonly number[] = []): Harness {
  const props: Partial<Props> = { count: COUNT, ...initial }
  const runtime = createVanillaRuntime()
  const service = createService(stepsMachine, { props: () => props, runtime })
  runtime.start()

  const doc = document
  const root = doc.createElement('div')
  const list = doc.createElement('div')
  root.appendChild(list)

  const items: HTMLElement[] = []
  const triggers: HTMLElement[] = []
  const indicators: HTMLElement[] = []
  const titles: HTMLElement[] = []
  const descriptions: HTMLElement[] = []
  const separators: HTMLElement[] = []
  const contents: HTMLElement[] = []

  for (let i = 0; i < COUNT; i++) {
    const item = doc.createElement('div')
    const trigger = doc.createElement('button')
    const indicator = doc.createElement('span')
    const title = doc.createElement('span')
    const description = doc.createElement('span')
    const separator = doc.createElement('div')
    indicator.textContent = String(i + 1)
    title.textContent = `第 ${i + 1} 步`
    trigger.append(indicator, title, description)
    item.append(trigger, separator)
    list.appendChild(item)

    const content = doc.createElement('div')
    content.textContent = `面板 ${i}`
    root.appendChild(content)

    items.push(item)
    triggers.push(trigger)
    indicators.push(indicator)
    titles.push(title)
    descriptions.push(description)
    separators.push(separator)
    contents.push(content)
  }
  doc.body.appendChild(root)

  const render = (): void => {
    const api = connectSteps(service, normalizeProps)
    spread(root, api.getRootProps() as Dict)
    spread(list, api.getListProps() as Dict)
    for (let i = 0; i < COUNT; i++) {
      const decl = { index: i, disabled: authorDisabled.includes(i) }
      spread(items[i]!, api.getItemProps(decl) as Dict)
      spread(triggers[i]!, api.getTriggerProps(decl) as Dict)
      spread(indicators[i]!, api.getIndicatorProps(decl) as Dict)
      spread(titles[i]!, api.getTitleProps(decl) as Dict)
      spread(descriptions[i]!, api.getDescriptionProps(decl) as Dict)
      spread(separators[i]!, api.getSeparatorProps(decl) as Dict)
      spread(contents[i]!, api.getContentProps({ index: i }) as Dict)
    }
  }

  // 任一 cell 变化即重渲，与两个适配器同语义（受控时内部不写值，因此也不会重渲——
  // 那一路要宿主自己写回 props，由 setProps 承担）
  runtime.subscribe(render)
  render()

  return {
    api: () => connectSteps(service, normalizeProps),
    list,
    item: i => items[i]!,
    trigger: i => triggers[i]!,
    indicator: i => indicators[i]!,
    separator: i => separators[i]!,
    content: i => contents[i]!,
    setProps: (next) => {
      Object.assign(props, next)
      render()
    },
  }
}

/** 合成事件默认 cancelable=false，那样 preventDefault 是空操作、defaultPrevented 永远为假。 */
function press(el: HTMLElement, key: string, init: KeyboardEventInit = {}): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init })
  el.dispatchEvent(event)
  return event
}

function click(el: HTMLElement): void {
  el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
}

/** 焦点落在第几步的 trigger 上；不在任何 trigger 上时给 null。 */
function focusedStep(): string | null {
  return document.activeElement?.getAttribute('data-value') ?? null
}

function stateOf(el: HTMLElement): string | null {
  return el.getAttribute('data-state')
}

/**
 * roving 组内（list + trigger）占着 Tab 位的部件。
 * 面板不算：它是 tabpanel，本来就该各自占一个停靠点，与 roving 无关。
 */
function tabStops(): string[] {
  return [...document.querySelectorAll<HTMLElement>('[data-scope="steps"][data-part="list"], [data-scope="steps"][data-part="trigger"]')]
    .filter(el => el.getAttribute('tabindex') === '0')
    .map(el => `${el.getAttribute('data-part')}${el.getAttribute('data-value') ?? ''}`)
}

afterEach(() => {
  document.body.innerHTML = ''
})

// ── 纯函数 ──────────────────────────────────────────────────────────

describe('normalizeStepCount', () => {
  it('负数、小数、NaN、缺省一律收成非负整数', () => {
    expect(normalizeStepCount(4)).toBe(4)
    expect(normalizeStepCount(4.7)).toBe(4)
    expect(normalizeStepCount(-2)).toBe(0)
    expect(normalizeStepCount(Number.NaN)).toBe(0)
    expect(normalizeStepCount(undefined)).toBe(0)
  })
})

describe('clampStep', () => {
  it('下界 0，上界 count——最后一步之后还留一格"全部完成"', () => {
    expect(clampStep(-1, 3)).toBe(0)
    expect(clampStep(2, 3)).toBe(2)
    // 3 是完成位，不是越界
    expect(clampStep(3, 3)).toBe(3)
    expect(clampStep(4, 3)).toBe(3)
  })

  it('非法与缺省的步序落回 0；count 为 0 时上下界都是 0', () => {
    expect(clampStep(undefined, 3)).toBe(0)
    expect(clampStep(Number.NaN, 3)).toBe(0)
    expect(clampStep(2.9, 3)).toBe(2)
    expect(clampStep(5, 0)).toBe(0)
    expect(clampStep(1, undefined)).toBe(0)
  })
})

// ── 机器 ────────────────────────────────────────────────────────────

describe('stepsMachine', () => {
  it('默认停在第 0 步，defaultValue 决定初值', () => {
    expect(mount().api().value).toBe(0)
    expect(mount({ defaultValue: 2 }).api().value).toBe(2)
    // 越界初值同样夹回来
    expect(mount({ defaultValue: 9 }).api().value).toBe(3)
  })

  it('goToNextStep / goToPrevStep 各走一步，端点停住不回绕；末步之后是完成位', () => {
    const h = mount()
    h.api().goToNextStep()
    expect(h.api().value).toBe(1)
    h.api().goToNextStep()
    h.api().goToNextStep()
    expect(h.api().value).toBe(3)
    expect(h.api().complete).toBe(true)
    // 已在完成位：再按也不该绕回第 0 步
    h.api().goToNextStep()
    expect(h.api().value).toBe(3)

    h.api().goToPrevStep()
    expect(h.api().value).toBe(2)
    expect(h.api().complete).toBe(false)
    h.api().goToPrevStep()
    h.api().goToPrevStep()
    h.api().goToPrevStep()
    expect(h.api().value).toBe(0)
  })

  it('setValue 越界的步序在写入口就夹掉', () => {
    const h = mount()
    h.api().setValue(99)
    expect(h.api().value).toBe(3)
    h.api().setValue(-5)
    expect(h.api().value).toBe(0)
  })

  it('setValue 不认 linear：作者自己的代码放行，不该被拦用户乱跳的那把锁挡住', () => {
    const h = mount({ linear: true })
    h.api().setValue(2)
    expect(h.api().value).toBe(2)
  })

  it('onValueChange 带上新步序，且值没变时不叫', () => {
    const onValueChange = vi.fn()
    const h = mount({ onValueChange })
    h.api().goToNextStep()
    expect(onValueChange).toHaveBeenCalledWith({ value: 1 })

    onValueChange.mockClear()
    h.api().setValue(1)
    // 同一步再点一次不该惊动宿主：作者常在回调里发请求，重复回调就是重复请求
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('受控 value：内部不自改，只发回调；宿主写回后跟着走', () => {
    const onValueChange = vi.fn()
    const h = mount({ value: 1, onValueChange })
    h.api().goToNextStep()
    expect(onValueChange).toHaveBeenCalledWith({ value: 2 })
    // 宿主没写回：界面不该自作主张
    expect(h.api().value).toBe(1)

    h.setProps({ value: 2 })
    expect(h.api().value).toBe(2)
  })

  it('count 变小后，上一步从看得见的那一步起算', () => {
    const h = mount({ defaultValue: 3 })
    expect(h.api().value).toBe(3)
    h.setProps({ count: 1 })
    // 内部值还停在 3，但界面显示的是夹过的第 1 步
    expect(h.api().value).toBe(1)
    h.api().goToPrevStep()
    // 从 3 往回走会得到 2（再夹成 1），用户点一下看不到任何变化
    expect(h.api().value).toBe(0)
  })
})

// ── connect：静态属性 ───────────────────────────────────────────────

describe('connectSteps 属性', () => {
  it('root 带朝向；count 缺省时打 data-empty', () => {
    const h = mount({ defaultValue: 1 })
    const root = h.api().getRootProps() as Dict
    expect(root['data-scope']).toBe('steps')
    expect(root['data-orientation']).toBe('horizontal')
    expect(root['data-empty']).toBeUndefined()
    expect(root['data-complete']).toBeUndefined()

    const empty = mount({ count: undefined }).api().getRootProps() as Dict
    expect(empty['data-empty']).toBe('')
  })

  it('走到完成位时 root 打 data-complete，且没有任何一步是 current', () => {
    const h = mount({ defaultValue: 3 })
    expect((h.api().getRootProps() as Dict)['data-complete']).toBe('')
    expect([0, 1, 2].map(i => stateOf(h.trigger(i)))).toEqual(['completed', 'completed', 'completed'])
    expect([0, 1, 2].map(i => h.content(i).hasAttribute('hidden'))).toEqual([true, true, true])
  })

  it('list 是 tablist，朝向随 orientation 走', () => {
    const list = mount({ orientation: 'vertical' }).api().getListProps() as Dict
    expect(list.role).toBe('tablist')
    expect(list['aria-orientation']).toBe('vertical')
    expect(list['data-orientation']).toBe('vertical')
    expect(list['aria-disabled']).toBe('false')
  })

  it('三态：走过的 completed、停着的 current、没走到的 incomplete，六个部件口径一致', () => {
    const h = mount({ defaultValue: 1 })
    const states = (i: number): (string | null)[] => [
      stateOf(h.item(i)),
      stateOf(h.trigger(i)),
      stateOf(h.indicator(i)),
      stateOf(h.separator(i)),
      stateOf(h.content(i)),
    ]
    expect(states(0)).toEqual(Array.from({ length: 5 }).fill('completed'))
    expect(states(1)).toEqual(Array.from({ length: 5 }).fill('current'))
    expect(states(2)).toEqual(Array.from({ length: 5 }).fill('incomplete'))
  })

  it('getItemState 把三态与禁用一并算好，作者自绘图标直接取', () => {
    const h = mount({ defaultValue: 1, linear: true })
    expect(h.api().getItemState({ index: 0 })).toEqual({ index: 0, status: 'completed', completed: true, current: false, disabled: false })
    expect(h.api().getItemState({ index: 1 })).toEqual({ index: 1, status: 'current', completed: false, current: true, disabled: false })
    expect(h.api().getItemState({ index: 2 })).toEqual({ index: 2, status: 'incomplete', completed: false, current: false, disabled: true })
  })

  it('trigger：role=tab + aria-selected/aria-current 成对，posinset/setsize 报出"第几步共几步"', () => {
    const h = mount({ defaultValue: 1 })
    const current = h.trigger(1)
    const other = h.trigger(2)
    expect(current.getAttribute('role')).toBe('tab')
    expect(current.getAttribute('type')).toBe('button')
    expect(current.getAttribute('aria-selected')).toBe('true')
    expect(current.getAttribute('aria-current')).toBe('step')
    expect(current.getAttribute('aria-posinset')).toBe('2')
    expect(current.getAttribute('aria-setsize')).toBe('3')
    expect(current.getAttribute('data-value')).toBe('1')
    expect(other.getAttribute('aria-selected')).toBe('false')
    // aria-current 的默认值就是 "false"，省略即"不是当前项"
    expect(other.getAttribute('aria-current')).toBeNull()
  })

  it('count 缺省时不写 posinset/setsize：写 setsize="0" 等于对读屏说"这个集合是空的"', () => {
    const t = mount({ count: undefined }).api().getTriggerProps({ index: 0 }) as Dict
    expect(t['aria-posinset']).toBeUndefined()
    expect(t['aria-setsize']).toBeUndefined()
  })

  it('trigger 与 content 按下标逐对互指', () => {
    const h = mount()
    for (let i = 0; i < COUNT; i++) {
      expect(h.trigger(i).getAttribute('aria-controls')).toBe(h.content(i).getAttribute('id'))
      expect(h.content(i).getAttribute('aria-labelledby')).toBe(h.trigger(i).getAttribute('id'))
    }
  })

  it('面板常挂，只有当前步那份不带 hidden', () => {
    const h = mount({ defaultValue: 1 })
    expect([0, 1, 2].map(i => h.content(i).hasAttribute('hidden'))).toEqual([true, false, true])
    expect(h.content(1).getAttribute('role')).toBe('tabpanel')
    expect(h.content(1).getAttribute('tabindex')).toBe('0')
  })

  it('indicator / separator 对读屏隐藏：序号与连线都是视觉的，读屏那边由 posinset 负责', () => {
    const h = mount()
    expect(h.indicator(0).getAttribute('aria-hidden')).toBe('true')
    expect(h.separator(0).getAttribute('aria-hidden')).toBe('true')
    expect(h.separator(0).getAttribute('data-orientation')).toBe('horizontal')
  })
})

// ── roving tabindex ─────────────────────────────────────────────────

describe('connectSteps roving tabindex', () => {
  it('条目侧只有锚点那一个 Tab 位，锚点落在当前步上', () => {
    const h = mount({ defaultValue: 1 })
    expect([0, 1, 2].map(i => h.trigger(i).getAttribute('tabindex'))).toEqual(['-1', '0', '-1'])
    // 焦点还在组外，容器一并兜着：锚点未必有对应条目（见下一条），
    // 判据只能是"焦点在不在组内"，不能是"锚点在不在"
    expect(h.list.getAttribute('tabindex')).toBe('0')
  })

  it('锚点没有对应条目时（走到完成位）由 list 兜底，整组不脱序', () => {
    const h = mount({ defaultValue: 3 })
    expect([0, 1, 2].map(i => h.trigger(i).getAttribute('tabindex'))).toEqual(['-1', '-1', '-1'])
    expect(h.list.getAttribute('tabindex')).toBe('0')
    expect(tabStops()).toEqual(['list'])
  })

  it('整组禁用：一个 Tab 停靠点都不留，list 自己也不可聚焦', () => {
    const h = mount({ disabled: true })
    expect(tabStops()).toEqual([])
    // trigger 是原生 button，不写 tabindex 它照样可聚焦——必须显式给 -1
    expect([0, 1, 2].map(i => h.trigger(i).getAttribute('tabindex'))).toEqual(['-1', '-1', '-1'])
    expect(h.list.hasAttribute('tabindex')).toBe(false)
  })

  it('焦点进入某个 trigger 后锚点跟着焦点走，list 让位；焦点离组则交还当前步', () => {
    const h = mount({ defaultValue: 0 })
    h.trigger(2).focus()
    expect(tabStops()).toEqual(['trigger2'])
    expect(h.list.getAttribute('tabindex')).toBe('-1')
    // 焦点走了但步序没动
    expect(h.api().value).toBe(0)

    h.trigger(2).blur()
    expect(h.api().focusedStep).toBeNull()
    // 焦点回到组外：Tab 位交还当前步，容器重新兜底
    expect(tabStops()).toEqual(['list', 'trigger0'])
  })

  it('焦点从组外落到 list：转投锚点那一步，落焦不等于切步', () => {
    const h = mount({ defaultValue: 1 })
    h.list.dispatchEvent(new FocusEvent('focus', { relatedTarget: document.body }))
    expect(focusedStep()).toBe('1')
    expect(h.api().value).toBe(1)
  })

  it('锚点那一步没有对应条目时，容器把焦点转投给首个可停留条目', () => {
    const h = mount({ defaultValue: 3 })
    h.list.dispatchEvent(new FocusEvent('focus', { relatedTarget: document.body }))
    expect(focusedStep()).toBe('0')
  })

  it('组内往外退时容器不抢焦点，否则 Shift+Tab 会把人困在组里', () => {
    const h = mount({ defaultValue: 1 })
    h.trigger(0).focus()
    h.list.dispatchEvent(new FocusEvent('focus', { relatedTarget: h.trigger(0) }))
    expect(focusedStep()).toBe('0')
  })
})

// ── 键盘 ────────────────────────────────────────────────────────────

describe('connectSteps 键盘', () => {
  it('arrowRight / ArrowLeft 只搬焦点，不改步序；两端不回绕', () => {
    const h = mount({ defaultValue: 0 })
    h.trigger(0).focus()
    press(h.list, 'ArrowRight')
    expect(focusedStep()).toBe('1')
    expect(h.api().value).toBe(0)

    press(h.list, 'ArrowLeft')
    expect(focusedStep()).toBe('0')
    // 首个再往前：不回绕到末个
    press(h.list, 'ArrowLeft')
    expect(focusedStep()).toBe('0')

    press(h.list, 'ArrowRight', {})
    press(h.list, 'ArrowRight')
    expect(focusedStep()).toBe('2')
    press(h.list, 'ArrowRight')
    expect(focusedStep()).toBe('2')
  })

  it('home / End 跳到首尾 trigger', () => {
    const h = mount({ defaultValue: 1 })
    h.trigger(1).focus()
    press(h.list, 'End')
    expect(focusedStep()).toBe('2')
    press(h.list, 'Home')
    expect(focusedStep()).toBe('0')
  })

  it('enter / Space 把当前步切到焦点所在的那一步', () => {
    const h = mount({ defaultValue: 0 })
    h.trigger(0).focus()
    press(h.list, 'ArrowRight')
    expect(h.api().value).toBe(0)
    const enter = press(document.activeElement as HTMLElement, 'Enter')
    expect(h.api().value).toBe(1)
    expect(enter.defaultPrevented).toBe(true)

    press(h.list, 'ArrowRight')
    press(document.activeElement as HTMLElement, ' ')
    expect(h.api().value).toBe(2)
  })

  it('横排里 ArrowDown 不归导航管：不 preventDefault，焦点也不动', () => {
    const h = mount()
    h.trigger(0).focus()
    const event = press(h.list, 'ArrowDown')
    expect(event.defaultPrevented).toBe(false)
    expect(focusedStep()).toBe('0')
  })

  it('orientation=vertical：ArrowDown 成为下一个，ArrowRight 反而不归导航管', () => {
    const h = mount({ orientation: 'vertical' })
    h.trigger(0).focus()
    press(h.list, 'ArrowDown')
    expect(focusedStep()).toBe('1')
    const event = press(h.list, 'ArrowRight')
    expect(event.defaultPrevented).toBe(false)
    expect(focusedStep()).toBe('1')
  })

  it('dir=rtl：水平轴左右镜像，ArrowRight 走上一个', () => {
    const h = mount({ dir: 'rtl', defaultValue: 1 })
    h.trigger(1).focus()
    press(h.list, 'ArrowRight')
    expect(focusedStep()).toBe('0')
    press(h.list, 'ArrowLeft')
    expect(focusedStep()).toBe('1')
  })

  it('带修饰键的组合不归导航管：Ctrl+Home 该留给浏览器', () => {
    const h = mount()
    h.trigger(1).focus()
    const event = press(h.list, 'Home', { ctrlKey: true })
    expect(event.defaultPrevented).toBe(false)
    expect(focusedStep()).toBe('1')
  })

  it('整组禁用时按键一概不接，也不 preventDefault', () => {
    const h = mount({ disabled: true, defaultValue: 1 })
    h.trigger(1).focus()
    const event = press(h.list, 'ArrowRight')
    expect(event.defaultPrevented).toBe(false)
    expect(focusedStep()).toBe('1')
    press(h.trigger(1), 'Enter')
    expect(h.api().value).toBe(1)
  })
})

// ── 点击与禁用 ──────────────────────────────────────────────────────

describe('connectSteps 点击与禁用', () => {
  it('点 trigger 即切步，面板随之显隐', () => {
    const h = mount({ defaultValue: 0 })
    click(h.trigger(2))
    expect(h.api().value).toBe(2)
    expect([0, 1, 2].map(i => h.content(i).hasAttribute('hidden'))).toEqual([true, true, false])
  })

  it('作者自报禁用的那一步：aria-disabled 而非原生 disabled，点了不动，方向键跳过它', () => {
    const onValueChange = vi.fn()
    const h = mount({ defaultValue: 0, onValueChange }, [1])
    expect(h.trigger(1).getAttribute('aria-disabled')).toBe('true')
    expect(h.trigger(1).hasAttribute('disabled')).toBe(false)
    expect(h.item(1).getAttribute('data-disabled')).toBe('')

    // 禁用的表单控件上 el.click() 会被激活行为短路、事件压根不派发，
    // 断言会恒绿；直接派发合成事件才验得到那道守卫
    click(h.trigger(1))
    expect(h.api().value).toBe(0)
    expect(onValueChange).not.toHaveBeenCalled()

    h.trigger(0).focus()
    press(h.list, 'ArrowRight')
    expect(focusedStep()).toBe('2')
  })

  it('禁用的条目仍可聚焦、仍能当方向键的起点', () => {
    const h = mount({ defaultValue: 0 }, [1])
    h.trigger(1).focus()
    expect(focusedStep()).toBe('1')
    press(h.list, 'ArrowRight')
    expect(focusedStep()).toBe('2')
  })

  it('整组禁用：每一步都禁用，点了不动', () => {
    const h = mount({ disabled: true, defaultValue: 1 })
    expect([0, 1, 2].map(i => h.trigger(i).getAttribute('aria-disabled'))).toEqual(['true', 'true', 'true'])
    click(h.trigger(2))
    expect(h.api().value).toBe(1)
  })
})

// ── linear ──────────────────────────────────────────────────────────

describe('connectSteps linear', () => {
  it('未解锁的步骤（index > value）禁用，走过的与当前这一步照常可点', () => {
    const h = mount({ linear: true, defaultValue: 1 })
    expect([0, 1, 2].map(i => h.trigger(i).getAttribute('aria-disabled'))).toEqual(['false', 'false', 'true'])
    click(h.trigger(0))
    expect(h.api().value).toBe(0)
  })

  it('点未解锁的那一步毫无反应，宿主也收不到回调', () => {
    const onValueChange = vi.fn()
    const h = mount({ linear: true, defaultValue: 0, onValueChange })
    click(h.trigger(2))
    expect(h.api().value).toBe(0)
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('enter 落在未解锁的那一步上同样不认', () => {
    const h = mount({ linear: true, defaultValue: 0 })
    h.trigger(2).focus()
    press(h.trigger(2), 'Enter')
    expect(h.api().value).toBe(0)
  })

  it('方向键跳过未解锁的步骤，于是"往前走"自然停在当前步上', () => {
    const h = mount({ linear: true, defaultValue: 0 })
    h.trigger(0).focus()
    press(h.list, 'ArrowRight')
    expect(focusedStep()).toBe('0')
  })

  it('goToNextStep 不受 linear 影响：linear 拦的是跳，不是走', () => {
    const h = mount({ linear: true, defaultValue: 0 })
    h.api().goToNextStep()
    expect(h.api().value).toBe(1)
    // 走过去之后那一步就解锁了
    expect(h.trigger(1).getAttribute('aria-disabled')).toBe('false')
  })

  it('非 linear 时可以直接跳到还没走到的步', () => {
    const h = mount({ defaultValue: 0 })
    expect(h.trigger(2).getAttribute('aria-disabled')).toBe('false')
    click(h.trigger(2))
    expect(h.api().value).toBe(2)
  })
})

describe('stepsMeta', () => {
  it('必备 part 都在 anatomy 里', () => {
    const declared = new Set<string>(stepsAnatomy.parts)
    expect(stepsMeta.requiredParts.filter(p => !declared.has(p))).toEqual([])
  })
})
