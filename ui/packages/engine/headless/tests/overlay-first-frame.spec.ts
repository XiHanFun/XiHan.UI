// @vitest-environment jsdom
// 浮层的首帧标记：挂载时已经打开的浮层（受控 open 的初值为 true，或 defaultOpen）属于首帧，
// content 与带进场的部件投影 data-instant；第一次收起时撤掉，之后的每一次打开都不再带。
import type { MachineConfig, MachineSchema, Service } from '@xihan-ui/core'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { describe, expect, it } from 'vitest'
import { cascaderMachine, connectCascader } from '../src/cascader'
import { comboboxMachine, connectCombobox } from '../src/combobox'
import { connectContextMenu, contextMenuMachine } from '../src/context-menu'
import { datePickerMachine } from '../src/date-picker'
import { connectDialog, dialogMachine } from '../src/dialog'
import { connectDrawer, drawerMachine } from '../src/drawer'
import { connectMenu, menuMachine } from '../src/menu'
import { connectPopconfirm } from '../src/popconfirm'
import { connectPopover, popoverMachine } from '../src/popover'
import { connectSelect, selectMachine } from '../src/select'
import { connectTreeSelect, treeSelectMachine } from '../src/tree-select'

type Attrs = Record<string, unknown>

/** 开合的两种给法：受控 open，或非受控 defaultOpen。 */
interface OpenProps {
  open?: boolean
  defaultOpen?: boolean
}

interface Case {
  machine: MachineConfig<any>
  /** 把开合换算成这台机器的 props（按展开项开合的族换成 value / defaultValue）。 */
  props?: (open: OpenProps) => Record<string, unknown>
  /** 带进场的那几个部件此刻的属性。 */
  parts: (service: Service<any>) => Attrs[]
}

const FRUITS = [
  { value: 'apple', label: '苹果' },
  { value: 'banana', label: '香蕉' },
]

/**
 * 复合族（日期、日期区间、取色器）的 connect 要连带日历、分段输入与通道滑杆几台服务一起交进去，
 * 这里只核机器记下的那一格；content 上的投影由各自的组件单测核。
 */
function marked(service: Service<any>): Attrs[] {
  return [{ 'data-instant': service.context.get('openedAtMount') ? '' : undefined }]
}

const CASES: Record<string, Case> = {
  'popover': {
    machine: popoverMachine,
    parts: service => [connectPopover(service, normalizeProps).getContentProps() as Attrs],
  },
  'popconfirm': {
    machine: popoverMachine,
    parts: service => [connectPopconfirm(service, {}, normalizeProps).getContentProps() as Attrs],
  },
  'dialog': {
    machine: dialogMachine,
    parts: (service) => {
      const api = connectDialog(service, normalizeProps)
      return [api.getContentProps() as Attrs, api.getBackdropProps() as Attrs]
    },
  },
  'drawer': {
    machine: drawerMachine,
    parts: (service) => {
      const api = connectDrawer(service, normalizeProps)
      return [api.getContentProps() as Attrs, api.getBackdropProps() as Attrs]
    },
  },
  'menu': {
    machine: menuMachine,
    parts: service => [connectMenu(service, normalizeProps).getContentProps() as Attrs],
  },
  'context-menu': {
    machine: contextMenuMachine,
    parts: service => [connectContextMenu(service, normalizeProps).getContentProps() as Attrs],
  },
  'select': {
    machine: selectMachine,
    parts: service => [connectSelect(service, normalizeProps).getContentProps() as Attrs],
  },
  'combobox': {
    machine: comboboxMachine,
    props: open => ({ ...open, collection: FRUITS }),
    parts: service => [connectCombobox(service, normalizeProps).getContentProps() as Attrs],
  },
  'tree-select': {
    machine: treeSelectMachine,
    props: open => ({ ...open, collection: FRUITS }),
    parts: service => [connectTreeSelect(service, normalizeProps).getContentProps() as Attrs],
  },
  'cascader': {
    machine: cascaderMachine,
    props: open => ({ ...open, collection: FRUITS }),
    parts: service => [connectCascader(service, normalizeProps).getContentProps() as Attrs],
  },
  'date-picker': {
    machine: datePickerMachine,
    parts: marked,
  },
}

/** 起一台服务；返回改 props 的入口（受控开合经它改写）。 */
function serve<T extends MachineSchema>(machine: MachineConfig<T>, initial: Record<string, unknown>) {
  const runtime = createVanillaRuntime()
  const props = runtime.signal<Record<string, unknown>>(initial)
  const service = createService(machine, { props: () => props.get() as T['props'], runtime })
  runtime.start()
  return { service, set: (next: Record<string, unknown>) => props.set({ ...props.get(), ...next }) }
}

const instant = (parts: Attrs[]): unknown[] => parts.map(attrs => attrs['data-instant'])

describe.each(Object.entries(CASES))('%s 首帧标记', (_name, c) => {
  const props = (open: OpenProps): Record<string, unknown> => (c.props ?? (o => ({ ...o })))(open)

  it.each([{ open: true }, { defaultOpen: true }])('挂载即开（%o）：带进场的部件带 data-instant', (open) => {
    const { service } = serve(c.machine, props(open))
    expect(instant(c.parts(service)).every(value => value === '')).toBe(true)
  })

  it('第一次收起即撤，再开也不带回', () => {
    const { service, set } = serve(c.machine, props({ open: true }))
    set(props({ open: false }))
    expect(instant(c.parts(service)).every(value => value === undefined)).toBe(true)
    set(props({ open: true }))
    expect(instant(c.parts(service)).every(value => value === undefined)).toBe(true)
  })

  it('挂载时收着：打开是用户操作带来的，不带 data-instant', () => {
    const { service, set } = serve(c.machine, props({ open: false }))
    expect(instant(c.parts(service)).every(value => value === undefined)).toBe(true)
    set(props({ open: true }))
    expect(instant(c.parts(service)).every(value => value === undefined)).toBe(true)
  })
})
