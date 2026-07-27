// @vitest-environment jsdom
import type { TagsInputApi, TagsInputSchema } from '../src/tags-input'
import { normalizeProps } from '@xihan-ui/core'
import { createService } from '@xihan-ui/machine'
import { createVanillaRuntime } from '@xihan-ui/machine/vanilla'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  appendTags,
  connectTagsInput,
  isAtMax,
  isOverflow,
  normalizeTag,
  normalizeTags,
  sameTags,
  splitTags,
  tagsDelimiter,
  tagsInputMachine,
} from '../src/tags-input'

type Props = TagsInputSchema['props']

const listeners = new WeakMap<HTMLElement, Map<string, EventListener>>()

/**
 * 最小 spread：与 WC 侧同一套翻译规则（on 之后全小写做事件名，value 走 property，其余落属性）。
 * 有它才跑得到真实事件流——纯粹比对 connect 的返回值只能验静态属性，
 * "退格落在哪个标签上""删完焦点去了哪儿"这类事实必须有活 DOM 才立得住。
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
    if (key === 'value') {
      (el as HTMLInputElement).value = String(raw ?? '')
      continue
    }
    if (raw === undefined || raw === null || raw === false) {
      el.removeAttribute(key)
      continue
    }
    el.setAttribute(key, String(raw))
  }
}

interface ItemNodes {
  item: HTMLElement
  preview: HTMLElement
  text: HTMLElement
  del: HTMLButtonElement
  editInput: HTMLInputElement
}

interface Harness {
  api: () => TagsInputApi
  root: HTMLElement
  label: HTMLElement
  control: HTMLElement
  input: HTMLInputElement
  clearTrigger: HTMLButtonElement
  hidden: HTMLInputElement
  nodes: (value: string) => ItemNodes
  has: (value: string) => boolean
  tags: () => string[]
  value: () => string[]
  inputValue: () => string
  stateOf: () => string
  /** 直接送事件：适配器才发得出的那几条（如标签节点离场补报）只能从这里验。 */
  send: (event: TagsInputSchema['event']) => void
  setProps: (next: Partial<Props>) => void
  render: () => void
}

function mount(initial: Partial<Props> = {}): Harness {
  const props: Partial<Props> = { ...initial }
  const runtime = createVanillaRuntime()
  const service = createService(tagsInputMachine, { props: () => props, runtime })
  runtime.start()

  const doc = document
  const root = doc.createElement('div')
  const label = doc.createElement('label')
  const control = doc.createElement('div')
  const input = doc.createElement('input')
  const clearTrigger = doc.createElement('button')
  const hidden = doc.createElement('input')
  control.append(input, clearTrigger)
  root.append(label, control, hidden)
  doc.body.appendChild(root)

  const nodes = new Map<string, ItemNodes>()
  const createItem = (value: string): ItemNodes => {
    const item = doc.createElement('div')
    const preview = doc.createElement('span')
    const text = doc.createElement('span')
    const del = doc.createElement('button')
    const editInput = doc.createElement('input')
    text.textContent = value
    preview.append(text, del)
    item.append(preview, editInput)
    return { item, preview, text, del, editInput }
  }

  const render = (): void => {
    const api = connectTagsInput(service, normalizeProps)
    spread(root, api.getRootProps() as Record<string, unknown>)
    spread(label, api.getLabelProps() as Record<string, unknown>)
    spread(control, api.getControlProps() as Record<string, unknown>)
    spread(input, api.getInputProps() as Record<string, unknown>)
    spread(clearTrigger, api.getClearTriggerProps() as Record<string, unknown>)
    spread(hidden, api.getHiddenInputProps() as Record<string, unknown>)
    // 标签节点跟着值走，与 Vue 的 v-for 同语义：没了的移除、新来的建，其余原地复用。
    // 复用而不是整批重建，焦点才留得住（就地编辑与删除按钮都靠这一点）
    const live = new Set(api.value)
    for (const [v, n] of [...nodes]) {
      if (!live.has(v)) {
        n.item.remove()
        nodes.delete(v)
      }
    }
    for (const v of api.value) {
      let n = nodes.get(v)
      if (!n) {
        n = createItem(v)
        nodes.set(v, n)
        control.insertBefore(n.item, input)
      }
      const decl = { value: v }
      spread(n.item, api.getItemProps(decl) as Record<string, unknown>)
      spread(n.preview, api.getItemPreviewProps(decl) as Record<string, unknown>)
      spread(n.text, api.getItemTextProps(decl) as Record<string, unknown>)
      spread(n.del, api.getItemDeleteTriggerProps(decl) as Record<string, unknown>)
      spread(n.editInput, api.getItemInputProps(decl) as Record<string, unknown>)
    }
  }

  // 任一 cell（含状态位）变化即重渲，与两个适配器同语义
  runtime.subscribe(render)
  render()

  return {
    api: () => connectTagsInput(service, normalizeProps),
    root,
    label,
    control,
    input,
    clearTrigger,
    hidden,
    nodes: (v) => {
      const n = nodes.get(v)
      if (!n)
        throw new Error(`标签 ${v} 不在 DOM 里`)
      return n
    },
    has: v => nodes.has(v),
    tags: () => [...nodes.keys()],
    value: () => service.context.get('value'),
    inputValue: () => service.context.get('inputValue'),
    stateOf: () => service.state.get(),
    send: event => service.send(event),
    setProps: (next) => {
      Object.assign(props, next)
      render()
    },
    render,
  }
}

