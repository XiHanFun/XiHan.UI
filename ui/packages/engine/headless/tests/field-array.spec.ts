// @vitest-environment jsdom
import type { FieldArraySchema } from '../src/field-array'
import type { FormRule, FormSchema } from '../src/form'
import type { StructureChild, StructureNode } from '../src/shared/structure'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { connectFieldArray, fieldArrayMachine, fieldArrayStructure, fieldArrayTriggerId } from '../src/field-array'
import { atRowMax, atRowMin, fieldArrayInsertIndex, moveRow, rowBound, sameRows } from '../src/field-array/field-array.machine'
import { connectForm, createFormPathRecord, formMachine, formPathKey, getFormPathValue } from '../src/form'

type Props = FieldArraySchema['props']

function makeService(props: Props = {}) {
  const runtime = createVanillaRuntime()
  // 同一个对象原样返回：service 按返回值身份缓存 props，原地改字段即可模拟宿主写回
  const service = createService(fieldArrayMachine, { props: () => props, runtime })
  runtime.start()
  return service
}

function makeFormService(props: FormSchema['props'] = {}) {
  const runtime = createVanillaRuntime()
  const service = createService(formMachine, { props: () => props, runtime })
  runtime.start()
  return service
}

type Svc = ReturnType<typeof makeService>

function api(service: Svc) {
  return connectFieldArray(service, normalizeProps)
}

function keys(service: Svc): string[] {
  return api(service).items.map(row => row.key)
}

/** flush 走微任务，等两拍就够；不掐固定毫秒。 */
async function settle(): Promise<void> {
  await Promise.resolve()
  await Promise.resolve()
}

/**
 * 按 connect 会写出的 id 造一批真把手节点。
 * 机器还焦点时靠 id 从 scope 里捞节点，这里的算法与 connect 共用同一个导出。
 */
