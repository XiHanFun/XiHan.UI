// @vitest-environment jsdom
// TimeZoneSelect 组合根把候选与标量值接给内部 Combobox；Light DOM 条目仍由作者渲染。
import type { TimeZoneSelectOption } from '@xihan-ui/headless'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

interface Updatable extends HTMLElement { updateComplete: Promise<unknown> }
interface ComboboxHost extends HTMLElement { collection?: TimeZoneSelectOption[], value?: string | string[] }

beforeEach(() => {
  document.body.innerHTML = ''
})

async function mount(): Promise<{
  host: Updatable & { timeZones: string[], referenceTime: number, value?: string | null }
  combo: ComboboxHost
  content: HTMLElement
}> {
  const host = document.createElement('xh-time-zone-select') as Updatable & {
    timeZones: string[]
    referenceTime: number
    value?: string | null
  }
  host.innerHTML = `
    <div data-xh-part="root">
      <xh-combobox>
        <div data-xh-part="root">
          <label data-xh-part="label"></label>
          <div data-xh-part="control"><input data-xh-part="input"><button data-xh-part="clear-trigger"></button><button data-xh-part="trigger"></button></div>
          <div data-xh-part="positioner"><div data-xh-part="content"></div><div data-xh-part="empty"></div></div>
          <input data-xh-part="hidden-input">
        </div>
      </xh-combobox>
    </div>
  `
  host.timeZones = ['UTC', 'Asia/Shanghai', 'America/New_York']
  host.referenceTime = Date.UTC(2026, 0, 1)
  const content = host.querySelector<HTMLElement>('[data-xh-part="content"]')!
  document.body.appendChild(host)
  await host.updateComplete
  await host.updateComplete
  return { host, combo: host.querySelector('xh-combobox') as ComboboxHost, content }
}

describe('xh-time-zone-select 组合接线', () => {
  it('把参考时刻下的候选与受控标量值交给 Combobox', async () => {
    const { host, combo, content } = await mount()
    host.value = 'Asia/Shanghai'
    await host.updateComplete
    expect(combo.collection).toHaveLength(3)
    expect(content.querySelectorAll('[data-xh-part="item"]')).toHaveLength(3)
    expect(combo.collection?.find(option => option.value === 'America/New_York')?.offset).toBe('-05:00')
    expect(combo.value).toBe('Asia/Shanghai')
  })

  it('输入事件过滤候选并照常向外报告', async () => {
    const { host, combo, content } = await mount()
    const listener = vi.fn()
    host.addEventListener('input-value-change', listener)
    combo.dispatchEvent(new CustomEvent('input-value-change', {
      detail: { inputValue: 'shanghai' },
      bubbles: true,
      composed: true,
    }))
    expect(combo.collection?.map(option => option.value)).toEqual(['Asia/Shanghai'])
    expect(content.querySelectorAll('[data-xh-part="item"]')).toHaveLength(1)
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('把 Combobox 数组值翻成公开的标量值', async () => {
    const { host, combo } = await mount()
    const listener = vi.fn()
    host.addEventListener('value-change', listener)
    combo.dispatchEvent(new CustomEvent('value-change', {
      detail: { value: ['UTC'] },
      bubbles: true,
      composed: true,
    }))
    expect(listener).toHaveBeenCalledTimes(1)
    expect(listener.mock.calls[0]?.[0].detail).toEqual({ value: 'UTC' })
  })
})
