// 组合框有值时清空钮顶替展开钮的位置：两颗钮互斥显示，盒的宽度不随「有没有值」跳动。
// 宽度与 display 都是级联和布局算出来的，只有真实浏览器量得出。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import { XhComboboxRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const CITIES = [
  { value: 'beijing', label: 'Beijing 北京' },
  { value: 'berlin', label: 'Berlin 柏林' },
]

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
  document.body.innerHTML = ''
})

/** 值由外面这只 ref 受控，改它就是「选中 / 清空」；单选也是数组，空数组才是「没值」。 */
function mountCombobox(props: Record<string, unknown>, initial: string[]): { value: ReturnType<typeof ref<string[]>> } {
  const value = ref<string[]>(initial)
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    render: () => h(XhComboboxRoot, { collection: CITIES, value: value.value, ...props }),
  })
  app.mount(host)
  return { value }
}

function part(name: string): HTMLElement {
  const el = document.querySelector<HTMLElement>(`[data-scope="combobox"][data-part="${name}"]`)
  if (!el)
    throw new Error(`没有 ${name} 这个节点`)
  return el
}

async function settle(): Promise<void> {
  await nextTick()
  await nextTick()
}

function width(name: string): number {
  return part(name).getBoundingClientRect().width
}

describe('组合框清空钮与展开钮互斥', () => {
  it('单选：有值时展开钮让位给清空钮，盒宽不变；清空后换回来', async () => {
    const { value } = mountCombobox({ clearable: true }, [])
    await settle()
    expect(part('clear-trigger').hidden).toBe(true)
    expect(getComputedStyle(part('trigger')).display).not.toBe('none')
    const empty = width('control')

    value.value = ['berlin']
    await settle()
    expect(part('clear-trigger').hidden).toBe(false)
    expect(getComputedStyle(part('trigger')).display).toBe('none')
    expect(width('control')).toBe(empty)

    value.value = []
    await settle()
    expect(part('clear-trigger').hidden).toBe(true)
    expect(getComputedStyle(part('trigger')).display).not.toBe('none')
    expect(width('control')).toBe(empty)
  })

  it('多选：并入几个值盒宽都不变，清空钮始终只占展开钮那一格', async () => {
    const { value } = mountCombobox({ clearable: true, multiple: true }, [])
    await settle()
    const empty = width('control')

    value.value = ['beijing']
    await settle()
    expect(getComputedStyle(part('trigger')).display).toBe('none')
    expect(width('control')).toBe(empty)

    value.value = ['beijing', 'berlin']
    await settle()
    expect(width('control')).toBe(empty)
  })

  it('没写清空钮的结构里，有值时展开钮照常留着', async () => {
    const { value } = mountCombobox({ clearable: false }, [])
    await settle()
    expect(document.querySelector('[data-scope="combobox"][data-part="clear-trigger"]')).toBeNull()

    value.value = ['berlin']
    await settle()
    expect(getComputedStyle(part('trigger')).display).not.toBe('none')
  })
})
