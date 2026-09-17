// @vitest-environment jsdom
//
// 组的 variant / tone / size 按整组禁用同一条路下发到每一段：段自己没写的取组值，写了的优先；
// 段因此自带 data-xh-action-variant，颜色由家族形态矩阵给出，皮肤不再向段灌 --xh-button-* 颜色槽。
// 共享的一致性套件核不到这一路：它的 fixture 里每一段是裸 <button>，不经过 XhButton。
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import { provideXhConfig, XhButton, XhButtonGroup } from '../src'

afterEach(() => {
  document.body.innerHTML = ''
})

function buttons(): HTMLButtonElement[] {
  return [...document.querySelectorAll<HTMLButtonElement>('[data-scope="button"][data-part="root"]')]
}

describe('按钮组的三轴下发到组内每一段', () => {
  it('组写了 variant / tone / size：未自写的段取组值，自写的段优先', () => {
    mount(defineComponent({
      setup: () => () => h(XhButtonGroup, { variant: 'outline', tone: 'danger', size: 'sm' }, () => [
        h(XhButton, null, () => '继承组'),
        h(XhButton, { variant: 'solid', tone: 'brand', size: 'lg' }, () => '自写'),
      ]),
    }), { attachTo: document.body })
    const [inherited, own] = buttons()
    expect(inherited!.getAttribute('data-xh-action-variant')).toBe('outline')
    expect(inherited!.getAttribute('data-variant')).toBe('outline')
    expect(inherited!.getAttribute('data-tone')).toBe('danger')
    expect(inherited!.getAttribute('data-size')).toBe('sm')
    expect(inherited!.getAttribute('data-xh-action-size')).toBe('sm')
    expect(own!.getAttribute('data-xh-action-variant')).toBe('solid')
    expect(own!.getAttribute('data-tone')).toBe('brand')
    expect(own!.getAttribute('data-size')).toBe('lg')
  })

  it('组没写 variant：段落组的缺省 subtle，不是单独一枚 Button 的 solid', () => {
    mount(defineComponent({
      setup: () => () => h('div', null, [
        h(XhButtonGroup, null, () => [h(XhButton, null, () => '组内')]),
        h(XhButton, null, () => '组外'),
      ]),
    }), { attachTo: document.body })
    const [grouped, standalone] = buttons()
    expect(grouped!.getAttribute('data-xh-action-variant')).toBe('subtle')
    expect(grouped!.getAttribute('data-tone')).toBeNull()
    expect(standalone!.getAttribute('data-xh-action-variant')).toBe('solid')
  })

  it('组的 size 压过全局配置的 size，段自写的又压过组', () => {
    mount(defineComponent({
      setup: () => {
        provideXhConfig({ size: 'lg' })
        return () => h(XhButtonGroup, { size: 'sm' }, () => [
          h(XhButton, null, () => '组值'),
          h(XhButton, { size: 'md' }, () => '自写'),
        ])
      },
    }), { attachTo: document.body })
    const [grouped, own] = buttons()
    expect(grouped!.getAttribute('data-size')).toBe('sm')
    expect(own!.getAttribute('data-size')).toBe('md')
  })
})
