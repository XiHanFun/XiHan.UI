import type { TagOpenChangeDetails, TagSchema } from '../src/tag'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { describe, expect, it } from 'vitest'
// 直接指向组件目录：包主入口的导出由接线一并补，测试不等它
import { connectStaticTag, connectTag, tagMachine, tagVariantForControl } from '../src/tag'

type Props = TagSchema['props']

/** props 走 signal 而不是裸对象：改 prop 要真的惊动 watch，才验得到受控回写那一路。 */
function makeTag(initial: Props = {}) {
  const runtime = createVanillaRuntime()
  const props = runtime.signal<Props>(initial)
  const service = createService(tagMachine, { props: () => props.get(), runtime })
  runtime.start()
  return {
    state: () => service.state.get(),
    setProps: (next: Props) => props.set({ ...props.get(), ...next }),
    api: () => connectTag(service, normalizeProps),
    stop: () => runtime.stop(),
  }
}

/** 关闭钮的处理器不读事件对象，直接调即可（node 环境里没有 MouseEvent）。 */
function press(props: { onClick?: unknown }): void {
  (props.onClick as () => void)()
}

describe('tagMachine 起步状态', () => {
  it('什么都不给即显示；defaultOpen=false 起步收起；open 压过 defaultOpen', () => {
    expect(makeTag().state()).toBe('open')
    expect(makeTag({ defaultOpen: false }).state()).toBe('closed')
    expect(makeTag({ open: false, defaultOpen: true }).state()).toBe('closed')
  })
})

describe('tagMachine 非受控', () => {
  it('关闭钮落状态并通知一次；已收起再关不重复通知', () => {
    const seen: TagOpenChangeDetails[] = []
    const t = makeTag({ closable: true, onOpenChange: d => seen.push(d) })

    press(t.api().getCloseTriggerProps())
    expect(t.state()).toBe('closed')
    expect(seen).toEqual([{ open: false }])

    t.api().setOpen(false)
    expect(seen).toEqual([{ open: false }])

    t.api().setOpen(true)
    expect(t.state()).toBe('open')
    expect(seen).toEqual([{ open: false }, { open: true }])
  })
})

describe('tagMachine 受控', () => {
  it('open 给定时点击只发意图不自改状态，宿主写回后才转移', () => {
    const seen: TagOpenChangeDetails[] = []
    const t = makeTag({ closable: true, open: true, onOpenChange: d => seen.push(d) })

    press(t.api().getCloseTriggerProps())
    expect(t.state()).toBe('open')
    expect(seen).toEqual([{ open: false }])

    t.setProps({ open: false })
    expect(t.state()).toBe('closed')
    // 回写不再通知第二遍
    expect(seen).toEqual([{ open: false }])
  })

  it('open 变回 undefined 即转非受控，不强制收起', () => {
    const t = makeTag({ open: true })
    t.setProps({ open: undefined })
    expect(t.state()).toBe('open')
  })
})

describe('connectTag 三轴', () => {
  it('三轴原样透传到 root，没写的轴不产出属性；子部件不重复标注', () => {
    const bare = makeTag().api().getRootProps()
    expect(bare['data-variant']).toBeUndefined()
    expect(bare['data-tone']).toBeUndefined()
    expect(bare['data-size']).toBeUndefined()

    const dressed = makeTag({ variant: 'solid', tone: 'brand', size: 'lg' }).api()
    const root = dressed.getRootProps()
    expect(root['data-variant']).toBe('solid')
    expect(root['data-tone']).toBe('brand')
    expect(root['data-size']).toBe('lg')

    const label = dressed.getLabelProps()
    expect(label['data-variant']).toBeUndefined()
    expect(label['data-tone']).toBeUndefined()
    expect(label['data-size']).toBeUndefined()

    expect(makeTag({ variant: 'ghost' }).api().getRootProps()['data-variant']).toBe('ghost')
  })

  it('root 不带 role：标签是展示节点，交互只在关闭钮上', () => {
    expect(makeTag().api().getRootProps().role).toBeUndefined()
  })
})

describe('connectTag 显隐', () => {
  it('收起态给 root 打 hidden 与 data-state=closed，展开态两者都不留假值', () => {
    const t = makeTag({ closable: true })
    expect(t.api().getRootProps().hidden).toBeUndefined()
    expect(t.api().getRootProps()['data-state']).toBe('open')

    t.api().setOpen(false)
    expect(t.api().getRootProps().hidden).toBe(true)
    expect(t.api().getRootProps()['data-state']).toBe('closed')
  })
})

