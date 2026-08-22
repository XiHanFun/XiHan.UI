import type { TagOpenChangeDetails, TagSchema } from '../src/tag'
import { normalizeProps } from '@xihan-ui/kernel'
import { createService } from '@xihan-ui/machine'
import { createVanillaRuntime } from '@xihan-ui/machine/vanilla'
import { describe, expect, it } from 'vitest'
// 直接指向组件目录：包主入口的导出由接线一并补，测试不等它
import { connectTag, tagMachine } from '../src/tag'

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
  it('可访问名默认 Remove，可由 translations 替换', () => {
    expect(makeTag().api().getCloseTriggerProps()['aria-label']).toBe('Remove')
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
