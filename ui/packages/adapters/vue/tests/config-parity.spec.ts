// @vitest-environment jsdom
import { enUS } from '@xihan-ui/headless/locale'
import { allSuites, runConfigParity } from '@xihan-ui/testing'
import { afterEach, describe, it } from 'vitest'
import surface from '../../../../tooling/public-surface.json'
import { createVueHarness } from './harness'

afterEach(() => {
  document.body.innerHTML = ''
})

runConfigParity(createVueHarness(), allSuites, { describe, it }, {
  props: surface.componentProps,
  translations: enUS.translations,
  exempt: {
    'field:disabled': '字段只从外层字段与表单继承禁用，不读作用域禁用；字段集禁用时组内字段的标题与说明不变淡，待定',
    'select:disabled': '作用域禁用连列表里的滚动条一起压成禁用，实例 disabled 不传给它，待定',
    'format-input:disabled': '同 select：内嵌的格式选择列表里的滚动条被作用域禁用压住，待定',
  },
})