describe('connectTag 关闭钮', () => {
  it('可访问名默认 Delete，与 select、tags-input 里同一个动作用同一个词', () => {
    expect(makeTag().api().getCloseTriggerProps()['aria-label']).toBe('Delete')
    expect(makeTag({ translations: { close: '移除 前端' } }).api().getCloseTriggerProps()['aria-label']).toBe('移除 前端')
  })

  it('closable 缺省为假：按钮禁用并收起，直接调 onClick 也不收标签', () => {
    const seen: TagOpenChangeDetails[] = []
    const t = makeTag({ onOpenChange: d => seen.push(d) })
    const close = t.api().getCloseTriggerProps()

    expect(t.api().closable).toBe(false)
    expect(close.disabled).toBe(true)
    expect(close['data-disabled']).toBe('')
    expect(close.hidden).toBe(true)
    expect(close.type).toBe('button')

    press(close)
    expect(t.state()).toBe('open')
    expect(seen).toEqual([])
  })

  it('disabled 与 closable 同真：按钮留在原位但禁用，点不动', () => {
    const seen: TagOpenChangeDetails[] = []
    const t = makeTag({ closable: true, disabled: true, onOpenChange: d => seen.push(d) })
    const close = t.api().getCloseTriggerProps()

    // 只是禁用而非不可关闭：叉仍占着位置，标签宽度不因禁用跳变
    expect(close.hidden).toBeUndefined()
    expect(close.disabled).toBe(true)
    expect(close['data-disabled']).toBe('')
    expect(t.api().getRootProps()['data-disabled']).toBe('')

    press(close)
    expect(t.state()).toBe('open')
    expect(seen).toEqual([])
  })

  it('closable=true 且未禁用时按钮可用，root 不打 data-disabled', () => {
    const t = makeTag({ closable: true })
    const close = t.api().getCloseTriggerProps()
    expect(close.disabled).toBeUndefined()
    expect(close['data-disabled']).toBeUndefined()
    expect(close.hidden).toBeUndefined()
    expect(t.api().getRootProps()['data-disabled']).toBeUndefined()
  })
})

describe('connectTag 只读', () => {
  it('readOnly 与 closable 同真：按钮留在原位但禁用，root 不打 data-disabled，点不动也不通知', () => {
    const seen: TagOpenChangeDetails[] = []
    const t = makeTag({ closable: true, readOnly: true, onOpenChange: d => seen.push(d) })
    const close = t.api().getCloseTriggerProps()

    // 只读只锁那颗叉：钮留在原位、宽度不跳变，标签本身不置灰
    expect(close.hidden).toBeUndefined()
    expect(close.disabled).toBe(true)
    expect(close['data-disabled']).toBe('')
    expect(t.api().getRootProps()['data-disabled']).toBeUndefined()
    expect(t.api().disabled).toBe(false)

    press(close)
    expect(t.state()).toBe('open')
    expect(seen).toEqual([])
  })

  it('readOnly 不改 closable：不给关闭钮时按钮照旧收起', () => {
    const close = makeTag({ readOnly: true }).api().getCloseTriggerProps()
    expect(close.hidden).toBe(true)
    expect(close.disabled).toBe(true)
  })

  it('readOnly 撤掉后按钮当场解禁', () => {
    const t = makeTag({ closable: true, readOnly: true })
    expect(t.api().getCloseTriggerProps().disabled).toBe(true)

    t.setProps({ readOnly: false })
    expect(t.api().getCloseTriggerProps().disabled).toBeUndefined()
    expect(t.api().getCloseTriggerProps()['data-disabled']).toBeUndefined()
  })

  it('快路同一条规矩：受控 open 下只读的关闭钮不发意图', () => {
    const seen: TagOpenChangeDetails[] = []
    const api = connectStaticTag(
      { closable: true, readOnly: true, open: true, onOpenChange: d => seen.push(d) },
      { get: () => true, set: () => {} },
      normalizeProps,
    )
    const close = api.getCloseTriggerProps()
    expect(close.disabled).toBe(true)
    expect(close.hidden).toBeUndefined()
    expect(api.getRootProps()['data-disabled']).toBeUndefined()

    press(close)
    expect(seen).toEqual([])
  })

  it('快路已关闭时再次触发 close 不重复发相同受控意图', () => {
    const seen: TagOpenChangeDetails[] = []
    const api = connectStaticTag(
      { closable: true, open: false, onOpenChange: details => seen.push(details) },
      { get: () => false, set: () => {} },
      normalizeProps,
    )

    press(api.getCloseTriggerProps())

    expect(seen).toEqual([])
  })
})

