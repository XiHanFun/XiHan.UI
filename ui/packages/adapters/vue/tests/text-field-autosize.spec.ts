// @vitest-environment jsdom
import type { TextFieldAutoSize } from '@xihan-ui/headless'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import { XhTextFieldInput, XhTextFieldRoot } from '../src'

const cleanups: Array<() => void> = []

async function settle(): Promise<void> {
  await nextTick()
  await nextTick()
}

afterEach(() => {
  for (const cleanup of cleanups.splice(0).reverse()) cleanup()
  vi.restoreAllMocks()
  document.body.innerHTML = ''
})

describe('vue TextField textarea autoSize', () => {
  it('程序值与配置变化会重量，关闭和卸载都归还作者内联样式', async () => {
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({
      lineHeight: '10px',
      fontSize: '10px',
      paddingBlockStart: '0px',
      paddingBlockEnd: '0px',
      borderBlockStartWidth: '0px',
      borderBlockEndWidth: '0px',
    } as CSSStyleDeclaration)
    vi.spyOn(HTMLTextAreaElement.prototype, 'scrollHeight', 'get').mockImplementation(function (this: HTMLTextAreaElement) {
      return this.value.length * 10
    })
    const value = ref('aa')
    const autoSize = ref<boolean | TextFieldAutoSize>({ maxRows: 10 })
    const host = document.createElement('div')
    document.body.append(host)
    const app = createApp({
      setup: () => () => h(XhTextFieldRoot, { value: value.value, autoSize: autoSize.value }, () => [
        h(XhTextFieldInput, {
          as: 'textarea',
          style: { blockSize: '17px', overflowY: 'scroll' },
        }),
      ]),
    })
    app.mount(host)
    let mounted = true
    cleanups.push(() => {
      if (mounted)
        app.unmount()
      host.remove()
    })
    await settle()
    const textarea = host.querySelector('textarea')!
    expect(textarea.style.blockSize).toBe('20px')

    value.value = 'abcdefgh'
    await settle()
    expect(textarea.style.blockSize).toBe('80px')

    autoSize.value = { maxRows: 3 }
    await settle()
    expect(textarea.style.blockSize).toBe('30px')

    autoSize.value = false
    await settle()
    expect(textarea.style.blockSize).toBe('17px')
    expect(textarea.style.overflowY).toBe('scroll')

    autoSize.value = true
    value.value = 'abcd'
    await settle()
    expect(textarea.style.blockSize).toBe('40px')
    app.unmount()
    mounted = false
    expect(textarea.style.blockSize).toBe('17px')
    expect(textarea.style.overflowY).toBe('scroll')
  })
})
