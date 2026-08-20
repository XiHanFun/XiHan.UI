/**
 * 大写锁定与明暗切换都要真实的活 DOM：前者只有按键事件报得出来，
 * 后者要在切换之后把光标放回输入框，纯逻辑环境里两件都演不出来。
 *
 * @vitest-environment jsdom
 */

import type { Service } from '@xihan-ui/machine'
import type { PasswordInputSchema, PasswordInputValueChangeDetails, PasswordInputVisibilityChangeDetails } from '../src/password-input'
import { normalizeProps } from '@xihan-ui/kernel'
import { createService, FORM_RESET_EVENT } from '@xihan-ui/machine'
import { createVanillaRuntime } from '@xihan-ui/machine/vanilla'
import { afterEach, describe, expect, it } from 'vitest'
// 直接指向组件目录：包主入口的导出由接线一并补，测试不等它
import { connectPasswordInput, passwordInputMachine } from '../src/password-input'

type Props = PasswordInputSchema['props']

const listeners = new WeakMap<HTMLElement, Map<string, EventListener>>()

/** 与两个适配器同一套写入规则：value 当 property 写，其余按属性写。 */
const PROP_KEYS = new Set(['value'])
/** 布尔属性在场即为真，值写成空串而不是 "true"。 */
const BOOLEAN_ATTRS = new Set(['disabled', 'hidden', 'readonly', 'required'])

/**
 * 最小 spread：on 之后全小写做事件名，其余落属性。
 * 有它才跑得到真实事件流——只比对 connect 的返回值验不了「按键报回大写锁定」这类事实。
 */
function spread(el: HTMLElement, props: Record<string, unknown>): void {
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
    if (PROP_KEYS.has(key)) {
      (el as unknown as Record<string, unknown>)[key] = raw ?? ''
      continue
    }
    if (raw === undefined || raw === null || raw === false) {
      el.removeAttribute(key)
      continue
    }
    if (BOOLEAN_ATTRS.has(key)) {
      el.toggleAttribute(key, Boolean(raw))
      continue
    }
    el.setAttribute(key, String(raw))
  }
}

interface Harness {
  root: HTMLElement
  label: HTMLLabelElement
  control: HTMLElement
  input: HTMLInputElement
  trigger: HTMLButtonElement
  indicator: HTMLElement
  service: Service<PasswordInputSchema>
  changes: PasswordInputValueChangeDetails[]
  visibilityChanges: PasswordInputVisibilityChangeDetails[]
  setProps: (next: Partial<Props>) => void
  render: () => void
}

function mount(initial: Partial<Props> = {}): Harness {
  const props: Partial<Props> = { ...initial }
  const changes: PasswordInputValueChangeDetails[] = []
  const visibilityChanges: PasswordInputVisibilityChangeDetails[] = []

  const runtime = createVanillaRuntime()
  // 受控的两个 prop 必须由 signal 承载：宿主写回要能把订阅者唤醒，
  // 直接改普通对象没有任何东西通知机器，重渲那一拍就永远等不到
  const valueSignal = runtime.signal<string | undefined>(initial.value)
  const visibleSignal = runtime.signal<boolean | undefined>(initial.visible)
  const propsVersion = runtime.signal(0)
  const service = createService(passwordInputMachine, {
    props: () => {
      propsVersion.get()
      return {
        ...props,
        value: valueSignal.get(),
        visible: visibleSignal.get(),
        onValueChange: d => changes.push(d),
        onVisibilityChange: d => visibilityChanges.push(d),
      }
    },
    runtime,
  })

  const root = document.createElement('div')
  const label = document.createElement('label')
  const control = document.createElement('div')
  const input = document.createElement('input')
  const trigger = document.createElement('button')
  const indicator = document.createElement('span')
  control.append(input, trigger, indicator)
  root.append(label, control)
  document.body.append(root)

  runtime.start()

  const render = (): void => {
    const api = connectPasswordInput(service, normalizeProps)
    spread(root, api.getRootProps() as Record<string, unknown>)
    spread(label, api.getLabelProps() as Record<string, unknown>)
    spread(control, api.getControlProps() as Record<string, unknown>)
    spread(input, api.getInputProps() as Record<string, unknown>)
    spread(trigger, api.getVisibilityTriggerProps() as Record<string, unknown>)
    spread(indicator, api.getCapsLockIndicatorProps() as Record<string, unknown>)
    // 与两个适配器同一套规则：播报区的文字归组件写
    if (indicator.textContent !== api.capsLockMessage)
      indicator.textContent = api.capsLockMessage
  }

  // 任一 cell 变化即重渲，与两个适配器同语义
  runtime.subscribe(render)
  render()

  return {
    root,
    label,
    control,
    input,
    trigger,
    indicator,
    service,
    changes,
    visibilityChanges,
    setProps: (next) => {
      Object.assign(props, next)
      if ('value' in next)
        valueSignal.set(next.value)
      if ('visible' in next)
        visibleSignal.set(next.visible)
      propsVersion.set(v => v + 1)
      render()
    },
    render,
  }
}