describe('tagVariantForControl 控件面到标签形态', () => {
  it('subtle 面上摆描边标签；outline / ghost / 缺省的面摆淡底标签', () => {
    expect(tagVariantForControl('subtle')).toBe('outline')
    expect(tagVariantForControl('outline')).toBe('subtle')
    expect(tagVariantForControl('ghost')).toBe('subtle')
    expect(tagVariantForControl(undefined)).toBe('subtle')
  })
})

describe('按压通道', () => {
  type Handlers = Record<string, unknown> & {
    onKeyDown: (e: KeyboardEvent) => void
    onKeyUp: (e: KeyboardEvent) => void
    onBlur: () => void
    onPointerDown: (e: PointerEvent) => void
    onPointerUp: () => void
    onPointerCancel: () => void
  }
  /** 键盘桩：只带跟踪器会读的三个字段（node 环境里没有 KeyboardEvent）。 */
  const key = (name: string, init: Partial<KeyboardEvent> = {}): KeyboardEvent =>
    ({ key: name, repeat: false, isComposing: false, keyCode: 0, ...init } as KeyboardEvent)
  const touch = { pointerType: 'touch' } as PointerEvent
  const mouse = { pointerType: 'mouse' } as PointerEvent
  const closeOf = (t: ReturnType<typeof makeTag>): Handlers => t.api().getCloseTriggerProps() as Handlers
  const rootOf = (t: ReturnType<typeof makeTag>): Handlers => t.api().getRootProps() as Handlers

  it('关闭钮：Space / Enter 按住投影 data-pressed，长按重复键不重报，抬起撤下；root 不跟着亮', () => {
    const t = makeTag({ closable: true })
    expect(closeOf(t)['data-pressed']).toBeUndefined()
    closeOf(t).onKeyDown(key(' '))
    expect(closeOf(t)['data-pressed']).toBe('')
    expect(rootOf(t)['data-pressed']).toBeUndefined()
    closeOf(t).onKeyDown(key(' ', { repeat: true }))
    expect(closeOf(t)['data-pressed']).toBe('')
    closeOf(t).onKeyUp(key(' '))
    expect(closeOf(t)['data-pressed']).toBeUndefined()
    closeOf(t).onKeyDown(key('Enter'))
    expect(closeOf(t)['data-pressed']).toBe('')
    // 另一个部件的抬起不串：root 的 keyup 松不开关闭钮
    rootOf(t).onKeyUp(key('Enter'))
    expect(closeOf(t)['data-pressed']).toBe('')
    closeOf(t).onBlur()
    expect(closeOf(t)['data-pressed']).toBeUndefined()
    // 别的键不算按压
    closeOf(t).onKeyDown(key('a'))
    expect(closeOf(t)['data-pressed']).toBeUndefined()
    expect(t.state()).toBe('open')
  })

  it('触屏按下进按压面，抬起或取消撤下；鼠标按下不走这一路。root 同一条通道', () => {
    const t = makeTag({ closable: true })
    closeOf(t).onPointerDown(mouse)
    expect(closeOf(t)['data-pressed']).toBeUndefined()
    closeOf(t).onPointerDown(touch)
    expect(closeOf(t)['data-pressed']).toBe('')
    closeOf(t).onPointerCancel()
    expect(closeOf(t)['data-pressed']).toBeUndefined()
    closeOf(t).onPointerDown(touch)
    closeOf(t).onPointerUp()
    expect(closeOf(t)['data-pressed']).toBeUndefined()

    rootOf(t).onPointerDown(touch)
    expect(rootOf(t)['data-pressed']).toBe('')
    expect(closeOf(t)['data-pressed']).toBeUndefined()
    rootOf(t).onPointerUp()
    expect(rootOf(t)['data-pressed']).toBeUndefined()

    // 关闭钮嵌在本体里，按在钮上那一下会冒泡到本体：先到的（钮）算数，本体那一下不进；钮抬起后本体的抬起也不串
    closeOf(t).onPointerDown(touch)
    rootOf(t).onPointerDown(touch)
    expect(closeOf(t)['data-pressed']).toBe('')
    expect(rootOf(t)['data-pressed']).toBeUndefined()
    rootOf(t).onPointerUp()
    expect(closeOf(t)['data-pressed']).toBe('')
    closeOf(t).onPointerUp()
    expect(closeOf(t)['data-pressed']).toBeUndefined()
  })

  it('禁用与只读谁都不进；不给关闭钮时关闭钮不进而 root 照常', () => {
    const disabled = makeTag({ closable: true, disabled: true })
    closeOf(disabled).onKeyDown(key('Enter'))
    rootOf(disabled).onPointerDown(touch)
    expect(closeOf(disabled)['data-pressed']).toBeUndefined()
    expect(rootOf(disabled)['data-pressed']).toBeUndefined()

    const readOnly = makeTag({ closable: true, readOnly: true })
    closeOf(readOnly).onKeyDown(key('Enter'))
    rootOf(readOnly).onPointerDown(touch)
    expect(closeOf(readOnly)['data-pressed']).toBeUndefined()
    expect(rootOf(readOnly)['data-pressed']).toBeUndefined()

    const plain = makeTag()
    closeOf(plain).onKeyDown(key('Enter'))
    expect(closeOf(plain)['data-pressed']).toBeUndefined()
    rootOf(plain).onPointerDown(touch)
    expect(rootOf(plain)['data-pressed']).toBe('')
  })

  it('按住途中转入禁用 / 只读、收回关闭钮即松开；按住 Enter 关掉标签那一下也松开，受控回写同样', () => {
    const disabled = makeTag({ closable: true })
    closeOf(disabled).onKeyDown(key('Enter'))
    disabled.setProps({ disabled: true })
    expect(closeOf(disabled)['data-pressed']).toBeUndefined()

    const readOnly = makeTag({ closable: true })
    closeOf(readOnly).onKeyDown(key('Enter'))
    readOnly.setProps({ readOnly: true })
    expect(closeOf(readOnly)['data-pressed']).toBeUndefined()

    const revoked = makeTag({ closable: true })
    closeOf(revoked).onKeyDown(key('Enter'))
    rootOf(revoked).onPointerDown(touch)
    revoked.setProps({ closable: false })
    expect(closeOf(revoked)['data-pressed']).toBeUndefined()
    // 收回的是关闭钮，root 上按着的那一下留着
    revoked.setProps({ closable: true })
    rootOf(revoked).onPointerDown(touch)
    expect(rootOf(revoked)['data-pressed']).toBe('')
    revoked.setProps({ closable: false })
    expect(rootOf(revoked)['data-pressed']).toBe('')

    const closed = makeTag({ closable: true })
    closeOf(closed).onKeyDown(key('Enter'))
    expect(closeOf(closed)['data-pressed']).toBe('')
    press(closed.api().getCloseTriggerProps())
    expect(closed.state()).toBe('closed')
    expect(closeOf(closed)['data-pressed']).toBeUndefined()

    const controlled = makeTag({ closable: true, open: true })
    closeOf(controlled).onKeyDown(key('Enter'))
    press(controlled.api().getCloseTriggerProps())
    // 受控：只发意图，标签还开着，按压面留着；宿主写回收起时才松开
    expect(controlled.state()).toBe('open')
    expect(closeOf(controlled)['data-pressed']).toBe('')
    controlled.setProps({ open: false })
    expect(controlled.state()).toBe('closed')
    expect(closeOf(controlled)['data-pressed']).toBeUndefined()
  })

  it('静态标签：宿主没供给按压通道时两个部件都不投影也不带处理器；供给了就按宿主说的投影', () => {
    const bare = connectStaticTag({ closable: true, open: true }, { get: () => true, set: () => {} }, normalizeProps)
    expect(bare.getRootProps()['data-pressed']).toBeUndefined()
    expect(bare.getCloseTriggerProps()['data-pressed']).toBeUndefined()
    expect((bare.getCloseTriggerProps() as Handlers).onKeyDown).toBeUndefined()

    const seen: string[] = []
    const handlers = (part: string): Handlers => ({
      onKeyDown: () => seen.push(`${part}:down`),
      onKeyUp: () => seen.push(`${part}:up`),
      onBlur: () => {},
      onPointerDown: () => {},
      onPointerUp: () => {},
      onPointerCancel: () => {},
    })
    const hosted = connectStaticTag({ closable: true, open: true }, { get: () => true, set: () => {} }, normalizeProps, { pressed: 'root', handlers })
    expect(hosted.getRootProps()['data-pressed']).toBe('')
    expect(hosted.getCloseTriggerProps()['data-pressed']).toBeUndefined()
    ;(hosted.getRootProps() as Handlers).onKeyDown(key(' '))
    ;(hosted.getCloseTriggerProps() as Handlers).onKeyUp(key(' '))
    expect(seen).toEqual(['root:down', 'close-trigger:up'])
  })
})
