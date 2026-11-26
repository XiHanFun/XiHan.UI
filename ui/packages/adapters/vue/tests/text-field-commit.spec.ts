// @vitest-environment jsdom
// TextField 的回车提交在 Vue 上的接线：回车派 value-commit，输入法组合期间不派。
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { h, nextTick } from 'vue'
import { XhTextFieldRoot } from '../src'

afterEach(() => {
  document.body.innerHTML = ''
})

describe('text-field 回车提交', () => {
  it('回车派 value-commit，带当前值；输入法组合期间的回车不派', async () => {
    const commits: unknown[] = []
    const wrapper = mount(() => h(XhTextFieldRoot, { defaultValue: '曦寒', onValueCommit: (d: unknown) => commits.push(d) }), { attachTo: document.body })
    await nextTick()
    const input = (wrapper.element as HTMLElement).querySelector<HTMLInputElement>('[data-scope="text-field"][data-part="input"]')!
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, isComposing: true, keyCode: 229 }))
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    expect(commits).toEqual([{ value: '曦寒' }])
  })
})
