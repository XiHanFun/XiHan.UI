// @vitest-environment jsdom
//
// 工具条条目的禁用随 disabled 来回切换：条目禁用、解禁，整条禁用再解禁后各条目回到自己的声明。
// 与 Web Components 的同名用例对照：那一端曾把自己写回的 aria-disabled 当作者声明读回去，条目解不开。
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { XhToolbarItem, XhToolbarRoot } from '../src'

afterEach(() => {
  document.body.innerHTML = ''
})

function flags(): string[] {
  return [...document.querySelectorAll('[data-scope="toolbar"][data-part="item"]')].map(item => item.getAttribute('aria-disabled') ?? '(无)')
}

describe('工具条条目的禁用随 disabled 切换', () => {
  it('条目禁用与解禁，整条禁用再解禁后回到各自的声明', async () => {
    const undo = ref(true)
    const redo = ref(false)
    const toolbar = ref(false)
    mount(defineComponent({
      setup: () => () => h(XhToolbarRoot, { 'aria-label': '编辑', 'disabled': toolbar.value }, () => [
        h(XhToolbarItem, { value: 'undo', disabled: undo.value }, () => '撤销'),
        h(XhToolbarItem, { value: 'redo', disabled: redo.value }, () => '重做'),
      ]),
    }), { attachTo: document.body })
    await nextTick()
    expect(flags()).toEqual(['true', 'false'])

    undo.value = false
    redo.value = true
    await nextTick()
    expect(flags()).toEqual(['false', 'true'])

    toolbar.value = true
    await nextTick()
    expect(flags()).toEqual(['true', 'true'])

    toolbar.value = false
    redo.value = false
    await nextTick()
    expect(flags()).toEqual(['false', 'false'])
  })
})
