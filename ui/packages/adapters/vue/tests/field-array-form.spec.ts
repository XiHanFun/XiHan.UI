// @vitest-environment jsdom
import { createFormPathRecord, getFormPathValue } from '@xihan-ui/headless'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhFieldArrayItem, XhFieldArrayMoveUpTrigger, XhFieldArrayRoot, XhFormRoot } from '../src'

let cleanup: (() => void) | undefined

async function tick(): Promise<void> {
  await nextTick()
  await nextTick()
}

afterEach(() => {
  cleanup?.()
  cleanup = undefined
  document.body.innerHTML = ''
})

describe('fieldArray 接入 FormPath', () => {
  it('只做上下文接线，换序由 Headless 迁移 Form 值与子字段路径', async () => {
    const users = ['users'] as const
    const middleEmail = ['users', 1, 'email'] as const
    const onValuesChange = vi.fn()
    const host = document.createElement('div')
    document.body.append(host)
    const app = createApp({
      setup: () => () => h(XhFormRoot, {
        defaultValues: createFormPathRecord<unknown>([
          [users, [{ id: 'a' }, { id: 'b' }]],
          [['users', 0, 'email'], 'a@example.com'],
          [middleEmail, 'b@example.com'],
        ]),
        onValuesChange,
      }, {
        default: () => h(XhFieldArrayRoot, { name: users, movable: true }, {
          default: ({ items }: { items: Array<{ key: string, index: number }> }) => items.map(item => h(XhFieldArrayItem, { key: item.key, index: item.index }, {
            default: () => h(XhFieldArrayMoveUpTrigger, () => '上移'),
          })),
        }),
      }),
    })
    app.mount(host)
    cleanup = () => {
      app.unmount()
      host.remove()
    }
    await tick()

    host.querySelector<HTMLButtonElement>('[data-part="move-up-trigger"][data-index="1"]')!.click()
    await tick()
    const values = onValuesChange.mock.calls.at(-1)?.[0].values
    expect(getFormPathValue(values, users)).toEqual([{ id: 'b' }, { id: 'a' }])
    expect(getFormPathValue(values, ['users', 0, 'email'])).toBe('b@example.com')
    expect(getFormPathValue(values, middleEmail)).toBe('a@example.com')
  })
})
