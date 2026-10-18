// @vitest-environment jsdom
import { enUS } from '@xihan-ui/headless/locale'
import { allSuites, runConfigParity } from '@xihan-ui/testing'
import { afterEach, describe, it } from 'vitest'
import surface from '../../../../tooling/public-surface.json'
import { createReactHarness } from './harness'

afterEach(() => {
  document.body.innerHTML = ''
})

runConfigParity(createReactHarness(), allSuites, { describe, it }, {
  props: surface.componentProps,
  translations: enUS.translations,
  exempt: {
    'field:disabled': '字段只从外层字段与表单继承禁用，不读作用域禁用；字段集禁用时组内字段的标题与说明不变淡，待定',
    'select:disabled': '作用域禁用连列表里的滚动条一起压成禁用，实例 disabled 不传给它，待定',
    'format-input:disabled': '同 select：内嵌的格式选择列表里的滚动条被作用域禁用压住，待定',
    'tooltip:size': '没有经 withXhConfig，交给机器的 props 里没有 size 这个键，全局尺寸垫不进去',
    'tooltip:disabled': '交给机器的 props 里没有 disabled 这个键，作用域禁用压不进来',
    'popover:disabled': '交给 withXhConfig 的 props 里没有 disabled 这个键，作用域禁用压不进来',
    'menu:disabled': '交给 withXhConfig 的 props 里没有 disabled 这个键，作用域禁用压不进来',
    'download-trigger:disabled': '交给 withXhConfig 的 props 里没有 disabled 这个键，作用域禁用压不进来',
  },
})
