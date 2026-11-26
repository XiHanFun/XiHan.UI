// @vitest-environment jsdom
// TagGroup 的表单出口在 Vue 上的接线：选中值按逗号拼成一串随表单提交。
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { h, nextTick } from 'vue'
import { XhTagGroupRoot } from '../src'

afterEach(() => {
  document.body.innerHTML = ''
})

function formOf(render: () => ReturnType<typeof h>): HTMLFormElement {
  const form = document.createElement('form')
  document.body.append(form)
  mount(render, { attachTo: form })
  return form
}

describe('tag-group name', () => {
  it('选中值按逗号拼成一串随表单提交', async () => {
    const form = formOf(() => h(XhTagGroupRoot, {
      name: 'stack',
      selectionMode: 'multiple',
      defaultValue: ['vue', 'svelte'],
      collection: [{ value: 'vue' }, { value: 'react' }, { value: 'svelte' }],
    }))
    await nextTick()
    expect([...new FormData(form).entries()]).toEqual([['stack', 'vue,svelte']])
  })
})
