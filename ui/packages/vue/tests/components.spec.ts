// @vitest-environment jsdom
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import { XhButton, XhDialogContent, XhDialogRoot, XhDialogTitle, XhDialogTrigger } from '../src'

beforeEach(() => {
  // jsdom 无 matchMedia，桩掉供 RuntimeConfig.reducedMotion 使用
  vi.stubGlobal('matchMedia', (q: string) => ({ matches: false, media: q, addEventListener: () => {}, removeEventListener: () => {} }))
})

afterEach(() => {
  document.body.innerHTML = ''
  vi.unstubAllGlobals()
})

describe('xhButton', () => {
  it('渲染 button，带 anatomy 属性', () => {
    const w = mount(XhButton, { props: { type: 'submit', variant: 'solid' }, slots: { default: () => '确定' } })
    const el = w.get('button')
    expect(el.attributes('data-scope')).toBe('button')
    expect(el.attributes('data-part')).toBe('root')
    expect(el.attributes('type')).toBe('submit')
    expect(el.attributes('data-variant')).toBe('solid')
    expect(el.text()).toBe('确定')
  })

  it('loading 时 aria-disabled 且拦截点击', async () => {
    const onClick = vi.fn()
    const w = mount(XhButton, { props: { loading: true }, attrs: { onClick } })
    expect(w.get('button').attributes('aria-disabled')).toBe('true')
  })
})

describe('xhDialog', () => {
  const Harness = defineComponent({
    setup() {
      return () => h(XhDialogRoot, null, {
        default: () => [
          h(XhDialogTrigger, null, { default: () => '打开' }),
          h(XhDialogContent, null, { default: () => h(XhDialogTitle, null, { default: () => '标题' }) }),
        ],
      })
    },
  })

  it('初始关闭不渲染内容；点 trigger 打开后 content 出现在 body', async () => {
    const w = mount(Harness, { attachTo: document.body })
    await nextTick()
    // 初始 closed：content 未渲染
    expect(document.body.querySelector('[data-part=\'content\']')).toBeNull()

    // trigger 打开
    const trigger = document.body.querySelector('[data-part=\'trigger\']') as HTMLElement
    expect(trigger).toBeTruthy()
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog')
    trigger.click()
    await nextTick()
    await nextTick()

    const content = document.body.querySelector('[data-part=\'content\']')
    expect(content).toBeTruthy()
    expect(content!.getAttribute('role')).toBe('dialog')
    expect(content!.getAttribute('aria-modal')).toBe('true')
    expect(content!.getAttribute('data-state')).toBe('open')
    expect(document.body.querySelector('[data-part=\'title\']')?.textContent).toBe('标题')

    w.unmount()
  })
})