/** 真实输入：先改框里的内容，再派 input 事件。只派事件落不到 value 上。 */
function typeInto(el: HTMLInputElement, text: string): void {
  el.focus()
  el.value = text
  el.setSelectionRange?.(text.length, text.length)
  el.dispatchEvent(new Event('input', { bubbles: true }))
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

function paste(el: HTMLElement, text: string): boolean {
  // jsdom 没有 ClipboardEvent 构造器，自己补一份 clipboardData
  const event = new Event('paste', { bubbles: true, cancelable: true })
  Object.defineProperty(event, 'clipboardData', { value: { getData: () => text } })
  el.dispatchEvent(event)
  return event.defaultPrevented
}

/** 把光标放到输入框最左端：方向键接管与否正是按这个判的。 */
function caretToStart(el: HTMLInputElement): void {
  el.focus()
  el.setSelectionRange?.(0, 0)
}

/** 机器的聚焦副作用推迟到 flush（vanilla 运行时即微任务）之后，等一拍再断言。 */
async function flush(): Promise<void> {
  await Promise.resolve()
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('tags-input 纯函数', () => {
  it('normalizeTag 去首尾空白；splitTags 按分隔符拆并丢掉空白段', () => {
    expect(normalizeTag('  vue  ')).toBe('vue')
    expect(splitTags(' a , b ,, c ', ',')).toEqual(['a', 'b', 'c'])
    expect(splitTags('   ', ',')).toEqual([])
    // 分隔符为空串时整串当一个标签：按空串 split 会把文本劈成一个个字符
    expect(splitTags('a,b', '')).toEqual(['a,b'])
  })

  it('tagsDelimiter 用 ?? 兜底：显式空串是"关掉断词"，不能被当成没给', () => {
    expect(tagsDelimiter(undefined)).toBe(',')
    expect(tagsDelimiter(';')).toBe(';')
    expect(tagsDelimiter('')).toBe('')
  })

  it('appendTags 跳过空白与重复项，只有被上限挡住的才进 rejected', () => {
    expect(appendTags(['a'], ['  ', 'b', 'a'])).toEqual({ value: ['a', 'b'], rejected: [] })
    // 已经在列表里的不算被拒：用户的意图本来就已经达成
    expect(appendTags(['a'], ['a'], { max: 1 })).toEqual({ value: ['a'], rejected: [] })
    expect(appendTags(['a'], ['b', 'c'], { max: 2 })).toEqual({ value: ['a', 'b'], rejected: ['c'] })
    expect(appendTags(['a'], ['b', 'c'], { max: 2, allowOverflow: true }))
      .toEqual({ value: ['a', 'b', 'c'], rejected: [] })
    // max 为 0：一个也加不进去
    expect(appendTags([], ['a'], { max: 0 })).toEqual({ value: [], rejected: ['a'] })
  })

  it('normalizeTags 去空白、丢空项、按首次出现去重', () => {
    expect(normalizeTags([' a ', 'b', 'a', '  ', 'c'])).toEqual(['a', 'b', 'c'])
  })

  it('isAtMax / isOverflow：非法上限按"没给"处理', () => {
    expect(isAtMax(2, 2)).toBe(true)
    expect(isAtMax(1, 2)).toBe(false)
    expect(isAtMax(9, undefined)).toBe(false)
    expect(isAtMax(9, Number.NaN)).toBe(false)
    expect(isAtMax(0, 0)).toBe(true)
    expect(isOverflow(3, 2)).toBe(true)
    expect(isOverflow(2, 2)).toBe(false)
  })

  it('sameTags 逐项比内容，不看引用', () => {
    expect(sameTags(['a', 'b'], ['a', 'b'])).toBe(true)
    expect(sameTags(['a', 'b'], ['b', 'a'])).toBe(false)
    expect(sameTags(['a'], undefined)).toBe(false)
  })
})

describe('tagsInputMachine 值写入', () => {
  it('setValue 去重去空白，且不受 max 约束（整份替换是作者说了算）', () => {
    const h = mount({ max: 1 })
    h.api().setValue([' a ', 'b', 'a', ' '])
    expect(h.value()).toEqual(['a', 'b'])
  })

  it('同一份值重复写入不重复通知：数组按元素比，不看引用', () => {
    const onValueChange = vi.fn()
    const h = mount({ defaultValue: ['a'], onValueChange })
    h.api().setValue(['a'])
    expect(onValueChange).not.toHaveBeenCalled()
    h.api().setValue(['a', 'b'])
    expect(onValueChange).toHaveBeenCalledTimes(1)
    expect(onValueChange).toHaveBeenCalledWith({ value: ['a', 'b'] })
  })

  it('受控 value：内部纹丝不动，回调照发；宿主写回后才生效', () => {
    const onValueChange = vi.fn()
    const h = mount({ value: ['a'], onValueChange })
    h.api().addValue('b')
    expect(h.value()).toEqual(['a'])
    expect(onValueChange).toHaveBeenCalledWith({ value: ['a', 'b'] })
    h.setProps({ value: ['a', 'b'] })
    expect(h.value()).toEqual(['a', 'b'])
  })

  it('受控 inputValue：宿主不写回则框里纹丝不动，回调照发', () => {
    const onInputValueChange = vi.fn()
    const h = mount({ inputValue: 'vue', onInputValueChange })
    typeInto(h.input, 'vuex')
    expect(h.inputValue()).toBe('vue')
    expect(onInputValueChange).toHaveBeenCalledWith({ inputValue: 'vuex' })
    // 值没变宿主不会重渲，框里那段只能由 connect 自己拨回去
    expect(h.input.value).toBe('vue')
  })

  it('disabled / readOnly 时加删改一律被守卫挡下', () => {
    for (const gate of [{ disabled: true }, { readOnly: true }] as Array<Partial<Props>>) {
      const h = mount({ defaultValue: ['a'], editable: true, ...gate })
      h.api().addValue('b')
      h.api().deleteValue('a')
      h.api().clear()
      h.api().edit('a')
      expect(h.value()).toEqual(['a'])
      expect(h.stateOf()).toBe('idle')
    }
  })
})

describe('tagsInputMachine 上限', () => {
  it('顶到上限时这一次整体不生效：值不变、文本原样留在框里', () => {
    const h = mount({ defaultValue: ['a'], max: 2 })
    typeInto(h.input, 'b,c,')
    // b 能进、c 进不去 → 一个都不进，整串留着
    expect(h.value()).toEqual(['a'])
    expect(h.inputValue()).toBe('b,c,')
    expect(h.input.value).toBe('b,c,')
  })

  it('allowOverflow 开着就照加，只在 root/control 上打 data-overflow', () => {
    const h = mount({ defaultValue: ['a', 'b'], max: 2, allowOverflow: true })
    expect(h.root.getAttribute('data-at-max')).toBe('')
    expect(h.root.getAttribute('data-overflow')).toBeNull()
    typeInto(h.input, 'c')
    press(h.input, 'Enter')
    expect(h.value()).toEqual(['a', 'b', 'c'])
    expect(h.root.getAttribute('data-overflow')).toBe('')
    expect(h.control.getAttribute('data-overflow')).toBe('')
  })

  it('max=0：一个标签都加不进去', () => {
    const h = mount({ max: 0 })
    typeInto(h.input, 'a')
    press(h.input, 'Enter')
    expect(h.value()).toEqual([])
    expect(h.root.getAttribute('data-at-max')).toBe('')
  })
})

describe('connectTagsInput 属性输出', () => {
  it('control 是 group 并由 label 命名；label 的 for 指向输入框', () => {
    const h = mount()
    expect(h.control.getAttribute('role')).toBe('group')
    expect(h.control.getAttribute('aria-labelledby')).toBe(h.label.id)
    expect(h.label.getAttribute('for')).toBe(h.input.id)
    // 省略与显式 false 不是一回事：前者是"没说"，后者是"明确说了不是"
    expect(h.control.getAttribute('aria-disabled')).toBe('false')
    expect(h.input.getAttribute('aria-invalid')).toBe('false')
    expect(h.input.getAttribute('aria-labelledby')).toBe(h.label.id)
  })

  it('主输入框不带 name：表单出口是 hidden-input，半截文本不该被提交出去', () => {
    const h = mount({ name: 'tags', defaultValue: ['a', 'b'] })
    expect(h.input.hasAttribute('name')).toBe(false)
    expect(h.hidden.getAttribute('type')).toBe('hidden')
    expect(h.hidden.getAttribute('name')).toBe('tags')
    expect(h.hidden.value).toBe('a,b')
  })

  it('hidden-input 按生效的分隔符拼串，禁用时不参与提交', () => {
    expect(mount({ name: 't', defaultValue: ['a', 'b'], delimiter: ';' }).hidden.value).toBe('a;b')
    expect(mount({ name: 't', defaultValue: ['a'], disabled: true }).hidden.hasAttribute('disabled')).toBe(true)
  })

  it('root 与 control 报同一组闸门与容量标记', () => {
    const h = mount({ disabled: true, readOnly: true, invalid: true })
    for (const el of [h.root, h.control]) {
      expect(el.getAttribute('data-disabled')).toBe('')
      expect(el.getAttribute('data-readonly')).toBe('')
      expect(el.getAttribute('data-invalid')).toBe('')
      expect(el.getAttribute('data-empty')).toBe('')
    }
    expect(h.input.hasAttribute('disabled')).toBe(true)
    expect(h.input.hasAttribute('readonly')).toBe(true)
  })

  it('标签节点带 data-value；删除按钮不占 Tab 位且自带 aria-label', () => {
    const h = mount({ defaultValue: ['vue'] })
    const n = h.nodes('vue')
    expect(n.item.getAttribute('data-value')).toBe('vue')
    expect(n.del.getAttribute('type')).toBe('button')
    expect(n.del.getAttribute('tabindex')).toBe('-1')
    expect(n.del.getAttribute('aria-label')).toBe('Delete vue')
    expect(n.editInput.getAttribute('aria-label')).toBe('Edit vue')
  })

  it('translations 覆盖默认英文文案', () => {
    const h = mount({
      defaultValue: ['vue'],
      translations: { deleteTagTrigger: v => `删除 ${v}`, clearTrigger: '全部清空' },
    })
    expect(h.nodes('vue').del.getAttribute('aria-label')).toBe('删除 vue')
    expect(h.clearTrigger.getAttribute('aria-label')).toBe('全部清空')
    // 只覆盖了两条，第三条仍走默认
    expect(h.nodes('vue').editInput.getAttribute('aria-label')).toBe('Edit vue')
  })

  it('不编辑时 item-input 收起、item-preview 露出（收起而不是卸载）', () => {
    const h = mount({ defaultValue: ['vue'], editable: true })
    const n = h.nodes('vue')
    expect(n.editInput.hasAttribute('hidden')).toBe(true)
    expect(n.preview.hasAttribute('hidden')).toBe(false)
  })

  it('清空按钮：没东西可清时 disabled，有标签或有文本就亮', () => {
    const empty = mount()
    expect(empty.clearTrigger.hasAttribute('disabled')).toBe(true)
    expect(empty.clearTrigger.getAttribute('data-disabled')).toBe('')
    expect(mount({ defaultValue: ['a'] }).clearTrigger.hasAttribute('disabled')).toBe(false)
    expect(mount({ defaultInputValue: 'a' }).clearTrigger.hasAttribute('disabled')).toBe(false)
    expect(mount({ defaultValue: ['a'], readOnly: true }).clearTrigger.hasAttribute('disabled')).toBe(true)
  })

  it('外部把标签换掉后，锚点不再落在一个已经不存在的标签上', () => {
    const h = mount({ value: ['a', 'b'] })
    caretToStart(h.input)
    press(h.input, 'ArrowLeft')
    expect(h.api().highlightedValue).toBe('b')
    // 宿主整份换掉：锚点指着的 b 没了，读侧必须夹回集合内
    h.setProps({ value: ['x'] })
    expect(h.api().highlightedValue).toBeNull()
    expect(h.nodes('x').item.getAttribute('data-highlighted')).toBeNull()
  })
})

describe('输入与断词', () => {
  it('打出分隔符即断词，最后一段留在框里接着打', () => {
    const h = mount()
    typeInto(h.input, 'vue,')
    expect(h.value()).toEqual(['vue'])
    expect(h.input.value).toBe('')
    typeInto(h.input, 'react,sol')
    expect(h.value()).toEqual(['vue', 'react'])
    // 断词后框里只该剩没打完的那一段——值没变宿主不会重渲，得由 connect 自己拨回去
    expect(h.input.value).toBe('sol')
    expect(h.inputValue()).toBe('sol')
  })

  it('连打分隔符只吃掉空白段，不会造出空标签', () => {
    const h = mount()
    typeInto(h.input, ',,')
    expect(h.value()).toEqual([])
    expect(h.input.value).toBe('')
  })

  it('delimiter 显式给空串即关掉断词：逗号只是普通字符', () => {
    const h = mount({ delimiter: '' })
    typeInto(h.input, 'a,b')
    expect(h.value()).toEqual([])
    expect(h.input.value).toBe('a,b')
    press(h.input, 'Enter')
    // 整串成一个标签
    expect(h.value()).toEqual(['a,b'])
  })

  it('自定义分隔符', () => {
    const h = mount({ delimiter: ';' })
    typeInto(h.input, 'a;b;')
    expect(h.value()).toEqual(['a', 'b'])
  })

  it('重复标签不再加一遍，但输入照样被消费掉（列表里本来就有它）', () => {
    const h = mount({ defaultValue: ['vue'] })
    typeInto(h.input, 'vue')
    press(h.input, 'Enter')
    expect(h.value()).toEqual(['vue'])
    expect(h.input.value).toBe('')
  })
})

describe('键盘：提交与退格两步删', () => {
  it('enter 把文本变成标签并拦下默认行为（表单不该被提交掉）', () => {
    const h = mount()
    typeInto(h.input, 'vue')
    const event = press(h.input, 'Enter')
    expect(event.defaultPrevented).toBe(true)
    expect(h.value()).toEqual(['vue'])
    expect(h.input.value).toBe('')
  })

  it('框里只有空白时 Enter 不接管：表单的提交键要还给表单', () => {
    const h = mount()
    typeInto(h.input, '   ')
    const event = press(h.input, 'Enter')
    expect(event.defaultPrevented).toBe(false)
    expect(h.value()).toEqual([])
  })

  it('enter 一次进多个：文本里带分隔符时按它拆开', () => {
    const h = mount({ delimiter: '|' })
    h.input.value = 'a|b|c'
    h.input.dispatchEvent(new Event('input', { bubbles: true }))
    expect(h.value()).toEqual(['a', 'b'])
    press(h.input, 'Enter')
    expect(h.value()).toEqual(['a', 'b', 'c'])
  })

  it('框里还有字时退格就是退格：不拦、不动标签', () => {
    const h = mount({ defaultValue: ['a'] })
    typeInto(h.input, 'x')
    const event = press(h.input, 'Backspace')
    expect(event.defaultPrevented).toBe(false)
    expect(h.value()).toEqual(['a'])
    expect(h.api().highlightedValue).toBeNull()
  })

  it('空输入时退格头一下只高亮最后一个，再按一下才删', () => {
    const h = mount({ defaultValue: ['a', 'b'] })
    h.input.focus()
    const first = press(h.input, 'Backspace')
    expect(first.defaultPrevented).toBe(true)
    expect(h.value()).toEqual(['a', 'b'])
    expect(h.api().highlightedValue).toBe('b')
    expect(h.nodes('b').item.getAttribute('data-highlighted')).toBe('')
    press(h.input, 'Backspace')
    expect(h.value()).toEqual(['a'])
    // 光标落到前一个上，接着按可以一路往回删
    expect(h.api().highlightedValue).toBe('a')
    press(h.input, 'Backspace')
    expect(h.value()).toEqual([])
    // 删到头：光标交回输入框
    expect(h.api().highlightedValue).toBeNull()
    expect(h.stateOf()).toBe('idle')
  })

  it('一个标签都没有时退格什么也不做，也不吞这个键', () => {
    const h = mount()
    h.input.focus()
    const event = press(h.input, 'Backspace')
    expect(event.defaultPrevented).toBe(false)
    expect(h.stateOf()).toBe('idle')
  })

  it('delete 删掉高亮的标签；没高亮时不接管', () => {
    const h = mount({ defaultValue: ['a', 'b'] })
    h.input.focus()
    const idle = press(h.input, 'Delete')
    expect(idle.defaultPrevented).toBe(false)
    press(h.input, 'Backspace')
    const armed = press(h.input, 'Delete')
    expect(armed.defaultPrevented).toBe(true)
    expect(h.value()).toEqual(['a'])
  })

  it('一开始打字就把光标交回输入框，高亮随之撤掉', () => {
    const h = mount({ defaultValue: ['a'] })
    h.input.focus()
    press(h.input, 'Backspace')
    expect(h.api().highlightedValue).toBe('a')
    typeInto(h.input, 'x')
    expect(h.api().highlightedValue).toBeNull()
    expect(h.stateOf()).toBe('idle')
    expect(h.value()).toEqual(['a'])
  })
})

describe('键盘：在标签之间走', () => {
  it('光标贴着最左端时左键才接管，否则归浏览器', () => {
    const h = mount({ defaultValue: ['a', 'b'] })
    typeInto(h.input, 'xy')
    // 光标在末尾：左键是"往左挪一格"，不能吞
    const inText = press(h.input, 'ArrowLeft')
    expect(inText.defaultPrevented).toBe(false)
    expect(h.api().highlightedValue).toBeNull()

    caretToStart(h.input)
    const atStart = press(h.input, 'ArrowLeft')
    expect(atStart.defaultPrevented).toBe(true)
    expect(h.api().highlightedValue).toBe('b')
  })

  it('左键一路往左，到第一个就停住（不回绕）', () => {
    const h = mount({ defaultValue: ['a', 'b', 'c'] })
    caretToStart(h.input)
    press(h.input, 'ArrowLeft')
    press(h.input, 'ArrowLeft')
    press(h.input, 'ArrowLeft')
    expect(h.api().highlightedValue).toBe('a')
    press(h.input, 'ArrowLeft')
    expect(h.api().highlightedValue).toBe('a')
  })

  it('右键往回走，走出末尾即交回输入框；光标还在框里时不接管', () => {
    const h = mount({ defaultValue: ['a', 'b'] })
    caretToStart(h.input)
    const idle = press(h.input, 'ArrowRight')
    expect(idle.defaultPrevented).toBe(false)

    press(h.input, 'ArrowLeft')
    press(h.input, 'ArrowLeft')
    expect(h.api().highlightedValue).toBe('a')
    press(h.input, 'ArrowRight')
    expect(h.api().highlightedValue).toBe('b')
    press(h.input, 'ArrowRight')
    expect(h.api().highlightedValue).toBeNull()
    expect(h.stateOf()).toBe('idle')
  })

  it('home / End 只在已经走进标签时才接管', () => {
    const h = mount({ defaultValue: ['a', 'b', 'c'] })
    caretToStart(h.input)
    const idleHome = press(h.input, 'Home')
    expect(idleHome.defaultPrevented).toBe(false)

    press(h.input, 'ArrowLeft')
    press(h.input, 'Home')
    expect(h.api().highlightedValue).toBe('a')
    press(h.input, 'End')
    expect(h.api().highlightedValue).toBeNull()
  })

  it('escape 只在走进标签后才吞：外层浮层还等着这个键', () => {
    const h = mount({ defaultValue: ['a'] })
    h.input.focus()
    const idle = press(h.input, 'Escape')
    expect(idle.defaultPrevented).toBe(false)

    press(h.input, 'Backspace')
    const armed = press(h.input, 'Escape')
    expect(armed.defaultPrevented).toBe(true)
    expect(h.api().highlightedValue).toBeNull()
  })

  it('带 Ctrl 的组合一律不接（Ctrl+A 全选文本要放行）', () => {
    const h = mount({ defaultValue: ['a'] })
    h.input.focus()
    const event = press(h.input, 'Backspace', { ctrlKey: true })
    expect(event.defaultPrevented).toBe(false)
    expect(h.api().highlightedValue).toBeNull()
  })
})

describe('粘贴', () => {
  it('addOnPaste 关着时不接管：交给浏览器照常粘进框里', () => {
    const h = mount()
    expect(paste(h.input, 'a,b')).toBe(false)
    expect(h.value()).toEqual([])
  })

  it('addOnPaste 开着时按分隔符拆成多个标签', () => {
    const h = mount({ addOnPaste: true })
    expect(paste(h.input, ' a , b ,, c ')).toBe(true)
    expect(h.value()).toEqual(['a', 'b', 'c'])
  })

  it('剪贴板里没有能成标签的内容时不接管', () => {
    const h = mount({ addOnPaste: true })
    expect(paste(h.input, '   ')).toBe(false)
    expect(h.value()).toEqual([])
  })

  it('顶到上限时也不接管：拦下来又加不进去，等于把内容凭空吃掉', () => {
    const h = mount({ addOnPaste: true, defaultValue: ['a'], max: 2 })
    expect(paste(h.input, 'b,c')).toBe(false)
    expect(h.value()).toEqual(['a'])
    // 只粘一个还进得去，那就接管
    expect(paste(h.input, 'b')).toBe(true)
    expect(h.value()).toEqual(['a', 'b'])
  })

  it('只读时粘贴不接管', () => {
    const h = mount({ addOnPaste: true, readOnly: true })
    expect(paste(h.input, 'a')).toBe(false)
    expect(h.value()).toEqual([])
  })
})

describe('删除按钮与清空按钮的焦点去处', () => {
  it('删除按钮正持有焦点时，删完把焦点交回输入框', () => {
    const h = mount({ defaultValue: ['a', 'b'] })
    const del = h.nodes('b').del
    del.focus()
    expect(document.activeElement).toBe(del)
    click(del)
    expect(h.value()).toEqual(['a'])
    // 判据是"本节点当下正持有焦点"：不交回去焦点就掉到 body 上，键盘用户被踢出组件
    expect(document.activeElement).toBe(h.input)
  })

  it('焦点本来就在输入框时不去抢它（用户可能正打到一半）', () => {
    const h = mount({ defaultValue: ['a', 'b'] })
    typeInto(h.input, 'xy')
    h.input.setSelectionRange(1, 1)
    // 盯的是"有没有多此一举地再聚焦一次"：只看 activeElement 的话，
    // 无条件抢焦点的实现也照样能通过——那正是这条要挡住的写法
    const focusSpy = vi.spyOn(h.input, 'focus')
    click(h.nodes('b').del)
    expect(h.value()).toEqual(['a'])
    expect(focusSpy).not.toHaveBeenCalled()
    expect(document.activeElement).toBe(h.input)
    expect(h.input.selectionStart).toBe(1)
    focusSpy.mockRestore()
  })

  it('删除按钮的 pointerdown 被拦下，焦点不会被按钮抢走', () => {
    const h = mount({ defaultValue: ['a'] })
    const event = new PointerEvent('pointerdown', { bubbles: true, cancelable: true, button: 0 })
    h.nodes('a').del.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(true)
  })

  it('禁用时删除按钮落成原生 disabled（浏览器根本不派 click）', () => {
    const h = mount({ defaultValue: ['a'], disabled: true })
    expect(h.nodes('a').del.hasAttribute('disabled')).toBe(true)
    // 直接派事件才碰得到守卫那一路
    click(h.nodes('a').del)
    expect(h.value()).toEqual(['a'])
  })

  it('清空按钮清掉标签与文本；正持有焦点时焦点交回输入框', () => {
    const h = mount({ defaultValue: ['a', 'b'], defaultInputValue: 'x' })
    h.clearTrigger.focus()
    click(h.clearTrigger)
    expect(h.value()).toEqual([])
    expect(h.inputValue()).toBe('')
    expect(h.input.value).toBe('')
    expect(document.activeElement).toBe(h.input)
    expect(h.clearTrigger.hasAttribute('disabled')).toBe(true)
  })
})

describe('就地编辑', () => {
  it('未开 editable 时双击不进编辑态', () => {
    const h = mount({ defaultValue: ['vue'] })
    h.nodes('vue').preview.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }))
    expect(h.stateOf()).toBe('idle')
  })

  it('双击进编辑态：preview 收起、编辑框露出并拿到焦点', async () => {
    const h = mount({ defaultValue: ['vue'], editable: true })
    const n = h.nodes('vue')
    n.preview.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }))
    expect(h.stateOf()).toBe('editing')
    expect(n.preview.hasAttribute('hidden')).toBe(true)
    expect(n.editInput.hasAttribute('hidden')).toBe(false)
    expect(n.item.getAttribute('data-editing')).toBe('')
    // 编辑框从原值起步，而不是空着
    expect(n.editInput.value).toBe('vue')
    // 聚焦推迟到宿主渲染完这一帧之后（编辑框那时才不再是 hidden）
    expect(document.activeElement).not.toBe(n.editInput)
    await flush()
    expect(document.activeElement).toBe(n.editInput)
  })

  it('高亮着标签时 Enter 走的是"改这一个"，不是"再加一个"', () => {
    const h = mount({ defaultValue: ['vue'], editable: true })
    typeInto(h.input, '')
    h.input.focus()
    press(h.input, 'Backspace')
    expect(h.api().highlightedValue).toBe('vue')
    press(h.input, 'Enter')
    expect(h.stateOf()).toBe('editing')
    expect(h.value()).toEqual(['vue'])
  })

  it('enter 提交改写并把焦点交回输入框', () => {
    const h = mount({ defaultValue: ['vue', 'react'], editable: true })
    const n = h.nodes('vue')
    h.api().edit('vue')
    typeInto(n.editInput, 'vue 3')
    const event = press(n.editInput, 'Enter')
    expect(event.defaultPrevented).toBe(true)
    expect(h.value()).toEqual(['vue 3', 'react'])
    expect(h.stateOf()).toBe('idle')
    expect(document.activeElement).toBe(h.input)
  })

  it('escape 撤销改写，标签保持原样', () => {
    const h = mount({ defaultValue: ['vue'], editable: true })
    const n = h.nodes('vue')
    h.api().edit('vue')
    typeInto(n.editInput, 'nuxt')
    const event = press(n.editInput, 'Escape')
    expect(event.defaultPrevented).toBe(true)
    expect(h.value()).toEqual(['vue'])
    expect(h.stateOf()).toBe('idle')
    expect(document.activeElement).toBe(h.input)
  })

  it('改成空白等于删掉这个标签', () => {
    const h = mount({ defaultValue: ['vue', 'react'], editable: true })
    const n = h.nodes('vue')
    h.api().edit('vue')
    typeInto(n.editInput, '   ')
    press(n.editInput, 'Enter')
    expect(h.value()).toEqual(['react'])
    expect(h.has('vue')).toBe(false)
    // 标签整块节点已经离开文档，焦点仍须落回输入框
    expect(document.activeElement).toBe(h.input)
  })

  it('改成另一个已有标签就并成一个，不留两份一模一样的', () => {
    const h = mount({ defaultValue: ['vue', 'react'], editable: true })
    h.api().edit('vue')
    typeInto(h.nodes('vue').editInput, 'react')
    press(h.nodes('vue').editInput, 'Enter')
    expect(h.value()).toEqual(['react'])
  })

  it('失焦提交这次改写', () => {
    const h = mount({ defaultValue: ['vue'], editable: true })
    const n = h.nodes('vue')
    h.api().edit('vue')
    typeInto(n.editInput, 'nuxt')
    n.editInput.dispatchEvent(new FocusEvent('blur'))
    expect(h.value()).toEqual(['nuxt'])
    expect(h.stateOf()).toBe('idle')
  })

  it('别的标签迟到的失焦不会把这次编辑提交掉', () => {
    const h = mount({ defaultValue: ['vue', 'react'], editable: true })
    h.api().edit('vue')
    typeInto(h.nodes('vue').editInput, 'nuxt')
    h.nodes('react').editInput.dispatchEvent(new FocusEvent('blur'))
    expect(h.stateOf()).toBe('editing')
    expect(h.value()).toEqual(['vue', 'react'])
  })

  it('编辑途中标签节点被移出 DOM：不补报就一直卡在编辑态', () => {
    // 浏览器不会为"被移除的节点带走了焦点"派 focusout，机器读不到这件事，
    // 两个适配器因此都在标签离场时补报 ITEM.FOCUS_LOST。
    // 这条用例钉的正是"不补报会怎样"，删掉适配器那段代码时它是唯一说得清后果的地方
    const h = mount({ value: ['vue'], editable: true })
    h.api().edit('vue')
    expect(h.stateOf()).toBe('editing')
    h.setProps({ value: [] })
    // 值是受控的，机器自己不会退出编辑态；此刻锚点已经落空、编辑框也不在文档里了
    expect(h.stateOf()).toBe('editing')
    expect(h.api().editedValue).toBeNull()
    h.send({ type: 'ITEM.FOCUS_LOST' })
    expect(h.stateOf()).toBe('idle')
  })
})

