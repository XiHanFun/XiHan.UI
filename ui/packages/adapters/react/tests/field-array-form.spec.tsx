// @vitest-environment jsdom
import { createFormPathRecord, getFormPathValue } from '@xihan-ui/headless'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { XhFieldArrayItem, XhFieldArrayMoveUpTrigger, XhFieldArrayRoot, XhFormRoot } from '../src'

let host: HTMLElement | null = null
let root: ReturnType<typeof createRoot> | null = null

afterEach(() => {
  act(() => root?.unmount())
  host?.remove()
  root = null
  host = null
})

describe('fieldArray 接入 FormPath', () => {
  it('只做上下文接线，换序由 Headless 迁移 Form 值与子字段路径', () => {
    ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
    const users = ['users'] as const
    const middleEmail = ['users', 1, 'email'] as const
    const onValuesChange = vi.fn()
    host = document.createElement('div')
    document.body.append(host)
    root = createRoot(host)

    act(() => root!.render(
      <XhFormRoot
        defaultValues={createFormPathRecord<unknown>([
          [users, [{ id: 'a' }, { id: 'b' }]],
          [['users', 0, 'email'], 'a@example.com'],
          [middleEmail, 'b@example.com'],
        ])}
        onValuesChange={onValuesChange}
      >
        {() => (
          <XhFieldArrayRoot name={users} movable>
            {({ items }) => items.map(item => (
              <XhFieldArrayItem key={item.key} index={item.index}>
                <XhFieldArrayMoveUpTrigger>上移</XhFieldArrayMoveUpTrigger>
              </XhFieldArrayItem>
            ))}
          </XhFieldArrayRoot>
        )}
      </XhFormRoot>,
    ))

    act(() => host!.querySelector<HTMLButtonElement>('[data-part="move-up-trigger"][data-index="1"]')!.click())
    const values = onValuesChange.mock.calls.at(-1)?.[0].values
    expect(getFormPathValue(values, users)).toEqual([{ id: 'b' }, { id: 'a' }])
    expect(getFormPathValue(values, ['users', 0, 'email'])).toBe('b@example.com')
    expect(getFormPathValue(values, middleEmail)).toBe('a@example.com')
  })
})
