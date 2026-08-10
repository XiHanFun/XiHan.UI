// @vitest-environment jsdom
import type { CheckboxGroupItemProps, CheckboxGroupSchema } from '../src/checkbox-group'
import { normalizeProps } from '@xihan-ui/kernel'
import { createService } from '@xihan-ui/machine'
import { createVanillaRuntime } from '@xihan-ui/machine/vanilla'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  checkboxGroupMachine,
  connectCheckboxGroup,
  resolveCheckedState,
  toggleAllValues,
  toggleItemValue,
} from '../src/checkbox-group'

type Props = CheckboxGroupSchema['props']

function makeService(props: Props = {}) {
  const runtime = createVanillaRuntime()
  // 同一个对象原样返回：service 按返回值身份缓存 props，原地改字段即可模拟宿主写回
  const service = createService(checkboxGroupMachine, { props: () => props, runtime })
  runtime.start()
  return service
}

function api(service: ReturnType<typeof makeService>) {
  return connectCheckboxGroup(service, normalizeProps)
}

function itemProps(service: ReturnType<typeof makeService>, item: CheckboxGroupItemProps) {
  return api(service).getItemProps(item) as Record<string, unknown>
}

/** 事件替身：只记 preventDefault 有没有被调用，省得靠合成事件的 cancelable 兜圈子。 */
function keyEvent(key: string) {
  const prevented = vi.fn()
  return { event: { key, preventDefault: prevented } as unknown as KeyboardEvent, prevented }
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('纯函数：值集合的增删', () => {
  it('toggleItemValue 按点击先后追加，再点即摘除', () => {
    expect(toggleItemValue([], 'a')).toEqual(['a'])
    expect(toggleItemValue(['a'], 'c')).toEqual(['a', 'c'])
    // 追加是"点击先后"，不是声明顺序
    expect(toggleItemValue(['c'], 'a')).toEqual(['c', 'a'])
    expect(toggleItemValue(['a', 'c'], 'a')).toEqual(['c'])
  })

  it('toggleItemValue 不改原数组', () => {
    const list = ['a']
    expect(toggleItemValue(list, 'b')).not.toBe(list)
    expect(list).toEqual(['a'])
  })

  it('toggleAllValues：没全选就补齐，已全选就整批摘掉', () => {
    expect(toggleAllValues([], ['a', 'c'])).toEqual(['a', 'c'])
    expect(toggleAllValues(['a'], ['a', 'c'])).toEqual(['a', 'c'])
    expect(toggleAllValues(['a', 'c'], ['a', 'c'])).toEqual([])
  })

  it('toggleAllValues 只动传进来的那批值，其余已选项原样留着', () => {
    // b 是禁用条目、不在可用批次里：全选与取消全选都不该碰它
    expect(toggleAllValues(['b'], ['a', 'c'])).toEqual(['b', 'a', 'c'])
    expect(toggleAllValues(['b', 'a', 'c'], ['a', 'c'])).toEqual(['b'])
  })

  it('toggleAllValues 收到空批次时原地不动（不会把已选项清空）', () => {
    expect(toggleAllValues(['a'], [])).toEqual(['a'])
  })
})

describe('纯函数：全选态', () => {
  it('比对作者声明的全集，分得出 none / some / all', () => {
    const all = ['a', 'b', 'c']
    expect(resolveCheckedState([], all)).toBe('none')
    expect(resolveCheckedState(['a'], all)).toBe('some')
    expect(resolveCheckedState(['a', 'b'], all)).toBe('some')
    expect(resolveCheckedState(['c', 'a', 'b'], all)).toBe('all')
  })

  it('选中集合里混进全集之外的值，不影响 all 的判定', () => {
    expect(resolveCheckedState(['a', 'b', 'c', 'x'], ['a', 'b', 'c'])).toBe('all')
  })

  it('全集缺省时只答 none / some，绝不谎报 all', () => {
    expect(resolveCheckedState([], [])).toBe('none')
    expect(resolveCheckedState(['a'], [])).toBe('some')
  })
})

describe('checkboxGroupMachine', () => {
  it('默认空集合，defaultValue 决定初值', () => {
    expect(makeService().context.get('value')).toEqual([])
    expect(makeService({ defaultValue: ['a'] }).context.get('value')).toEqual(['a'])
  })

  it('iTEM.TOGGLE 增删值并派 onValueChange', () => {
    const onValueChange = vi.fn()
    const s = makeService({ onValueChange })
    s.send({ type: 'ITEM.TOGGLE', value: 'a' })
    expect(s.context.get('value')).toEqual(['a'])
    expect(onValueChange).toHaveBeenLastCalledWith({ value: ['a'] })
    s.send({ type: 'ITEM.TOGGLE', value: 'a' })
    expect(s.context.get('value')).toEqual([])
    expect(onValueChange).toHaveBeenLastCalledWith({ value: [] })
  })

  it('disabled / readOnly 拦下用户意图，但拦不住程序化的 VALUE.SET', () => {
    for (const gate of [{ disabled: true }, { readOnly: true }] as Props[]) {
      const s = makeService({ ...gate, defaultValue: ['a'] })
      s.send({ type: 'ITEM.TOGGLE', value: 'b' })
      s.send({ type: 'ALL.TOGGLE', values: ['a', 'b'] })
      expect(s.context.get('value')).toEqual(['a'])
      // 受控父组件写回值走的正是 VALUE.SET，被守卫挡掉的话受控模式就此失灵
      s.send({ type: 'VALUE.SET', value: ['b'] })
      expect(s.context.get('value')).toEqual(['b'])
    }
  })

  it('受控 value：机器不改内部值，只把意图发出去', () => {
    const onValueChange = vi.fn()
    const props: Props = { value: ['a'], onValueChange }
    const s = makeService(props)
    s.send({ type: 'ITEM.TOGGLE', value: 'c' })
    expect(s.context.get('value')).toEqual(['a'])
    expect(onValueChange).toHaveBeenCalledWith({ value: ['a', 'c'] })
    // 宿主写回后才真的换值
    props.value = ['a', 'c']
    expect(s.context.get('value')).toEqual(['a', 'c'])
  })

  it('受控写回一份内容相同的新数组不会再派一次通知', () => {
    const onValueChange = vi.fn()
    const s = makeService({ defaultValue: ['a'], onValueChange })
    s.send({ type: 'VALUE.SET', value: ['a'] })
    expect(onValueChange).not.toHaveBeenCalled()
  })
})

describe('connectCheckboxGroup：容器与标题', () => {
  it('root 是 role=group，指向 label，且不占 Tab 位', () => {
    const s = makeService()
    const root = api(s).getRootProps() as Record<string, unknown>
    expect(root.role).toBe('group')
    expect(root['data-scope']).toBe('checkbox-group')
    expect(root['data-part']).toBe('root')
    expect(root['aria-labelledby']).toBe((api(s).getLabelProps() as Record<string, unknown>).id)
    // 容器占 Tab 位会多出一个聚焦不到任何东西的停靠点
    expect('tabindex' in root).toBe(false)
    // role=group 不接受 aria-orientation，只能出 data-orientation
    expect(root['data-orientation']).toBe('vertical')
    expect('aria-orientation' in root).toBe(false)
  })

  it('orientation / disabled / readOnly / invalid 落成 data 标记', () => {
    const root = api(makeService({
      orientation: 'horizontal',
      disabled: true,
      readOnly: true,
      invalid: true,
    })).getRootProps() as Record<string, unknown>
    expect(root['data-orientation']).toBe('horizontal')
    expect(root['data-disabled']).toBe('')
    expect(root['data-readonly']).toBe('')
    expect(root['data-invalid']).toBe('')
  })
})

describe('connectCheckboxGroup：条目', () => {
  it('每一项都是独立 Tab 位，禁用项也留着', () => {
    const s = makeService({ disabled: true })
    for (const item of [{ value: 'a' }, { value: 'b', disabled: true }])
      expect(itemProps(s, item).tabindex).toBe(0)
  })

  it('aria-checked / aria-disabled 显式给 false，绝不输出原生 disabled', () => {
    const s = makeService({ defaultValue: ['a'] })
    const checked = itemProps(s, { value: 'a' })
    const plain = itemProps(s, { value: 'b' })
    const off = itemProps(s, { value: 'c', disabled: true })
    expect(checked['aria-checked']).toBe('true')
    expect(checked['data-state']).toBe('checked')
    expect(plain['aria-checked']).toBe('false')
    expect(plain['aria-disabled']).toBe('false')
    expect(plain['data-state']).toBe('unchecked')
    expect(off['aria-disabled']).toBe('true')
    expect(off['data-disabled']).toBe('')
    expect('disabled' in off).toBe(false)
  })

  it('整组禁用向下传导到每一项', () => {
    const s = makeService({ disabled: true })
    expect(itemProps(s, { value: 'a' })['aria-disabled']).toBe('true')
  })

  it('invalid / readOnly 落到条目的 aria 上（role=group 接不住它们）', () => {
    const s = makeService({ invalid: true, readOnly: true })
    const item = itemProps(s, { value: 'a' })
    expect(item['aria-invalid']).toBe('true')
    expect(item['aria-readonly']).toBe('true')
    const clean = itemProps(makeService(), { value: 'a' })
    expect(clean['aria-invalid']).toBe('false')
    expect(clean['aria-readonly']).toBe('false')
  })

  it('点击翻转；条目禁用、整组禁用、只读三种情形都点不动', () => {
    const s = makeService()
    ;(itemProps(s, { value: 'a' }).onClick as () => void)()
    expect(s.context.get('value')).toEqual(['a'])
    ;(itemProps(s, { value: 'a' }).onClick as () => void)()
    expect(s.context.get('value')).toEqual([])

    for (const [props, item] of [
      [{}, { value: 'a', disabled: true }],
      [{ disabled: true }, { value: 'a' }],
      [{ readOnly: true }, { value: 'a' }],
    ] as [Props, CheckboxGroupItemProps][]) {
      const blocked = makeService(props)
      ;(itemProps(blocked, item).onClick as () => void)()
      expect(blocked.context.get('value')).toEqual([])
    }
  })

  it('space 翻转并拦下页面滚动；点不动的条目要放行这个键', () => {
    const s = makeService()
    const hit = keyEvent(' ')
    ;(itemProps(s, { value: 'a' }).onKeyDown as (e: KeyboardEvent) => void)(hit.event)
    expect(s.context.get('value')).toEqual(['a'])
    expect(hit.prevented).toHaveBeenCalled()

    // 吞掉却不做事等于把页面滚动也一起吞了
    const off = keyEvent(' ')
    ;(itemProps(s, { value: 'b', disabled: true }).onKeyDown as (e: KeyboardEvent) => void)(off.event)
    expect(s.context.get('value')).toEqual(['a'])
    expect(off.prevented).not.toHaveBeenCalled()
  })

  it('space 之外的键一概不接管', () => {
    const s = makeService()
    const enter = keyEvent('Enter')
    ;(itemProps(s, { value: 'a' }).onKeyDown as (e: KeyboardEvent) => void)(enter.event)
    expect(s.context.get('value')).toEqual([])
    expect(enter.prevented).not.toHaveBeenCalled()
  })
})

describe('connectCheckboxGroup：条目的表单影子与装饰件', () => {
  it('隐藏输入带 type/name/value/checked，禁用项用原生 disabled', () => {
    const s = makeService({ name: 'topping', defaultValue: ['a'] })
    const on = api(s).getItemHiddenInputProps({ value: 'a' }) as Record<string, unknown>
    expect(on.type).toBe('checkbox')
    expect(on.name).toBe('topping')
    expect(on.value).toBe('a')
    expect(on.checked).toBe(true)
    expect(on.tabindex).toBe(-1)
    expect(on['aria-hidden']).toBe('true')
    // 条目是 role=checkbox，后代里不能留下可聚焦的控件
    expect(on.inert).toBe(true)
    // type 必须排在 checked 前面：改 type 会把选中态重置掉
    const keys = Object.keys(on)
    expect(keys.indexOf('type')).toBeLessThan(keys.indexOf('checked'))

    const off = api(s).getItemHiddenInputProps({ value: 'b', disabled: true }) as Record<string, unknown>
    expect(off.checked).toBe(false)
    expect(off.disabled).toBe(true)
  })

  it('name 缺省时隐藏输入不带 name，不参与提交', () => {
    const input = api(makeService()).getItemHiddenInputProps({ value: 'a' }) as Record<string, unknown>
    expect(input.name).toBeUndefined()
  })

  it('item-control 对读屏隐藏，item-control / item-text 与条目共用状态标记', () => {
    const s = makeService({ defaultValue: ['a'] })
    const control = api(s).getItemControlProps({ value: 'a' }) as Record<string, unknown>
    const text = api(s).getItemTextProps({ value: 'a' }) as Record<string, unknown>
    expect(control['aria-hidden']).toBe('true')
    expect(control['data-state']).toBe('checked')
    expect(text['data-state']).toBe('checked')
    // 文本是条目可及名的来源，不能对读屏隐藏
    expect('aria-hidden' in text).toBe(false)
  })
})

describe('connectCheckboxGroup：全选/半选的 trigger', () => {
  const ALL = ['a', 'b', 'c']

  function triggerProps(props: Props) {
    return api(makeService(props)).getTriggerProps() as Record<string, unknown>
  }

  it('aria-checked 三态：none=false / some=mixed / all=true', () => {
    expect(triggerProps({ itemValues: ALL })['aria-checked']).toBe('false')
    expect(triggerProps({ itemValues: ALL, defaultValue: ['a'] })['aria-checked']).toBe('mixed')
    expect(triggerProps({ itemValues: ALL, defaultValue: ALL })['aria-checked']).toBe('true')
  })

  it('data-state 与 api.checkedState 同源', () => {
    const s = makeService({ itemValues: ALL, defaultValue: ['a', 'b'] })
    expect(api(s).checkedState).toBe('some')
    expect((api(s).getTriggerProps() as Record<string, unknown>)['data-state']).toBe('some')
  })

  it('可及名两段：组标题在前，全选格自己的文本在后（自指那段落在它自己的 id 上）', () => {
    const a = api(makeService({}))
    const trigger = a.getTriggerProps() as Record<string, unknown>
    const labelId = (a.getLabelProps() as Record<string, unknown>).id
    expect(trigger['aria-labelledby']).toBe(`${labelId} ${trigger.id}`)
  })

  it('禁用/只读时用 aria-disabled 表达，且仍占 Tab 位', () => {
    const off = triggerProps({ disabled: true })
    expect(off['aria-disabled']).toBe('true')
    expect(off.tabindex).toBe(0)
    expect('disabled' in off).toBe(false)
    expect(triggerProps({})['aria-disabled']).toBe('false')
    expect(triggerProps({ readOnly: true })['aria-disabled']).toBe('true')
  })
})

// trigger 的全选要顺着祖先链找回 root、再现查条目，只有真 DOM 才验得到这条路
describe('connectCheckboxGroup：trigger 在真实 DOM 上的全选', () => {
  function mountGroup(service: ReturnType<typeof makeService>, itemDecls: CheckboxGroupItemProps[]) {
    const a = api(service)
    const root = document.createElement('div')
    Object.entries(a.getRootProps() as Record<string, unknown>).forEach(([k, v]) => {
      if (typeof v === 'string')
        root.setAttribute(k, v)
    })
    const trigger = document.createElement('div')
    const triggerAttrs = a.getTriggerProps() as Record<string, unknown>
    Object.entries(triggerAttrs).forEach(([k, v]) => {
      if (typeof v === 'string' || typeof v === 'number')
        trigger.setAttribute(k, String(v))
    })
    trigger.addEventListener('click', triggerAttrs.onClick as EventListener)
    trigger.addEventListener('keydown', triggerAttrs.onKeyDown as EventListener)
    root.appendChild(trigger)
    for (const decl of itemDecls) {
      const el = document.createElement('div')
      Object.entries(a.getItemProps(decl) as Record<string, unknown>).forEach(([k, v]) => {
        if (typeof v === 'string' || typeof v === 'number')
          el.setAttribute(k, String(v))
      })
      root.appendChild(el)
    }
    document.body.appendChild(root)
    return { root, trigger }
  }

  const DECLS: CheckboxGroupItemProps[] = [
    { value: 'a' },
    { value: 'b', disabled: true },
    { value: 'c' },
  ]

  it('点击 trigger 勾上全部可用条目，跳过禁用项', () => {
    const s = makeService({ itemValues: ['a', 'b', 'c'] })
    const { trigger } = mountGroup(s, DECLS)
    trigger.click()
    expect(s.context.get('value')).toEqual(['a', 'c'])
    // 禁用项没被勾上，因此全集视角下仍是"半选"
    expect(api(s).checkedState).toBe('some')
  })

  it('可用条目已全选时，再点一次整批取消，禁用项的已选状态保留', () => {
    const s = makeService({ itemValues: ['a', 'b', 'c'], defaultValue: ['b', 'a', 'c'] })
    const { trigger } = mountGroup(s, DECLS)
    expect(api(s).checkedState).toBe('all')
    trigger.click()
    expect(s.context.get('value')).toEqual(['b'])
  })

  it('trigger 上按 Space 与点击等效，并拦下页面滚动', () => {
    const s = makeService({ itemValues: ['a', 'b', 'c'] })
    const { trigger } = mountGroup(s, DECLS)
    const e = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true })
    trigger.dispatchEvent(e)
    expect(s.context.get('value')).toEqual(['a', 'c'])
    expect(e.defaultPrevented).toBe(true)
  })

  it('整组禁用时 trigger 点不动，Space 也不吞', () => {
    const s = makeService({ itemValues: ['a', 'b', 'c'], disabled: true })
    const { trigger } = mountGroup(s, DECLS)
    trigger.click()
    const e = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true })
    trigger.dispatchEvent(e)
    expect(s.context.get('value')).toEqual([])
    expect(e.defaultPrevented).toBe(false)
  })

  it('trigger 被写在 root 之外时不猜文档里的条目，原地不动', () => {
    const s = makeService({ itemValues: ['a', 'b', 'c'] })
    mountGroup(s, DECLS)
    const stray = document.createElement('div')
    stray.addEventListener('click', (api(s).getTriggerProps() as Record<string, unknown>).onClick as EventListener)
    document.body.appendChild(stray)
    stray.click()
    expect(s.context.get('value')).toEqual([])
  })

  it('条目在两次点击之间被删掉：第二次只认当下还在的条目', () => {
    const s = makeService({ itemValues: ['a', 'b', 'c'] })
    const { root, trigger } = mountGroup(s, DECLS)
    trigger.click()
    expect(s.context.get('value')).toEqual(['a', 'c'])
    root.querySelector('[data-value="c"]')!.remove()
    // 现存的可用条目只剩 a，且它已选中 → 整批取消，只摘掉 a
    trigger.click()
    expect(s.context.get('value')).toEqual(['c'])
  })
})
