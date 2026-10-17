// @vitest-environment jsdom
// 表单影子里带 value 的文本输入都交了 onChange：渲染时 React 不报受控输入告警。
import type { ReactElement } from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  XhCascaderControl,
  XhCascaderRoot,
  XhCascaderTrigger,
  XhColorPickerHiddenInput,
  XhColorPickerRoot,
  XhRatingHiddenInput,
  XhRatingRoot,
  XhToggleGroupHiddenInput,
  XhToggleGroupRoot,
  XhTransferRoot,
  XhTreeSelectHiddenInput,
  XhTreeSelectRoot,
} from '../src'

let unmount: (() => void) | null = null

afterEach(() => {
  unmount?.()
  unmount = null
  document.body.innerHTML = ''
  vi.restoreAllMocks()
})

async function renderErrors(node: ReactElement): Promise<{ errors: string[], host: HTMLElement }> {
  const errors: string[] = []
  vi.spyOn(console, 'error').mockImplementation((message: unknown) => {
    errors.push(String(message))
  })
  const host = document.createElement('div')
  document.body.append(host)
  const root = createRoot(host)
  await act(async () => {
    root.render(node)
  })
  unmount = () => act(() => root.unmount())
  return { errors, host }
}

const CASES: Array<[string, ReactElement]> = [
  ['toggle-group', <XhToggleGroupRoot key="t" name="t" collection={[{ value: 'a', label: '甲' }]}><XhToggleGroupHiddenInput /></XhToggleGroupRoot>],
  ['cascader', <XhCascaderRoot key="c" name="c" required collection={[]}><XhCascaderControl><XhCascaderTrigger>选择</XhCascaderTrigger></XhCascaderControl></XhCascaderRoot>],
  ['tree-select', <XhTreeSelectRoot key="s" name="s" required collection={[]}><XhTreeSelectHiddenInput /></XhTreeSelectRoot>],
  ['transfer', <XhTransferRoot key="r" name="r" required collection={[]} />],
  ['rating', <XhRatingRoot key="g" name="g" required><XhRatingHiddenInput /></XhRatingRoot>],
  ['color-picker', <XhColorPickerRoot key="p" name="p"><XhColorPickerHiddenInput /></XhColorPickerRoot>],
]

describe('表单影子不报受控输入告警', () => {
  it.each(CASES)('%s', async (_, node) => {
    const { errors, host } = await renderErrors(node)
    expect(host.querySelector('input')).not.toBeNull()
    expect(errors.filter(message => message.includes('without an `onChange` handler'))).toEqual([])
  })
})