describe('失焦行为', () => {
  it('缺省时残留文本原样留着', () => {
    const h = mount()
    typeInto(h.input, 'vue')
    h.input.dispatchEvent(new FocusEvent('blur', { relatedTarget: null }))
    expect(h.inputValue()).toBe('vue')
    expect(h.value()).toEqual([])
  })

  it('blurBehavior=add：残留文本变成标签', () => {
    const h = mount({ blurBehavior: 'add' })
    typeInto(h.input, 'vue')
    h.input.dispatchEvent(new FocusEvent('blur', { relatedTarget: null }))
    expect(h.value()).toEqual(['vue'])
    expect(h.inputValue()).toBe('')
  })

  it('blurBehavior=clear：残留文本丢掉', () => {
    const h = mount({ blurBehavior: 'clear' })
    typeInto(h.input, 'vue')
    h.input.dispatchEvent(new FocusEvent('blur', { relatedTarget: null }))
    expect(h.value()).toEqual([])
    expect(h.inputValue()).toBe('')
  })

  it('焦点只是挪到组件内部（点自己的删除按钮）不算失焦', () => {
    const h = mount({ defaultValue: ['a'], blurBehavior: 'clear' })
    typeInto(h.input, 'vue')
    h.input.dispatchEvent(new FocusEvent('blur', { bubbles: false, relatedTarget: h.nodes('a').del }))
    expect(h.inputValue()).toBe('vue')
  })

  it('失焦一并把高亮撤掉', () => {
    const h = mount({ defaultValue: ['a'] })
    h.input.focus()
    press(h.input, 'Backspace')
    expect(h.stateOf()).toBe('navigating')
    h.input.dispatchEvent(new FocusEvent('blur', { relatedTarget: null }))
    expect(h.stateOf()).toBe('idle')
    expect(h.api().highlightedValue).toBeNull()
  })
})

describe('命令式出口', () => {
  it('addValue / deleteValue / clear / setInputValue / highlight 走同一批入口', () => {
    const h = mount()
    h.api().addValue('a')
    h.api().addValue('b')
    expect(h.value()).toEqual(['a', 'b'])
    h.api().highlight('a')
    expect(h.api().highlightedValue).toBe('a')
    h.api().deleteValue('a')
    expect(h.value()).toEqual(['b'])
    h.api().setInputValue('x')
    expect(h.inputValue()).toBe('x')
    h.api().clear()
    expect(h.value()).toEqual([])
    expect(h.inputValue()).toBe('')
  })

  it('count / empty / atMax 随值走', () => {
    const h = mount({ max: 2 })
    expect(h.api().empty).toBe(true)
    expect(h.api().count).toBe(0)
    h.api().addValue('a')
    h.api().addValue('b')
    expect(h.api().count).toBe(2)
    expect(h.api().empty).toBe(false)
    expect(h.api().atMax).toBe(true)
    expect(h.api().overflow).toBe(false)
  })
})
