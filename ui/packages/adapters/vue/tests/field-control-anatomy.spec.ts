// @vitest-environment jsdom
// XhFieldControl 合并属性时的角色标记归属：子节点是裸控件就把 field/control 标上去，
// 子节点自带角色标记（组件根、或写了 data-scope 的元素）则只落 id 与 aria-*。
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, createSSRApp, createTextVNode, defineComponent, Fragment, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { useFieldControl, XhFieldControl, XhFieldLabel, XhFieldRoot, XhSwitch } from '../src'

let cleanup: Array<() => void> = []

afterEach(() => {
  for (const fn of cleanup) fn()
  cleanup = []
  document.body.innerHTML = ''
})

function mountField(child: () => unknown, controlProps?: Record<string, unknown>): HTMLElement {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const app = createApp({
    setup: () => () =>
      h(XhFieldRoot, null, () => [
        h(XhFieldLabel, () => '开关'),
        h(XhFieldControl, controlProps ?? null, () => [child()]),
      ]),
  })
  app.mount(host)
  cleanup.push(() => {
    app.unmount()
    host.remove()
  })
  return host
}

describe('field control 的角色标记', () => {
  it('裸控件收下 field/control 标记与接线属性', () => {
    const host = mountField(() => h('input'))
    const input = host.querySelector('input')!

    expect(input.getAttribute('data-scope')).toBe('field')
    expect(input.getAttribute('data-part')).toBe('control')
    expect(input.id).not.toBe('')
    expect(input.getAttribute('aria-labelledby')).toBe(host.querySelector('label')!.id)
  })

  it('组件节点保住自己的角色标记，只收接线属性', () => {
    const host = mountField(() => h(XhSwitch))
    const root = host.querySelector('[data-scope=\'switch\']')!

    expect(root.getAttribute('data-part')).toBe('root')
    expect(root.id).not.toBe('')
    expect(root.getAttribute('aria-labelledby')).toBe(host.querySelector('label')!.id)
    expect(host.querySelector('[data-scope=\'field\'][data-part=\'control\']')).toBeNull()
  })

  it('元素节点写了 data-scope 时同样不被覆盖', () => {
    const host = mountField(() => h('div', { 'data-scope': 'diagram', 'data-part': 'canvas' }))
    const node = host.querySelector('[data-scope=\'diagram\']')!

    expect(node.getAttribute('data-part')).toBe('canvas')
    expect(node.id).not.toBe('')
  })
})

describe('控件藏在薄封装里', () => {
  // 根是 div、真控件在里面：正是默认路径接不准的那种封装
  const Wrapper = defineComponent({
    name: 'TestWrapper',
    setup() {
      const controlProps = useFieldControl()
      return () => h('div', { class: 'wrapper' }, [h('input', controlProps.value)])
    },
  })

  it('asChild 关掉后接线不落在封装根上', () => {
    const host = mountField(() => h(Wrapper), { asChild: false })
    const root = host.querySelector('.wrapper')!

    expect(root.getAttribute('id')).toBeNull()
    expect(root.getAttribute('aria-labelledby')).toBeNull()
  })

  it('封装内部取到接线后 label 的 for 指得到真控件', () => {
    const host = mountField(() => h(Wrapper), { asChild: false })
    const input = host.querySelector('input')!
    const label = host.querySelector('label')!

    expect(input.id).not.toBe('')
    expect(label.getAttribute('for')).toBe(input.id)
    expect(input.getAttribute('aria-labelledby')).toBe(label.id)
  })
})

describe('字段控件的显式组合合同', () => {
  it.each(['empty', 'multiple', 'mixed'])('%s 结构必须报错，不能静默省略字段接线', async (shape) => {
    const nodes = shape === 'empty'
      ? []
      : shape === 'multiple'
        ? [h('input'), h('input')]
        : [createTextVNode('不能丢弃的内容'), h('input')]
    const app = createSSRApp(() => h(XhFieldRoot, null, () => h(XhFieldControl, null, () => nodes)))
    await expect(renderToString(app)).rejects.toThrow(/field.*asChild/)
  })

  it('单控件 Fragment 接收字段属性，不把属性落到片段上', async () => {
    const app = createSSRApp(() => h(XhFieldRoot, { required: true }, () =>
      h(XhFieldControl, null, () => h(Fragment, null, [h('input')]))))
    const html = await renderToString(app)
    expect(html).toMatch(/<input[^>]*data-scope="field"/)
    expect(html).toMatch(/<input[^>]*aria-required="true"/)
  })

  it('显式 asChild=false 允许作者自行分配多个节点', async () => {
    const app = createSSRApp(() => h(XhFieldRoot, null, () =>
      h(XhFieldControl, { asChild: false }, {
        default: (props: Record<string, unknown>) => [h('span', '说明'), h('input', props)],
      })))
    const html = await renderToString(app)
    expect(html).toContain('说明')
    expect(html).toMatch(/<input[^>]*data-scope="field"/)
  })
})
