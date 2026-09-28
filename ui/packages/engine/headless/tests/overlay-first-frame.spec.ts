// 浮层的首帧标记：挂载时已经打开的浮层（受控 open 的初值为 true，或 defaultOpen）属于首帧，
// content 与带进场的部件投影 data-instant；第一次收起时撤掉，之后的每一次打开都不再带。
import type { MachineConfig, MachineSchema, Service } from '@xihan-ui/core'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { describe, expect, it } from 'vitest'
import { connectPopover, popoverMachine } from '../src/popover'

type Attrs = Record<string, unknown>

interface Case {
  /** 起一台服务：open / defaultOpen 原样交进去。 */
  start: (props: { open?: boolean, defaultOpen?: boolean }) => {
    /** 带进场的那几个部件此刻的属性。 */
    parts: () => Attrs[]
    close: () => void
    open: () => void
  }
}

function serve<T extends MachineSchema>(machine: MachineConfig<T>, props: T['props']): Service<T> {
  const runtime = createVanillaRuntime()
  const service = createService(machine, { props: () => props, runtime })
  runtime.start()
  return service
}

const CASES: Record<string, Case> = {
  popover: {
    start: (props) => {
      const service = serve(popoverMachine, props)
      const api = () => connectPopover(service, normalizeProps)
      return {
        parts: () => [api().getContentProps() as Attrs],
        close: () => service.send({ type: 'CLOSE' }),
        open: () => service.send({ type: 'OPEN' }),
      }
    },
  },
}

const instant = (parts: Attrs[]): unknown[] => parts.map(attrs => attrs['data-instant'])

describe.each(Object.entries(CASES))('%s 首帧标记', (_name, c) => {
  it.each([{ open: true }, { defaultOpen: true }])('挂载即开（%o）：带进场的部件带 data-instant', (props) => {
    const overlay = c.start(props)
    expect(instant(overlay.parts()).every(value => value === '')).toBe(true)
  })

  it('第一次收起即撤，再开也不带回', () => {
    const overlay = c.start({ defaultOpen: true })
    overlay.close()
    expect(instant(overlay.parts()).every(value => value === undefined)).toBe(true)
    overlay.open()
    expect(instant(overlay.parts()).every(value => value === undefined)).toBe(true)
  })

  it('挂载时收着：打开是用户操作带来的，不带 data-instant', () => {
    const overlay = c.start({})
    expect(instant(overlay.parts()).every(value => value === undefined)).toBe(true)
    overlay.open()
    expect(instant(overlay.parts()).every(value => value === undefined)).toBe(true)
  })
})