/** 往输入框里真敲一段字：先写 value 再派 input，与浏览器同序。 */
function typeInto(h: Harness, text: string): void {
  h.input.value = text
  h.input.dispatchEvent(new Event('input', { bubbles: true }))
}

/** 派一次带大写锁定状态的按键。 */
function press(h: Harness, type: 'keydown' | 'keyup', capsLock: boolean, key = 'a'): void {
  h.input.dispatchEvent(new KeyboardEvent(type, { key, bubbles: true, cancelable: true, modifierCapsLock: capsLock }))
}

/** 禁用件上的点击守卫：el.click() 会被激活行为短路，只能直接派事件。 */
function dispatchClick(el: HTMLElement): void {
  el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('connectPasswordInput 默认形态', () => {
  it('隐藏态是原生密码框，autocomplete 缺省填旧密码那一档', () => {
    const h = mount()
    expect(h.input.getAttribute('type')).toBe('password')
    expect(h.input.getAttribute('autocomplete')).toBe('current-password')
    expect(h.root.getAttribute('data-empty')).toBe('')
  })

  it('标题的 for 指向输入框本身，点标题才落得进去', () => {
    const h = mount()
    expect(h.label.getAttribute('for')).toBe(h.input.id)
    expect(h.input.id).not.toBe('')
  })

  it('切换钮是 type=button 的原生按钮，名字说的是按下去会发生什么', () => {
    const h = mount()
    expect(h.trigger.getAttribute('type')).toBe('button')
    expect(h.trigger.getAttribute('aria-label')).toBe('Show password')
    expect(h.trigger.getAttribute('aria-controls')).toBe(h.input.id)
    // 名字已经说清了明暗，就不再叠 aria-pressed
    expect(h.trigger.getAttribute('aria-pressed')).toBeNull()
  })

  it('拼写检查、自动大写与自动纠错恒关：明文态下它们会碰到密码', () => {
    const h = mount()
    expect(h.input.getAttribute('spellcheck')).toBe('false')
    expect(h.input.getAttribute('autocapitalize')).toBe('off')
    expect(h.input.getAttribute('autocorrect')).toBe('off')
  })

  it('没开大写锁定时播报区是空的，但节点仍在场、不带 hidden', () => {
    const h = mount()
    expect(h.indicator.textContent).toBe('')
    expect(h.indicator.getAttribute('hidden')).toBeNull()
    expect(h.indicator.getAttribute('data-state')).toBe('hidden')
    expect(h.indicator.getAttribute('role')).toBe('status')
    expect(h.indicator.getAttribute('aria-live')).toBe('polite')
    expect(h.indicator.getAttribute('aria-atomic')).toBe('true')
    expect(h.input.getAttribute('aria-describedby')).toBeNull()
  })

  it('translations 覆盖三句文案', () => {
    const h = mount({
      visible: true,
      translations: { visibilityTriggerHide: '隐藏密码', capsLockOn: '大写锁定已打开' },
    })
    expect(h.trigger.getAttribute('aria-label')).toBe('隐藏密码')
    press(h, 'keydown', true)
    expect(h.indicator.textContent).toBe('大写锁定已打开')
  })
})

describe('connectPasswordInput 明暗切换', () => {
  it('点切换钮翻转明暗：type 换掉、名字跟着换，并派出通知', () => {
    const h = mount()
    h.trigger.click()
    expect(h.input.getAttribute('type')).toBe('text')
    expect(h.trigger.getAttribute('aria-label')).toBe('Hide password')
    expect(h.trigger.getAttribute('data-state')).toBe('visible')
    expect(h.visibilityChanges).toEqual([{ visible: true }])
    h.trigger.click()
    expect(h.input.getAttribute('type')).toBe('password')
    expect(h.visibilityChanges).toEqual([{ visible: true }, { visible: false }])
  })

  it('defaultVisible 只给初值，之后仍可自己翻', () => {
    const h = mount({ defaultVisible: true })
    expect(h.input.getAttribute('type')).toBe('text')
    h.trigger.click()
    expect(h.input.getAttribute('type')).toBe('password')
  })

  it('受控 visible：点了不自改，只发意图；宿主写回才切', () => {
    const h = mount({ visible: false })
    h.trigger.click()
    expect(h.input.getAttribute('type')).toBe('password')
    expect(h.visibilityChanges).toEqual([{ visible: true }])
    h.setProps({ visible: true })
    expect(h.input.getAttribute('type')).toBe('text')
  })

  it('切换之后光标与选中范围原样放回', async () => {
    const h = mount({ defaultValue: 'hunter2' })
    h.input.focus()
    h.input.setSelectionRange(2, 5)
    h.trigger.click()
    // jsdom 换 type 不会动选区，真浏览器会把光标顶到末尾；这里照真浏览器的样子先弄丢它，
    // 否则这条断言不换 type 也成立、验不到放回那一步
    h.input.setSelectionRange(7, 7)
    // 放光标推迟到宿主提交之后，vanilla 运行时把它排在微任务里
    await Promise.resolve()
    expect(h.input.selectionStart).toBe(2)
    expect(h.input.selectionEnd).toBe(5)
  })

  it('切换钮不抢输入框的焦点：点它焦点就该落在它自己身上', () => {
    const h = mount()
    h.input.focus()
    h.trigger.focus()
    h.trigger.click()
    expect(document.activeElement).toBe(h.trigger)
  })

  it('api.setVisible / toggleVisibility 与点按钮同义', () => {
    const h = mount()
    const api = connectPasswordInput(h.service, normalizeProps)
    api.setVisible(true)
    expect(h.service.context.get('visible')).toBe(true)
    api.toggleVisibility()
    expect(h.service.context.get('visible')).toBe(false)
  })
})

describe('connectPasswordInput 大写锁定', () => {
  it('按键报回开着：文案写进播报区，输入框的描述指向它', () => {
    const h = mount()
    press(h, 'keydown', true)
    expect(h.indicator.textContent).toBe('Caps Lock is on')
    expect(h.indicator.getAttribute('data-state')).toBe('visible')
    expect(h.input.getAttribute('aria-describedby')).toBe(h.indicator.id)
  })

  it('下一次按键报回关着：播报区清空，节点仍留在原地', () => {
    const h = mount()
    press(h, 'keydown', true)
    press(h, 'keyup', false)
    expect(h.indicator.textContent).toBe('')
    expect(h.indicator.getAttribute('hidden')).toBeNull()
    expect(h.indicator.isConnected).toBe(true)
    expect(h.input.getAttribute('aria-describedby')).toBeNull()
  })

  it('焦点离开输入框即熄灭：没有按键就再也读不到状态', () => {
    const h = mount()
    press(h, 'keydown', true)
    h.input.dispatchEvent(new FocusEvent('blur'))
    expect(h.indicator.textContent).toBe('')
    expect(h.indicator.getAttribute('data-state')).toBe('hidden')
  })

  it('大写锁定不拦输入：报着开也照样能敲字', () => {
    const h = mount()
    press(h, 'keydown', true)
    typeInto(h, 'HUNTER2')
    expect(h.service.context.get('value')).toBe('HUNTER2')
  })
})

describe('connectPasswordInput 值与禁用', () => {
  it('敲字落进状态并派出通知，root 的 data-empty 随之消失', () => {
    const h = mount()
    typeInto(h, 'hunter2')
    expect(h.service.context.get('value')).toBe('hunter2')
    expect(h.changes).toEqual([{ value: 'hunter2' }])
    expect(h.root.getAttribute('data-empty')).toBeNull()
  })

  it('受控 value：敲字不自改，只发意图；宿主写回后框里以宿主的为准', () => {
    const h = mount({ value: '' })
    typeInto(h, 'hunter2')
    expect(h.service.context.get('value')).toBe('')
    expect(h.changes).toEqual([{ value: 'hunter2' }])
    h.setProps({ value: 'from-host' })
    expect(h.input.value).toBe('from-host')
  })

  it('disabled：输入框与切换钮都带原生 disabled，绕过 DOM 直接点也推不动', () => {
    const h = mount({ defaultValue: 'hunter2', disabled: true })
    expect(h.input.getAttribute('disabled')).toBe('')
    expect(h.trigger.getAttribute('disabled')).toBe('')
    dispatchClick(h.trigger)
    typeInto(h, '换一个')
    expect(h.service.context.get('visible')).toBe(false)
    expect(h.service.context.get('value')).toBe('hunter2')
    expect(h.changes).toEqual([])
    expect(h.visibilityChanges).toEqual([])
  })

  it('readOnly：值写不进，但明暗照切——改的是怎么显示，不是值', () => {
    const h = mount({ defaultValue: 'hunter2', readOnly: true })
    typeInto(h, '换一个')
    expect(h.service.context.get('value')).toBe('hunter2')
    h.trigger.click()
    expect(h.input.getAttribute('type')).toBe('text')
  })

  it('invalid：输入框的 aria-invalid 显式为 true，root 与 control 同步标注', () => {
    const h = mount({ invalid: true })
    expect(h.input.getAttribute('aria-invalid')).toBe('true')
    expect(h.root.getAttribute('data-invalid')).toBe('')
    expect(h.control.getAttribute('data-invalid')).toBe('')
  })
})

describe('passwordInputMachine 表单重置', () => {
  it('值回到 defaultValue，明暗一并收回去', () => {
    const h = mount({ defaultValue: 'hunter2', defaultVisible: false })
    typeInto(h, 'changed')
    h.trigger.click()
    expect(h.service.context.get('visible')).toBe(true)
    h.service.send({ type: FORM_RESET_EVENT })
    expect(h.service.context.get('value')).toBe('hunter2')
    expect(h.service.context.get('visible')).toBe(false)
  })

  it('宿主攥着值又没声明默认值时，重置不动它：那会把宿主的数据抹掉', () => {
    const h = mount({ value: 'from-host' })
    h.service.send({ type: FORM_RESET_EVENT })
    expect(h.changes).toEqual([])
  })
})
