// 浮层首帧标记的共享原语：挂载时开没开的判据、记首帧的那一格与收起时的清除。
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { describe, expect, it } from 'vitest'
import { clearOpenedAtMount, openAtMount, openedAtMountCell } from '../src/shared/first-frame'

interface OpenProps { open?: boolean, defaultOpen?: boolean }

const propOf = (values: OpenProps) => (key: 'open' | 'defaultOpen') => values[key]

describe('挂载时开没开', () => {
  it('缺省收着；defaultOpen 开着；受控 open 压过 defaultOpen', () => {
    expect(openAtMount(propOf({}))).toBe(false)
    expect(openAtMount(propOf({ defaultOpen: true }))).toBe(true)
    expect(openAtMount(propOf({ open: false, defaultOpen: true }))).toBe(false)
    expect(openAtMount(propOf({ open: true }))).toBe(true)
  })
})

describe('首帧那一格', () => {
  it('初值取挂载时开没开', () => {
    const runtime = createVanillaRuntime()
    expect(openedAtMountCell(runtime.cell, true).get()).toBe(true)
    expect(openedAtMountCell(runtime.cell, false).get()).toBe(false)
  })

  it('收起即清，挂载即收起时清除是空操作', () => {
    const runtime = createVanillaRuntime()
    const cells = { open: openedAtMountCell(runtime.cell, true), closed: openedAtMountCell(runtime.cell, false) }
    for (const cell of Object.values(cells))
      clearOpenedAtMount({ context: { set: (_key, value) => cell.set(value) } })
    expect(cells.open.get()).toBe(false)
    expect(cells.closed.get()).toBe(false)
  })
})
