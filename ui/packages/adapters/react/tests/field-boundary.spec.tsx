// 字段边界与浮层：子树里的控件不再被外层字段命名、描述，不再继承它的禁用，也不拿同一个控件 id。
//
// 组合控件（图标选择器）里内嵌的搜索框若照旧接上外层字段，会被读成字段的名字「图标」，
// 字段禁用时它也跟着禁用；放在浮层里的输入框同理，浮层经 Portal 搬到落点后不该再归外层字段管。
import type { ReactNode } from 'react'
import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import {
  XhFieldBoundary,
  XhFieldDescription,
  XhFieldLabel,
  XhFieldRoot,
  XhPopoverContent,
  XhPopoverPositioner,
  XhPopoverRoot,
  XhPopoverTrigger,
  XhTextFieldInput,
  XhTextFieldRoot,
} from '../src'

afterEach(() => {
  cleanup()
  document.getElementById('xh-portal-root')?.remove()
})

function inField(inner: ReactNode): void {
  render(
    <XhFieldRoot disabled>
      <XhFieldLabel>图标</XhFieldLabel>
      {inner}
      <XhFieldDescription>展示在菜单前</XhFieldDescription>
    </XhFieldRoot>,
  )
}

const searchBox = (
  <XhTextFieldRoot>
    <XhTextFieldInput aria-label="搜索图标" data-testid="search" />
  </XhTextFieldRoot>
)

function input(): HTMLInputElement {
  const el = document.querySelector<HTMLInputElement>('[data-testid="search"]')
  if (!el)
    throw new Error('找不到搜索框')
  return el
}

function expectIsolated(): void {
  const labelId = document.querySelector('[data-scope="field"][data-part="label"]')!.id
  const descriptionId = document.querySelector('[data-scope="field"][data-part="description"]')!.id
  const el = input()
  expect((el.getAttribute('aria-labelledby') ?? '').split(/\s+/)).not.toContain(labelId)
  expect((el.getAttribute('aria-describedby') ?? '').split(/\s+/)).not.toContain(descriptionId)
  expect(el.disabled).toBe(false)
}

describe('字段边界', () => {
  it('不加边界时内嵌的搜索框被外层字段命名并跟着禁用', () => {
    inField(searchBox)
    const labelId = document.querySelector('[data-scope="field"][data-part="label"]')!.id
    expect((input().getAttribute('aria-labelledby') ?? '').split(/\s+/)).toContain(labelId)
    expect(input().disabled).toBe(true)
  })

  it('xhFieldBoundary 后面的控件不再继承外层字段', () => {
    inField(<XhFieldBoundary>{searchBox}</XhFieldBoundary>)
    expectIsolated()
  })

  it('浮层内容搬到落点后自动断开：放在里面的输入框不归外层字段管', () => {
    inField(
      <XhPopoverRoot defaultOpen>
        <XhPopoverTrigger>选择图标</XhPopoverTrigger>
        <XhPopoverPositioner>
          <XhPopoverContent>{searchBox}</XhPopoverContent>
        </XhPopoverPositioner>
      </XhPopoverRoot>,
    )
    expectIsolated()
  })
})