function mountTriggers(service: Svc, rows: number) {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const make = (id: string): HTMLButtonElement => {
    const el = document.createElement('button')
    el.id = id
    host.appendChild(el)
    return el
  }
  return {
    add: make(fieldArrayTriggerId(service.scope, 'add-trigger')),
    remove: Array.from({ length: rows }, (_, i) => make(fieldArrayTriggerId(service.scope, 'item-delete-trigger', i))),
    moveUp: Array.from({ length: rows }, (_, i) => make(fieldArrayTriggerId(service.scope, 'move-up-trigger', i))),
    moveDown: Array.from({ length: rows }, (_, i) => make(fieldArrayTriggerId(service.scope, 'move-down-trigger', i))),
  }
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('纯函数：行数与位置', () => {
  it('moveRow 把一项挪到新位置，不改原数组', () => {
    const list = ['a', 'b', 'c']
    expect(moveRow(list, 1, 0)).toEqual(['b', 'a', 'c'])
    expect(moveRow(list, 0, 2)).toEqual(['b', 'c', 'a'])
    expect(moveRow(list, 2, 2)).toEqual(['a', 'b', 'c'])
    expect(list).toEqual(['a', 'b', 'c'])
  })

  it('moveRow 下标越界就原样返回一份拷贝', () => {
    const list = ['a', 'b']
    expect(moveRow(list, 5, 0)).toEqual(['a', 'b'])
    expect(moveRow(list, 0, -1)).toEqual(['a', 'b'])
    expect(moveRow(list, 0, 1)).not.toBe(list)
  })

  it('sameRows 逐项比引用，不比内容', () => {
    const row = { a: 1 }
    expect(sameRows([row], [row])).toBe(true)
    expect(sameRows([{ a: 1 }], [{ a: 1 }])).toBe(false)
    expect(sameRows([1, 2], [1])).toBe(false)
    expect(sameRows([], undefined)).toBe(false)
  })

  it('rowBound 把负数与非有限值当"没给"', () => {
    expect(rowBound(3)).toBe(3)
    expect(rowBound(2.7)).toBe(2)
    expect(rowBound(-1)).toBeUndefined()
    expect(rowBound(Number.NaN)).toBeUndefined()
    expect(rowBound(undefined)).toBeUndefined()
  })

  it('min 缺省为 0，空列表因此也算到底；max 缺省不限', () => {
    expect(atRowMin(0, undefined)).toBe(true)
    expect(atRowMin(1, undefined)).toBe(false)
    expect(atRowMin(2, 2)).toBe(true)
    expect(atRowMax(9, undefined)).toBe(false)
    expect(atRowMax(2, 2)).toBe(true)
  })
})

describe('行号：跟着增删换序走，不跟着行数据走', () => {
  it('删中间一行：剩下的行号原样不动，接位的那一行不会顶用别人的号', () => {
    const service = makeService({ defaultValue: ['甲', '乙', '丙'] })
    const before = keys(service)
    expect(new Set(before).size).toBe(3)

    api(service).remove(1)
    expect(api(service).value).toEqual(['甲', '丙'])
    // 删的是中间那一项，首尾两行的号必须原封不动
    expect(keys(service)).toEqual([before[0], before[2]])
  })

  it('新增一行：末尾补一个从没用过的号', () => {
    const service = makeService({ defaultValue: ['甲'], createItem: () => '乙' })
    const before = keys(service)

    api(service).add()
    const after = keys(service)
    expect(after[0]).toBe(before[0])
    expect(after).toHaveLength(2)
    expect(after[1]).not.toBe(before[0])

    // 删掉再加，新的一行也不许捡回刚退场那个号
    api(service).remove(1)
    api(service).add()
    expect(keys(service)[1]).not.toBe(after[1])
  })

  it('换序：号跟着这一行走', () => {
    const service = makeService({ defaultValue: ['甲', '乙', '丙'], movable: true })
    const before = keys(service)

    api(service).moveUp(1)
    expect(api(service).value).toEqual(['乙', '甲', '丙'])
    expect(keys(service)).toEqual([before[1], before[0], before[2]])

    api(service).moveDown(0)
    expect(keys(service)).toEqual([before[0], before[1], before[2]])
  })

  it('宿主原地改行数据、行数没变：号一个都不动', () => {
    const rows = [{ v: 1 }, { v: 2 }, { v: 3 }]
    const service = makeService({ defaultValue: rows })
    const before = keys(service)

    // 整份重建，每一行都是新对象——正是不可变写法每敲一个字会做的事
    api(service).setValue(rows.map(row => ({ ...row })))
    expect(keys(service)).toEqual(before)
  })

  it('宿主整份换掉且行数变了：按位置续用旧号，长出来的补新号', () => {
    const service = makeService({ defaultValue: ['甲', '乙'] })
    const before = keys(service)

    api(service).setValue(['甲', '乙', '丙', '丁'])
    const after = keys(service)
    expect(after.slice(0, 2)).toEqual(before)
    expect(new Set(after).size).toBe(4)

    api(service).setValue(['甲'])
    expect(keys(service)).toEqual([before[0]])
  })

  it('行号只在列表内唯一，不承诺是宿主数据里的 id；重复的行数据各拿各的号', () => {
    const service = makeService({ defaultValue: ['同', '同', '同'] })
    expect(new Set(keys(service)).size).toBe(3)
  })
})

describe('闸门：上下限与禁用', () => {
  it('到 max 加不动，到 min 删不动，回调一次都不发', () => {
    const onValueChange = vi.fn()
    const service = makeService({ defaultValue: ['甲', '乙'], min: 2, max: 2, onValueChange })

    expect(api(service).atMin).toBe(true)
    expect(api(service).atMax).toBe(true)
    expect(api(service).canAdd).toBe(false)

    api(service).add()
    api(service).remove(0)
    expect(api(service).value).toEqual(['甲', '乙'])
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('没开 movable 就换不了序', () => {
    const service = makeService({ defaultValue: ['甲', '乙'] })
    api(service).moveDown(0)
    expect(api(service).value).toEqual(['甲', '乙'])

    const movable = makeService({ defaultValue: ['甲', '乙'], movable: true })
    api(movable).moveDown(0)
    expect(api(movable).value).toEqual(['乙', '甲'])
  })

  it('disabled 时三路都推不动，整份替换仍走得通', () => {
    const service = makeService({ defaultValue: ['甲', '乙'], movable: true, disabled: true })
    api(service).add()
    api(service).remove(0)
    api(service).moveDown(0)
    expect(api(service).value).toEqual(['甲', '乙'])

    api(service).setValue(['丙'])
    expect(api(service).value).toEqual(['丙'])
  })

  it('没给 createItem 就补一个 null', () => {
    const service = makeService({ defaultValue: [] })
    api(service).add()
    expect(api(service).value).toEqual([null])
  })
})

describe('受控：宿主说了算', () => {
  it('宿主不写回时值与行号都不动，回调照发', () => {
    const onValueChange = vi.fn()
    const props: Props = { value: ['甲', '乙', '丙'], onValueChange }
    const service = makeService(props)
    const before = keys(service)

    api(service).remove(1)
    expect(onValueChange).toHaveBeenCalledWith({ value: ['甲', '丙'], mutation: { type: 'remove', index: 1 } })
    expect(api(service).value).toEqual(['甲', '乙', '丙'])
    expect(keys(service)).toEqual(before)
  })
})

describe('焦点：把手离场或换位之后接得住', () => {
  it('删一行：焦点接给接位的那一行', async () => {
    const service = makeService({ defaultValue: ['甲', '乙', '丙'] })
    const els = mountTriggers(service, 3)
    els.remove[2]!.focus()

    service.send({ type: 'ITEM.REMOVE', index: 2, restoreFocus: true })
    await settle()
    // 删的是末行，接位的是现在的最后一行
    expect(document.activeElement).toBe(els.remove[1])
  })

  it('删到一行不剩：焦点交回新增把手', async () => {
    const service = makeService({ defaultValue: ['甲'] })
    const els = mountTriggers(service, 1)
    els.remove[0]!.focus()

    service.send({ type: 'ITEM.REMOVE', index: 0, restoreFocus: true })
    await settle()
    expect(document.activeElement).toBe(els.add)
  })

  it('换序：焦点落到新位置上同方向的那个把手', async () => {
    const service = makeService({ defaultValue: ['甲', '乙', '丙'], movable: true })
    const els = mountTriggers(service, 3)
    els.moveUp[2]!.focus()

    service.send({ type: 'ITEM.MOVE', from: 2, to: 1, restoreFocus: true })
    await settle()
    expect(document.activeElement).toBe(els.moveUp[1])

    els.moveDown[0]!.focus()
    service.send({ type: 'ITEM.MOVE', from: 0, to: 1, restoreFocus: true })
    await settle()
    expect(document.activeElement).toBe(els.moveDown[1])
  })

  it('程序化调 api.remove 不抢焦点', async () => {
    const service = makeService({ defaultValue: ['甲', '乙'] })
    const els = mountTriggers(service, 2)
    els.add.focus()

    api(service).remove(0)
    await settle()
    expect(document.activeElement).toBe(els.add)
  })
})

describe('接入 FormPath：行号变更只在 Headless 真源迁移', () => {
  it('form 服务只桥接路径真源，控件状态以适配器解析后的 props 为准', () => {
    const users = ['users'] as const
    const form = makeFormService({
      defaultValues: createFormPathRecord([[users, []]]),
      disabled: true,
      readOnly: true,
    })
    const rows = makeService({
      name: users,
      disabled: false,
      readOnly: false,
      createItem: () => '新增行',
    })
    rows.refs.set('form', form)

    expect(api(rows).disabled).toBe(false)
    expect(api(rows).readOnly).toBe(false)
    expect(api(rows).canAdd).toBe(true)
    api(rows).add()
    expect(api(rows).value).toEqual(['新增行'])
  })

  it('字符串 name 只作为一个路径段，点号与方括号绝不被自行拆解', () => {
    const dotted = makeService({ name: 'user.email', defaultValue: ['甲'] })
    const bracketed = makeService({ name: 'users[0]', defaultValue: ['乙'] })
    expect(api(dotted).items[0]?.name).toEqual(['user.email', 0])
    expect(api(bracketed).items[0]?.name).toEqual(['users[0]', 0])
  })

  it('追加行只扩展父数组，已有子路径与同名字符串字段保持原身份', () => {
    const users = ['users'] as const
    const email = ['users', 0, 'email'] as const
    const form = makeFormService({
      defaultValues: createFormPathRecord<unknown>([
        [users, [{ id: 'a' }]],
        [email, 'a@example.com'],
        ['users[0].email', '字符串字段'],
      ]),
      rules: createFormPathRecord<FormRule>([[email, { required: true }]]),
    })
    const rows = makeService({ name: users, createItem: () => ({ id: 'b' }) })
    rows.refs.set('form', form)

    expect(api(rows).items[0]?.name).toEqual(['users', 0])
    api(rows).add()
    const formApi = connectForm(form, normalizeProps)
    expect(api(rows).value).toEqual([{ id: 'a' }, { id: 'b' }])
    expect(formApi.getFieldValue(email)).toBe('a@example.com')
    expect(formApi.getFieldValue('users[0].email')).toBe('字符串字段')
    expect(formApi.isFieldRequired(email)).toBe(true)
  })

  it('删除中间行时，值、规则、错误与已验证错误标记一起收缩，字符串字段绝不被误判为路径', () => {
    const users = ['users'] as const
    const firstEmail = ['users', 0, 'email'] as const
    const removedEmail = ['users', 1, 'email'] as const
    const lastEmail = ['users', 2, 'email'] as const
    const form = makeFormService({
      defaultValues: createFormPathRecord<unknown>([
        [users, [{ id: 'a' }, { id: 'b' }, { id: 'c' }]],
        [firstEmail, 'a@example.com'],
        [removedEmail, 'b@example.com'],
        [lastEmail, 'c@example.com'],
        ['users[1].email', '字符串字段不参与数组迁移'],
      ]),
      rules: createFormPathRecord<FormRule>([
        [firstEmail, { required: true }],
        [removedEmail, { required: true }],
        [lastEmail, { required: true }],
      ]),
    })
    const rows = makeService({ name: users, movable: true })
    rows.refs.set('form', form)

    form.send({ type: 'ERROR.SET', name: removedEmail, message: '将被删除' })
    form.send({ type: 'ERROR.SET', name: lastEmail, message: '应前移' })
    form.refs.get('validatedErrors').add(formPathKey(lastEmail))

    api(rows).remove(1)
    const formApi = connectForm(form, normalizeProps)

    expect(api(rows).value).toEqual([{ id: 'a' }, { id: 'c' }])
    expect(getFormPathValue(formApi.values, users)).toEqual([{ id: 'a' }, { id: 'c' }])
    expect(getFormPathValue(formApi.values, firstEmail)).toBe('a@example.com')
    // 被删行的路径由接位行占用，原有 b 的值已不存在。
    expect(getFormPathValue(formApi.values, removedEmail)).toBe('c@example.com')
    expect(formApi.getFieldValue('users[1].email')).toBe('字符串字段不参与数组迁移')
    expect(formApi.getFieldError(['users', 1, 'email'])).toBe('应前移')
    expect(formApi.isFieldRequired(['users', 1, 'email'])).toBe(true)

    // 标记若仍留在旧下标，下一次编辑会把迁移后的校验错误当成库外错误清掉。
    form.send({ type: 'FIELD.SET', name: ['users', 1, 'email'], value: 'next@example.com' })
    expect(formApi.getFieldError(['users', 1, 'email'])).toBe('应前移')
  })

  it('换序时，进行中的异步校验与执行异常快照跟随同一行写回新路径', async () => {
    const users = ['users'] as const
    const original = ['users', 2, 'email'] as const
    const moved = ['users', 0, 'email'] as const
    let resolveValidator: ((message: string | undefined) => void) | undefined
    const form = makeFormService({
      defaultValues: createFormPathRecord<unknown>([
        [users, [{ id: 'a' }, { id: 'b' }, { id: 'c' }]],
        [['users', 0, 'email'], 'a@example.com'],
        [['users', 1, 'email'], 'b@example.com'],
        [original, 'c@example.com'],
      ]),
      validateOn: 'change',
      rules: createFormPathRecord<FormRule>([[
        original,
        { required: true, validator: () => new Promise<string | undefined>((resolve) => { resolveValidator = resolve }) },
      ]]),
    })
    const rows = makeService({ name: users, movable: true })
    rows.refs.set('form', form)

    form.send({ type: 'FIELD.SET', name: original, value: 'changed@example.com' })
    expect(form.refs.get('validation').get(formPathKey(original))?.pending).toBe(true)

    form.context.set('validationError', {
      cause: new Error('旧行异常'),
      values: form.context.get('values'),
      field: [...original],
    })
    api(rows).move(2, 0)

    const task = form.refs.get('validation').get(formPathKey(moved))
    expect(task?.field).toEqual(moved)
    expect(getFormPathValue(task?.values, moved)).toBe('changed@example.com')
    expect(connectForm(form, normalizeProps).validationError?.field).toEqual(moved)
    expect(connectForm(form, normalizeProps).isFieldRequired(moved)).toBe(true)

    resolveValidator?.('异步错误')
    await settle()
    await settle()
    expect(connectForm(form, normalizeProps).getFieldError(moved)).toBe('异步错误')
  })
})

describe('把手投影 Action Control 家族属性', () => {
  const HANDLE = {
    'data-xh-action-control': '',
    'data-xh-action-profile': 'icon',
    'data-xh-action-variant': 'ghost',
    'data-xh-action-display': 'always',
    'data-xh-action-size': 'xs',
  }

  it('三颗行内把手是只有字形的离散动作钮：icon ghost 档、xs 正方盒、常显', () => {
    const service = makeService({ defaultValue: ['甲', '乙'], movable: true })
    const [row] = api(service).items
    const a = api(service)
    for (const props of [a.getItemDeleteTriggerProps(row!), a.getMoveUpTriggerProps(row!), a.getMoveDownTriggerProps(row!)]) {
      const dict = props as Record<string, unknown>
      for (const [key, value] of Object.entries(HANDLE))
        expect(dict[key], key).toBe(value)
    }
  })

  it('新增把手是带文案的动作钮：text outline 档、md 高、常显', () => {
    const add = api(makeService()).getAddTriggerProps() as Record<string, unknown>
    expect(add['data-xh-action-control']).toBe('')
    expect(add['data-xh-action-profile']).toBe('text')
    expect(add['data-xh-action-variant']).toBe('outline')
    expect(add['data-xh-action-display']).toBe('always')
    expect(add['data-xh-action-size']).toBe('md')
  })

  it('按不动的把手同时打 aria-disabled 与 data-disabled：前者给读屏，后者给家族收反馈', () => {
    const service = makeService({ defaultValue: ['甲'], min: 1, max: 1 })
    const a = api(service)
    const [row] = a.items
    const remove = a.getItemDeleteTriggerProps(row!) as Record<string, unknown>
    expect(remove['aria-disabled']).toBe('true')
    expect(remove['data-disabled']).toBe('')
    const add = a.getAddTriggerProps() as Record<string, unknown>
    expect(add['aria-disabled']).toBe('true')
    expect(add['data-disabled']).toBe('')
  })
})

describe('按压通道：Space / Enter 与触屏按住投影 data-pressed', () => {
  type Handlers = Record<string, (e?: unknown) => void> & { 'data-pressed'?: string, 'aria-disabled'?: string }
  const keyEvent = (key: string): KeyboardEvent => ({ key, repeat: false, isComposing: false } as unknown as KeyboardEvent)
  const touch = { pointerType: 'touch' } as unknown as PointerEvent
  const mouse = { pointerType: 'mouse' } as unknown as PointerEvent
  const add = (service: Svc): Handlers => api(service).getAddTriggerProps() as unknown as Handlers
  const del = (service: Svc, index: number): Handlers => api(service).getItemDeleteTriggerProps({ index }) as unknown as Handlers
  const up = (service: Svc, index: number): Handlers => api(service).getMoveUpTriggerProps({ index }) as unknown as Handlers
  const down = (service: Svc, index: number): Handlers => api(service).getMoveDownTriggerProps({ index }) as unknown as Handlers
  const pressed = (h: Handlers): boolean => h['data-pressed'] === ''

  it('新增把手：keydown 在场、keyup 撤下；失焦撤下；触屏按下在场、抬起 / 取消撤下；鼠标不走这一路', () => {
    const service = makeService({ defaultValue: ['甲'] })
    expect(pressed(add(service))).toBe(false)
    add(service).onKeyDown!(keyEvent(' '))
    expect(pressed(add(service))).toBe(true)
    add(service).onKeyUp!(keyEvent(' '))
    expect(pressed(add(service))).toBe(false)
    add(service).onKeyDown!(keyEvent('Enter'))
    expect(pressed(add(service))).toBe(true)
    add(service).onBlur!()
    expect(pressed(add(service))).toBe(false)
    add(service).onPointerDown!(touch)
    expect(pressed(add(service))).toBe(true)
    add(service).onPointerCancel!()
    expect(pressed(add(service))).toBe(false)
    add(service).onPointerDown!(touch)
    expect(pressed(add(service))).toBe(true)
    add(service).onPointerUp!()
    expect(pressed(add(service))).toBe(false)
    add(service).onPointerDown!(mouse)
    expect(pressed(add(service))).toBe(false)
    // 按住本身不加行
    expect(api(service).count).toBe(1)
  })

  it('行内把手按行序号只亮那一颗；另一颗把手的 keyup 松不开正按着的这个', () => {
    const service = makeService({ defaultValue: ['甲', '乙'], movable: true })
    del(service, 1).onKeyDown!(keyEvent('Enter'))
    expect(pressed(del(service, 1))).toBe(true)
    expect(pressed(del(service, 0))).toBe(false)
    expect(pressed(up(service, 1))).toBe(false)
    expect(pressed(down(service, 1))).toBe(false)
    up(service, 1).onKeyUp!(keyEvent('Enter'))
    expect(pressed(del(service, 1))).toBe(true)
    del(service, 1).onKeyUp!(keyEvent('Enter'))
    expect(pressed(del(service, 1))).toBe(false)

    up(service, 1).onPointerDown!(touch)
    expect(pressed(up(service, 1))).toBe(true)
    expect(pressed(down(service, 1))).toBe(false)
    up(service, 1).onPointerUp!()
    expect(pressed(up(service, 1))).toBe(false)
  })

  it('按住途中这一行被删掉（Enter 在 keydown 即删）：机器当场松开，接位的行不会顶着按压面', () => {
    const service = makeService({ defaultValue: ['甲', '乙', '丙'] })
    del(service, 1).onKeyDown!(keyEvent('Enter'))
    expect(pressed(del(service, 1))).toBe(true)
    api(service).remove(1)
    expect(api(service).value).toEqual(['甲', '丙'])
    expect(pressed(del(service, 0))).toBe(false)
    expect(pressed(del(service, 1))).toBe(false)
    expect(service.context.get('pressed')).toBeFalsy()
  })

  it('按住途中这一行被挪走（Enter 在 keydown 即换序）：机器当场松开，号跟着行走、新位置上的把手也不带按压面', () => {
    const service = makeService({ defaultValue: ['甲', '乙', '丙'], movable: true })
    down(service, 0).onKeyDown!(keyEvent('Enter'))
    expect(pressed(down(service, 0))).toBe(true)
    api(service).moveDown(0)
    expect(api(service).value).toEqual(['乙', '甲', '丙'])
    expect(pressed(down(service, 0))).toBe(false)
    expect(pressed(down(service, 1))).toBe(false)
    expect(service.context.get('pressed')).toBeFalsy()
  })

  it('作者整份换掉值、按住的行不在了：由 watch 松开；行还在则照旧按着', () => {
    const service = makeService({ defaultValue: ['甲', '乙'] })
    del(service, 1).onPointerDown!(touch)
    expect(pressed(del(service, 1))).toBe(true)
    // 行数没变：按位置续用旧号，行还在
    api(service).setValue(['A', 'B'])
    expect(pressed(del(service, 1))).toBe(true)
    // 少了一行：末行的号随之离场
    api(service).setValue(['A'])
    expect(service.context.get('pressed')).toBeFalsy()
    expect(pressed(del(service, 0))).toBe(false)
  })

  it('不进：整体禁用 / 只读；到上限的新增把手、到下限的删除把手、首行上移与末行下移都是 aria-disabled', () => {
    for (const props of [{ disabled: true }, { readOnly: true }]) {
      const service = makeService({ defaultValue: ['甲', '乙'], movable: true, ...props })
      add(service).onKeyDown!(keyEvent(' '))
      del(service, 0).onPointerDown!(touch)
      up(service, 1).onKeyDown!(keyEvent('Enter'))
      expect(service.context.get('pressed')).toBeFalsy()
    }
    const edge = makeService({ defaultValue: ['甲', '乙'], movable: true, min: 2, max: 2 })
    expect(add(edge)['aria-disabled']).toBe('true')
    add(edge).onKeyDown!(keyEvent(' '))
    expect(pressed(add(edge))).toBe(false)
    expect(del(edge, 0)['aria-disabled']).toBe('true')
    del(edge, 0).onPointerDown!(touch)
    expect(pressed(del(edge, 0))).toBe(false)
    expect(up(edge, 0)['aria-disabled']).toBe('true')
    up(edge, 0).onKeyDown!(keyEvent('Enter'))
    expect(pressed(up(edge, 0))).toBe(false)
    expect(down(edge, 1)['aria-disabled']).toBe('true')
    down(edge, 1).onPointerDown!(touch)
    expect(pressed(down(edge, 1))).toBe(false)
    // 同一行里按得动的方向照常进
    down(edge, 0).onPointerDown!(touch)
    expect(pressed(down(edge, 0))).toBe(true)
  })

  it('按住途中转入禁用 / 只读：不会再来 keyup，按压面由机器自己收', () => {
    for (const inert of [{ disabled: true }, { readOnly: true }]) {
      // 夹具的 props 是普通对象，watch 只在 props 身份变化时复查，走 signal 才惊动它
      const runtime = createVanillaRuntime()
      const props = runtime.signal<Props>({ defaultValue: ['甲'] })
      const service = createService(fieldArrayMachine, { props: () => props.get(), runtime })
      runtime.start()
      add(service).onKeyDown!(keyEvent('Enter'))
      expect(pressed(add(service))).toBe(true)
      props.set({ defaultValue: ['甲'], ...inert })
      expect(pressed(add(service))).toBe(false)
      runtime.stop()
    }
  })
})

describe('在指定位置插入', () => {
  it('fieldArrayInsertIndex 取整后夹到 0 到行数之间；没给或非有限数即追加', () => {
    expect(fieldArrayInsertIndex(1, 3)).toBe(1)
    expect(fieldArrayInsertIndex(1.8, 3)).toBe(1)
    expect(fieldArrayInsertIndex(-2, 3)).toBe(0)
    expect(fieldArrayInsertIndex(9, 3)).toBe(3)
    expect(fieldArrayInsertIndex(undefined, 3)).toBe(3)
    expect(fieldArrayInsertIndex(Number.NaN, 3)).toBe(3)
  })

  it('insert 在中间插一行：新行拿新号，前后各行的号原样不动', () => {
    const service = makeService({ defaultValue: ['甲', '丙'], createItem: () => '空' })
    const before = keys(service)
    api(service).insert(1, '乙')
    expect(api(service).value).toEqual(['甲', '乙', '丙'])
    const after = keys(service)
    expect([after[0], after[2]]).toEqual(before)
    expect(before).not.toContain(after[1])

    // 不给 item 就由 createItem 造；插在最前
    api(service).insert(0)
    expect(api(service).value).toEqual(['空', '甲', '乙', '丙'])
  })

  it('insert 受 max 与禁用约束，越界的下标夹到两端', () => {
    const onValueChange = vi.fn()
    const full = makeService({ defaultValue: ['甲'], max: 1, onValueChange })
    api(full).insert(0, '乙')
    expect(api(full).value).toEqual(['甲'])
    expect(onValueChange).not.toHaveBeenCalled()

    const disabled = makeService({ defaultValue: ['甲'], disabled: true })
    api(disabled).insert(0, '乙')
    expect(api(disabled).value).toEqual(['甲'])

    const clamped = makeService({ defaultValue: ['甲'] })
    api(clamped).insert(99, '尾')
    api(clamped).insert(-5, '头')
    expect(api(clamped).value).toEqual(['头', '甲', '尾'])
  })

  it('受控时只发意图：宿主不写回则值与行号都不动', () => {
    const onValueChange = vi.fn()
    const service = makeService({ value: ['甲', '丙'], onValueChange })
    const before = keys(service)
    api(service).insert(1, '乙')
    expect(onValueChange).toHaveBeenCalledWith({ value: ['甲', '乙', '丙'], mutation: { type: 'insert', index: 1 } })
    expect(api(service).value).toEqual(['甲', '丙'])
    expect(keys(service)).toEqual(before)
  })

  it('move 可以一步挪到任意位置，号跟着行走', () => {
    const service = makeService({ defaultValue: ['甲', '乙', '丙', '丁'], movable: true })
    const before = keys(service)
    api(service).move(3, 0)
    expect(api(service).value).toEqual(['丁', '甲', '乙', '丙'])
    expect(keys(service)).toEqual([before[3], before[0], before[1], before[2]])
  })

  it('嵌在 Form 里插在中间：后面各行的值、规则与错误一起后移', () => {
    const users = ['users'] as const
    const secondEmail = ['users', 1, 'email'] as const
    const form = makeFormService({
      defaultValues: createFormPathRecord<unknown>([
        [users, [{ id: 'a' }, { id: 'c' }]],
        [secondEmail, 'c@example.com'],
      ]),
      rules: createFormPathRecord<FormRule>([[secondEmail, { required: true }]]),
    })
    const rows = makeService({ name: users })
    rows.refs.set('form', form)
    form.send({ type: 'ERROR.SET', name: secondEmail, message: '随行后移' })

    api(rows).insert(1, { id: 'b' })
    const formApi = connectForm(form, normalizeProps)
    expect(api(rows).value).toEqual([{ id: 'a' }, { id: 'b' }, { id: 'c' }])
    expect(getFormPathValue(formApi.values, ['users', 2, 'email'])).toBe('c@example.com')
    expect(formApi.getFieldError(['users', 2, 'email'])).toBe('随行后移')
    expect(formApi.isFieldRequired(['users', 2, 'email'])).toBe(true)
    expect(formApi.getFieldError(secondEmail)).toBeFalsy()
  })
})

describe('value-change 带上行变更', () => {
  it('非受控、不在表单里：增、删、移与整份写值各带对应的 mutation', () => {
    const onValueChange = vi.fn()
    const service = makeService({ defaultValue: ['甲', '乙'], movable: true, onValueChange, createItem: () => '新' })
    api(service).add()
    api(service).remove(0)
    api(service).moveDown(0)
    api(service).setValue(['丙'])
    expect(onValueChange.mock.calls.map(([details]) => details.mutation)).toEqual([
      { type: 'insert', index: 2 },
      { type: 'remove', index: 0 },
      { type: 'move', from: 0, to: 1 },
      { type: 'replace', length: 1 },
    ])
    expect(onValueChange.mock.calls.at(-1)![0].value).toEqual(['丙'])
  })

  it('受控时整份写值同样带 replace：宿主据此整份迁移行级状态', () => {
    const onValueChange = vi.fn()
    const service = makeService({ value: ['甲'], onValueChange })
    api(service).setValue(['乙'])
    expect(onValueChange).toHaveBeenLastCalledWith({ value: ['乙'], mutation: { type: 'replace', length: 1 } })
  })

  it('在表单里：字段组的 value-change 与表单的 values-change 带同一份行变更', () => {
    const users = ['users'] as const
    const onValuesChange = vi.fn()
    const form = makeFormService({ defaultValues: createFormPathRecord([[users, ['甲', '乙']]]), onValuesChange })
    const onValueChange = vi.fn()
    const rows = makeService({ name: users, onValueChange })
    rows.refs.set('form', form)
    api(rows).remove(1)
    expect(onValueChange).toHaveBeenLastCalledWith({ value: ['甲'], mutation: { type: 'remove', index: 1 } })
    expect(onValuesChange.mock.calls.at(-1)![0].arrayMutation).toEqual({ name: users, mutation: { type: 'remove', index: 1 } })
  })

  it('不是字段组发起的变化不带：表单重置、直接写字段值', () => {
    const users = ['users'] as const
    const onValuesChange = vi.fn()
    const form = makeFormService({ defaultValues: createFormPathRecord([[users, ['甲', '乙']]]), onValuesChange })
    const rows = makeService({ name: users })
    rows.refs.set('form', form)
    const formApi = connectForm(form, normalizeProps)
    api(rows).remove(1)
    formApi.reset()
    expect(onValuesChange.mock.calls.at(-1)![0]).not.toHaveProperty('arrayMutation')
    formApi.setFieldValue(users, ['丙'])
    expect(onValuesChange.mock.calls.at(-1)![0]).not.toHaveProperty('arrayMutation')
  })
})

describe('表格排布：角色、行号与列轨道', () => {
  const columns = [
    { id: 'date', label: '日期', width: 120 },
    { id: 'amount', width: '8rem' },
    { id: 'note' },
  ]

  it('table 部件是 role=table，aria-rowcount 算上表头；列宽数字按 px、字符串原样、不写按 1fr', () => {
    const service = makeService({ layout: 'table', columns, defaultValue: ['a', 'b'] })
    const a = api(service)
    expect(a.layout).toBe('table')
    expect(a.columns).toBe(columns)
    const table = a.getTableProps() as Record<string, unknown>
    expect(table.role).toBe('table')
    expect(table['aria-rowcount']).toBe(3)
    expect((table.style as Record<string, string>)['--xh-_field-array-cols']).toBe('120px 8rem minmax(0, 1fr)')
    expect((a.getRootProps() as Record<string, unknown>).role).toBeUndefined()
  })

  it('表头是第 1 行，数据行从第 2 行起；行头 rowheader，格子与把手格 cell；格子按列 id 落到对应轨道', () => {
    const service = makeService({ layout: 'table', columns, defaultValue: ['a', 'b'] })
    const a = api(service)
    const header = a.getHeaderProps() as Record<string, unknown>
    expect([header.role, header['aria-rowindex'], header.hidden]).toEqual(['row', 1, undefined])
    const columnHeader = a.getColumnHeaderProps({ value: 'amount' }) as Record<string, unknown>
    expect([columnHeader.role, columnHeader['data-value']]).toEqual(['columnheader', 'amount'])
    expect((columnHeader.style as Record<string, string>).gridColumn).toBe('3')
    const item = a.getItemProps({ index: 1 }) as Record<string, unknown>
    expect([item.role, item['aria-rowindex']]).toEqual(['row', 3])
    expect((a.getItemLabelProps({ index: 0 }) as Record<string, unknown>).role).toBe('rowheader')
    const cell = a.getItemCellProps({ index: 0, value: 'date' }) as Record<string, unknown>
    expect([cell.role, cell['data-value']]).toEqual(['cell', 'date'])
    expect((cell.style as Record<string, string>).gridColumn).toBe('2')
    const action = a.getItemActionProps({ index: 0 }) as Record<string, unknown>
    expect(action.role).toBe('cell')
    expect((action.style as Record<string, string>).gridColumn).toBe('-2 / -1')
  })

  it('给了 minWidth 的列写成 minmax(下限, 列宽)：数字按 px，不写列宽时上限是 1fr', () => {
    const service = makeService({
      layout: 'table',
      columns: [{ id: 'name', minWidth: 120 }, { id: 'type', minWidth: '6rem', width: '2fr' }, { id: 'flag', minWidth: 48, width: 64 }, { id: 'note' }],
      defaultValue: ['a'],
    })
    const table = api(service).getTableProps() as Record<string, unknown>
    expect((table.style as Record<string, string>)['--xh-_field-array-cols']).toBe('minmax(120px, 1fr) minmax(6rem, 2fr) minmax(48px, 64px) minmax(0, 1fr)')
  })

  it('表格本体报横向滚动离两端：没量过时两端都贴着；列表排布不报', () => {
    const table = api(makeService({ layout: 'table', columns, defaultValue: ['a'] })).getTableProps() as Record<string, unknown>
    expect([table['data-at-min-horizontal'], table['data-at-max-horizontal']]).toEqual(['', ''])
    const list = api(makeService({ columns, defaultValue: ['a'] })).getTableProps() as Record<string, unknown>
    expect([list['data-at-min-horizontal'], list['data-at-max-horizontal']]).toEqual([undefined, undefined])
  })

  it('格子的列 id 不在 columns 里：不指定轨道，由排布自然流入', () => {
    const service = makeService({ layout: 'table', columns, defaultValue: ['a'] })
    const cell = api(service).getItemCellProps({ index: 0, value: 'missing' }) as Record<string, unknown>
    expect((cell.style as Record<string, string> | undefined)?.gridColumn ?? '').toBe('')
  })

  it('列表排布（缺省）：各部件不带表格角色，表头与列头收起，行与格不带行号和轨道', () => {
    const service = makeService({ columns, defaultValue: ['a'] })
    const a = api(service)
    expect(a.layout).toBe('list')
    const table = a.getTableProps() as Record<string, unknown>
    expect([table.role, table['aria-rowcount']]).toEqual([undefined, undefined])
    const header = a.getHeaderProps() as Record<string, unknown>
    expect([header.role, header.hidden]).toEqual([undefined, true])
    expect((a.getColumnHeaderProps({ value: 'date' }) as Record<string, unknown>).hidden).toBe(true)
    const item = a.getItemProps({ index: 0 }) as Record<string, unknown>
    expect([item.role, item['aria-rowindex'], item['data-layout']]).toEqual([undefined, undefined, 'list'])
    expect((a.getItemLabelProps({ index: 0 }) as Record<string, unknown>).role).toBeUndefined()
    expect((a.getItemActionProps({ index: 0 }) as Record<string, unknown>).role).toBeUndefined()
  })

  it('不认识的 layout 按 list；没给 columns 时 columns 为空数组，不写列轨道', () => {
    const service = makeService({ layout: 'grid' as never, defaultValue: ['a'] })
    expect(api(service).layout).toBe('list')
    const tableService = makeService({ layout: 'table', defaultValue: ['a'] })
    const a = api(tableService)
    expect(a.columns).toEqual([])
    expect(((a.getTableProps() as Record<string, unknown>).style as Record<string, string> | undefined)?.['--xh-_field-array-cols'] ?? '').toBe('')
  })

  it('增删之后行号与 aria-rowcount 跟着行数走', () => {
    const service = makeService({ layout: 'table', columns, defaultValue: ['a', 'b'], createItem: () => 'n' })
    api(service).add()
    const a = api(service)
    expect((a.getTableProps() as Record<string, unknown>)['aria-rowcount']).toBe(4)
    expect((a.getItemProps({ index: 2 }) as Record<string, unknown>)['aria-rowindex']).toBe(4)
    a.remove(0)
    expect((api(service).getTableProps() as Record<string, unknown>)['aria-rowcount']).toBe(3)
  })
})

describe('value-change 处理函数里读到的行号', () => {
  it('增、删、移的通知派发时 items 已是随后落定的号：作者能当场按行 key 补上或删掉这一行的内容', async () => {
    const seen: string[][] = []
    const props: Props = { defaultValue: ['甲', '乙'], movable: true, createItem: () => '新' }
    const service = makeService(props)
    props.onValueChange = () => seen.push(keys(service))
    api(service).add()
    await settle()
    expect(seen.at(-1)).toEqual(keys(service))
    expect(seen.at(-1)!.every(key => !key.includes('@'))).toBe(true)
    api(service).moveDown(0)
    await settle()
    expect(seen.at(-1)).toEqual(keys(service))
    api(service).remove(1)
    await settle()
    expect(seen.at(-1)).toEqual(keys(service))
  })
})

describe('fieldArrayStructure', () => {
  const parts = (nodes: readonly StructureChild[]): string[] => nodes.map(node => ('part' in node ? node.part : 'other'))

  it('列表排布：每行是行号、带行 key 插槽的内容格与删除钮，最后是新增钮', () => {
    const a = api(makeService({ defaultValue: ['甲', '乙'] }))
    const nodes = fieldArrayStructure(a) as StructureNode[]
    expect(parts(nodes)).toEqual(['item', 'item', 'add-trigger'])
    expect(nodes.at(-1)).toMatchObject({ text: a.translations.addTrigger })
    const row = nodes[0]!
    expect(row.attrs).toEqual({ index: '0' })
    expect(parts(row.children!)).toEqual(['item-label', 'item-content', 'item-action'])
    expect(row.children![0]).toMatchObject({ text: '1' })
    expect(row.children![1]).toMatchObject({ slot: { name: 'item-content', key: a.items[0]!.key }, data: a.items[0] })
    expect(parts((row.children![2] as StructureNode).children!)).toEqual(['item-delete-trigger'])
  })

  it('开了 movable 时把手是上移、下移、删除', () => {
    const nodes = fieldArrayStructure(api(makeService({ defaultValue: ['甲'], movable: true }))) as StructureNode[]
    expect(parts((nodes[0]!.children![2] as StructureNode).children!)).toEqual(['move-up-trigger', 'move-down-trigger', 'item-delete-trigger'])
  })

  it('表格排布：表格本体里是表头（每列一个列头）与各行，行里每列一格，插槽 key 是「行 key:列 id」', () => {
    const a = api(makeService({ layout: 'table', columns: [{ id: 'name' }, { id: 'amount' }], defaultValue: [{}] }))
    const nodes = fieldArrayStructure(a) as StructureNode[]
    expect(parts(nodes)).toEqual(['table', 'add-trigger'])
    const table = nodes[0]!.children! as StructureNode[]
    expect(parts(table)).toEqual(['header', 'item'])
    expect((table[0]!.children! as StructureNode[]).map(header => header.attrs?.value)).toEqual(['name', 'amount'])
    const cells = table[1]!.children! as StructureNode[]
    expect(parts(cells)).toEqual(['item-label', 'item-cell', 'item-cell', 'item-action'])
    expect(cells[2]).toMatchObject({ attrs: { value: 'amount' }, slot: { name: 'item-cell', key: `${a.items[0]!.key}:amount` }, data: { item: a.items[0], column: { id: 'amount' } } })
  })
})
