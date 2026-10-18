// @vitest-environment jsdom
import { enUS } from '@xihan-ui/headless/locale'
import { runConfigParity } from '@xihan-ui/testing'
import { afterEach, describe, it } from 'vitest'
import surface from '../../../../tooling/public-surface.json'
import { createWcHarness } from './harness'
import { wcSuites } from './suites'

afterEach(() => {
  document.body.innerHTML = ''
})

runConfigParity(createWcHarness(), wcSuites, { describe, it }, {
  props: surface.componentProps,
  translations: enUS.translations,
  exempt: {
    'field:disabled': '字段只从外层字段与表单继承禁用，不读作用域禁用；字段集禁用时组内字段的标题与说明不变淡，待定',
  },
})
