// 字段与字段集的校验换色与错误文案的进退场：
// 标签 / 组标题转警示色走 micro；错误文案出现时淡入，Field 下方预留的那一行里退场时淡出、播完才藏起，
// 外框高度前后不变；首帧就在的错误文案直接呈现、不播淡入。
import type { App, Ref } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import {
  XhFieldControl,
  XhFieldDescription,
  XhFieldErrorText,
  XhFieldLabel,
  XhFieldRoot,
  XhFieldsetErrorText,
  XhFieldsetLegend,
  XhFieldsetRoot,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

async function mount(render: () => ReturnType<typeof h>): Promise<void> {
  host = document.createElement('div')
  host.style.inlineSize = '320px'
  document.body.append(host)
  app = createApp({ render })
  app.mount(host)
  await nextTick()
  // 先画一帧：过渡的起点是上一帧算出来的样式，真实页面里挂载与用户操作之间总隔着几帧
  await new Promise(resolve => requestAnimationFrame(resolve))
}

function part(scope: string, name: string): HTMLElement {
  const el = host!.querySelector<HTMLElement>(`[data-scope='${scope}'][data-part='${name}']`)
  if (!el)
    throw new Error(`找不到 ${scope}/${name}`)
  return el
}

function resolve(property: string, value: string): string {
  const probe = document.createElement('div')
  probe.style.setProperty(property, value)
  host!.append(probe)
  const out = getComputedStyle(probe).getPropertyValue(property)
  probe.remove()
  return out
}

function durationOf(el: HTMLElement, property: string): string | undefined {
  const style = getComputedStyle(el)
  const index = style.transitionProperty.split(', ').indexOf(property)
  return index < 0 ? undefined : style.transitionDuration.split(', ')[index]
}

function running(el: HTMLElement, property: string): boolean {
  return el.getAnimations().some(animation => (animation as CSSTransition).transitionProperty === property)
}

function finish(): void {
  for (const animation of document.getAnimations())
    animation.finish()
}

function field(invalid: Ref<boolean>, description = false): () => ReturnType<typeof h> {
  return () => h(XhFieldRoot, { invalid: invalid.value }, () => [
    h(XhFieldLabel, () => '邮箱'),
    h(XhFieldControl, () => h('input')),
    ...(description ? [h(XhFieldDescription, () => '工作邮箱，登录用')] : []),
    h(XhFieldErrorText, () => '格式不对'),
  ])
}

describe('field 校验换色与错误文案', () => {
  it('标签转警示色走 micro，与字段集组标题同一档', async () => {
    const invalid = ref(false)
    await mount(field(invalid))
    const micro = resolve('transition-duration', 'var(--xh-motion-duration-micro)')
    expect(durationOf(part('field', 'label'), 'color')).toBe(micro)
    invalid.value = true
    await nextTick()
    expect(running(part('field', 'label'), 'color')).toBe(true)
  })

  it('没有说明时错误文案在预留的那一行里淡入淡出，外框等高', async () => {
    const invalid = ref(false)
    await mount(field(invalid))
    const root = part('field', 'root')
    const error = part('field', 'error-text')
    const height = root.getBoundingClientRect().height
    expect(getComputedStyle(error).visibility).toBe('hidden')
    expect(getComputedStyle(error).opacity).toBe('0')

    invalid.value = true
    await nextTick()
    expect(running(error, 'opacity')).toBe(true)
    expect(durationOf(error, 'opacity')).toBe(resolve('transition-duration', 'var(--xh-motion-duration-enter)'))
    expect(root.getBoundingClientRect().height).toBe(height)
    finish()
    expect(getComputedStyle(error).opacity).toBe('1')

    invalid.value = false
    await nextTick()
    // 退场途中仍看得见、仍占着这一行，播完才藏起
    expect(error.hasAttribute('hidden')).toBe(true)
    expect(running(error, 'opacity')).toBe(true)
    expect(durationOf(error, 'opacity')).toBe(resolve('transition-duration', 'var(--xh-motion-duration-exit)'))
    expect(getComputedStyle(error).visibility).toBe('visible')
    expect(root.getBoundingClientRect().height).toBe(height)
    finish()
    expect(getComputedStyle(error).visibility).toBe('hidden')
    expect(getComputedStyle(error).opacity).toBe('0')
  })

  it('带说明时错误文案顶替说明那一行，出现时淡入', async () => {
    const invalid = ref(false)
    await mount(field(invalid, true))
    const error = part('field', 'error-text')
    invalid.value = true
    await nextTick()
    expect(running(error, 'opacity')).toBe(true)
    finish()
    expect(getComputedStyle(error).opacity).toBe('1')
  })

  it('首帧就报错的字段直接呈现，不播淡入', async () => {
    const invalid = ref(true)
    await mount(field(invalid))
    expect(running(part('field', 'error-text'), 'opacity')).toBe(false)
    expect(getComputedStyle(part('field', 'error-text')).opacity).toBe('1')
  })
})

describe('fieldset 错误文案', () => {
  it('整组转无效时错误文案淡入', async () => {
    const invalid = ref(false)
    await mount(() => h(XhFieldsetRoot, { invalid: invalid.value }, () => [
      h(XhFieldsetLegend, () => '收货信息'),
      h(XhFieldsetErrorText, () => '至少填一项'),
    ]))
    const error = part('fieldset', 'error-text')
    invalid.value = true
    await nextTick()
    expect(running(error, 'opacity')).toBe(true)
    finish()
    expect(getComputedStyle(error).opacity).toBe('1')
  })
})
