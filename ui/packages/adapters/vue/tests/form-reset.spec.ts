// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import { XhRadioGroupItem, XhRadioGroupRoot, XhRatingControl, XhRatingItem, XhRatingRoot, XhSelectContent, XhSelectItem, XhSelectItemText, XhSelectPositioner, XhSelectRoot, XhSelectTrigger, XhSelectValueText } from '../src'

/**
 * 组件的值攥在机器里，原生 reset 只还原原生控件——不接这条线，点重置什么都不会发生。
 *
 * 另一半同样要钉死：受控且宿主没写 defaultValue 时，cell 里那句 `?? null` 是组件的兜底空值、
 * 不是宿主说过的默认值，落下去等于把宿主的数据抹掉。这条比「重置无效」严重得多。
 */

async function tick(): Promise<void> {
  await nextTick()
  await nextTick()
  await new Promise(r => setTimeout(r, 0))
  await nextTick()
}

interface Mounted {
  form: HTMLFormElement
  选中: () => string | null
  提交: () => string | null
  点: (v: string) => Promise<void>
  重置: () => Promise<void>
  卸载: () => void
}

function mount(props: Record<string, unknown>, onValueChange?: (d: { value: string | null }) => void): Mounted {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const app = createApp({
    setup: () => () =>
      h('form', null, [
        h(XhRadioGroupRoot, { name: 'plan', ...props, onValueChange }, {
          default: () => [
            h(XhRadioGroupItem, { value: 'standard' }, () => '标准'),
            h(XhRadioGroupItem, { value: 'pro' }, () => '专业'),
          ],
        }),
      ]),
  })
  app.mount(host)
  const form = host.querySelector('form') as HTMLFormElement
  return {
    form,
    选中: () => [...form.querySelectorAll('[data-part="item"]')]
      .find(e => e.getAttribute('aria-checked') === 'true')
      ?.getAttribute('data-value') ?? null,
    提交: () => (new FormData(form).get('plan') as string | null),
    点: async (v) => {
      form.querySelector<HTMLElement>(`[data-part="item"][data-value="${v}"]`)?.click()
      await tick()
    },
    重置: async () => {
      form.reset()
      await tick()
    },
    卸载: () => {
      app.unmount()
      host.remove()
    },
  }
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('非受控', () => {
  it('改过之后点重置，显示与提交都回到 defaultValue', async () => {
    const m = mount({ defaultValue: 'standard' })
    try {
      await tick()
      expect(m.选中()).toBe('standard')
      await m.点('pro')
      expect(m.选中()).toBe('pro')
      expect(m.提交()).toBe('pro')

      await m.重置()
      expect(m.选中()).toBe('standard')
      expect(m.提交()).toBe('standard')
    }
    finally {
      m.卸载()
    }
  })

  it('宿主中途换了 defaultValue，重置回到新的那一份', async () => {
    const host = document.createElement('div')
    document.body.appendChild(host)
    const def = ref('standard')
    const app = createApp({
      setup: () => () =>
        h('form', null, [
          h(XhRadioGroupRoot, { name: 'plan', defaultValue: def.value }, {
            default: () => [
              h(XhRadioGroupItem, { value: 'standard' }, () => '标准'),
              h(XhRadioGroupItem, { value: 'pro' }, () => '专业'),
            ],
          }),
        ]),
    })
    app.mount(host)
    const form = host.querySelector('form') as HTMLFormElement
    await tick()

    def.value = 'pro'
    await tick()
    form.reset()
    await tick()

    expect(new FormData(form).get('plan')).toBe('pro')
    app.unmount()
    host.remove()
  })
})

describe('受控', () => {
  it('写了 defaultValue：只发意图，宿主没写回就不自改', async () => {
    const onValueChange = vi.fn()
    const m = mount({ value: 'pro', defaultValue: 'standard' }, onValueChange)
    try {
      await tick()
      await m.重置()
      expect(onValueChange).toHaveBeenLastCalledWith({ value: 'standard' })
      // 宿主没写回，组件不自改
      expect(m.选中()).toBe('pro')
    }
    finally {
      m.卸载()
    }
  })

  it('没写 defaultValue：一动不动，一条意图都不许发', async () => {
    const onValueChange = vi.fn()
    const m = mount({ value: 'pro' }, onValueChange)
    try {
      await tick()
      const before = m.form.innerHTML
      await m.重置()
      expect(onValueChange).not.toHaveBeenCalled()
      expect(m.form.innerHTML).toBe(before)
      expect(m.提交()).toBe('pro')
    }
    finally {
      m.卸载()
    }
  })
})

describe('边界', () => {
  it('重置被拦下时不动：同表单的原生控件也没还原，单方面还原会拼出半份默认值', async () => {
    const m = mount({ defaultValue: 'standard' })
    try {
      await tick()
      await m.点('pro')
      m.form.addEventListener('reset', e => e.preventDefault())
      await m.重置()
      expect(m.选中()).toBe('pro')
    }
    finally {
      m.卸载()
    }
  })

  it('不在表单里时重置别人的表单，与我无关', async () => {
    const 别人 = document.createElement('form')
    document.body.appendChild(别人)
    const host = document.createElement('div')
    document.body.appendChild(host)
    const app = createApp({
      setup: () => () =>
        h(XhRadioGroupRoot, { name: 'plan', defaultValue: 'standard' }, {
          default: () => [
            h(XhRadioGroupItem, { value: 'standard' }, () => '标准'),
            h(XhRadioGroupItem, { value: 'pro' }, () => '专业'),
          ],
        }),
    })
    app.mount(host)
    await tick()
    host.querySelector<HTMLElement>('[data-part="item"][data-value="pro"]')?.click()
    await tick()

    别人.reset()
    await tick()

    const checked = [...host.querySelectorAll('[data-part="item"]')]
      .find(e => e.getAttribute('aria-checked') === 'true')
      ?.getAttribute('data-value')
    expect(checked).toBe('pro')
    app.unmount()
    host.remove()
    别人.remove()
  })
})

describe('几个最容易做错的组件', () => {
  it('select：重置回默认值，触发器文字与表单影子都跟着回去', async () => {
    const host = document.createElement('div')
    document.body.appendChild(host)
    const app = createApp({
      setup: () => () =>
        h('form', null, [
          h(XhSelectRoot, {
            name: 'fruit',
            defaultValue: 'apple',
            collection: [{ value: 'apple', label: '苹果' }, { value: 'pear', label: '梨' }],
          }, {
            default: () => [
              h(XhSelectTrigger, null, () => [h(XhSelectValueText)]),
              h(XhSelectPositioner, null, () => [
                h(XhSelectContent, null, () => [
                  h(XhSelectItem, { value: 'apple' }, () => [h(XhSelectItemText, null, () => '苹果')]),
                  h(XhSelectItem, { value: 'pear' }, () => [h(XhSelectItemText, null, () => '梨')]),
                ]),
              ]),
            ],
          }),
        ]),
    })
    app.mount(host)
    const form = host.querySelector('form') as HTMLFormElement
    await tick()
    const text = (): string => host.querySelector('[data-part="value-text"]')?.textContent ?? ''
    expect(text()).toBe('苹果')

    const svc = host.querySelector('[data-part="hidden-select"]') as HTMLSelectElement | null
    expect(svc?.value ?? '').toBe('apple')

    // 改成梨再重置
    host.querySelector<HTMLElement>('[data-part="trigger"]')?.click()
    await tick()
    const pear = [...document.querySelectorAll('[data-scope="select"][data-part="item"]')]
      .find(e => e.getAttribute('data-value') === 'pear') as HTMLElement | undefined
    pear?.click()
    await tick()
    expect(text()).toBe('梨')

    form.reset()
    await tick()
    expect(text()).toBe('苹果')

    app.unmount()
    host.remove()
  })

  it('rating：重置时把悬停缓冲一并清掉，否则指针悬着会盖住结果', async () => {
    const host = document.createElement('div')
    document.body.appendChild(host)
    const app = createApp({
      setup: () => () =>
        h('form', null, [
          h(XhRatingRoot, { name: 'stars', defaultValue: 2, count: 5 }, {
            default: () => [h(XhRatingControl, null, () => [1, 2, 3, 4, 5].map(i => h(XhRatingItem, { value: i })))],
          }),
        ]),
    })
    app.mount(host)
    const form = host.querySelector('form') as HTMLFormElement
    await tick()
    const stars = [...form.querySelectorAll<HTMLElement>('[data-scope="rating"] [data-part="item"]')]
    stars[4]?.click()
    await tick()
    // 指针停在第 5 颗上
    stars[4]?.dispatchEvent(new MouseEvent('pointermove', { bubbles: true }))
    await tick()

    form.reset()
    await tick()
    const 亮着 = stars.filter(s => s.getAttribute('data-highlighted') !== null).length
    expect(亮着).toBeLessThanOrEqual(2)
    app.unmount()
    host.remove()
  })
})
